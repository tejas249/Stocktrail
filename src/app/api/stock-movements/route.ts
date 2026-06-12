import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB, serialize } from "@/lib/mongodb";
import { StockMovement } from "@/lib/models/StockMovement";
import { Stock } from "@/lib/models/Stock";
import { z } from "zod";

const movementSchema = z.object({
  productId: z.string(),
  locationId: z.string(),
  type: z.enum(["IN", "OUT", "TRANSFER_IN", "TRANSFER_OUT"]),
  quantity: z.coerce.number().int().positive(),
  reason: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId") || undefined;
  const locationId = searchParams.get("locationId") || undefined;
  const type = searchParams.get("type") || undefined;

  const filter: any = {};
  if (productId) filter.product = productId;
  if (locationId) filter.location = locationId;
  if (type) filter.type = type;

  const movements = await StockMovement.find(filter)
    .populate("product")
    .populate("location")
    .populate("user")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json(serialize({ movements }));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const body = await req.json();
  const parsed = movementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { productId, locationId, type, quantity, reason } = parsed.data;
  const isInbound = type === "IN" || type === "TRANSFER_IN";

  if (!isInbound) {
    const existingStock = await Stock.findOne({ product: productId, location: locationId });
    if (!existingStock || existingStock.quantity < quantity) {
      return NextResponse.json({ error: "INSUFFICIENT_STOCK" }, { status: 400 });
    }
  }

  const movement = await StockMovement.create({
    product: productId,
    location: locationId,
    type,
    quantity,
    reason,
    user: session.user.id,
  });

  const stock = await Stock.findOneAndUpdate(
    { product: productId, location: locationId },
    { $inc: { quantity: isInbound ? quantity : -quantity } },
    { upsert: true, new: true }
  );

  return NextResponse.json(serialize({ movement, stock }), { status: 201 });
}
