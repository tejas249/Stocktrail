import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB, serialize } from "@/lib/mongodb";
import { StockMovement } from "@/lib/models/StockMovement";
import { Stock } from "@/lib/models/Stock";
import { z } from "zod";

const schema = z.object({
  productId: z.string(),
  fromLocationId: z.string(),
  toLocationId: z.string(),
  quantity: z.coerce.number().int().positive(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const transfers = await StockMovement.find({ type: { $in: ["TRANSFER_IN", "TRANSFER_OUT"] } })
    .populate("product")
    .populate("location")
    .populate("user")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json(serialize({ transfers }));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { productId, fromLocationId, toLocationId, quantity } = parsed.data;
  if (fromLocationId === toLocationId) {
    return NextResponse.json({ error: "Source and destination must differ" }, { status: 400 });
  }

  const fromStock = await Stock.findOne({ product: productId, location: fromLocationId });
  if (!fromStock || fromStock.quantity < quantity) {
    return NextResponse.json({ error: "INSUFFICIENT_STOCK" }, { status: 400 });
  }

  const outMovement = await StockMovement.create({
    product: productId,
    location: fromLocationId,
    type: "TRANSFER_OUT",
    quantity,
    user: session.user.id,
    reason: `Transfer to location ${toLocationId}`,
  });
  const inMovement = await StockMovement.create({
    product: productId,
    location: toLocationId,
    type: "TRANSFER_IN",
    quantity,
    user: session.user.id,
    reason: `Transfer from location ${fromLocationId}`,
    relatedTransferId: outMovement._id.toString(),
  });

  await Stock.findOneAndUpdate(
    { product: productId, location: fromLocationId },
    { $inc: { quantity: -quantity } }
  );
  await Stock.findOneAndUpdate(
    { product: productId, location: toLocationId },
    { $inc: { quantity: quantity } },
    { upsert: true }
  );

  return NextResponse.json(serialize({ outMovement, inMovement }), { status: 201 });
}
