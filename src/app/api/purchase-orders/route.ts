import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB, serialize } from "@/lib/mongodb";
import { PurchaseOrder } from "@/lib/models/PurchaseOrder";
import { z } from "zod";

const schema = z.object({
  supplierId: z.string(),
  expectedDate: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.coerce.number().int().positive(),
    costPrice: z.coerce.number().min(0),
  })).min(1),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const purchaseOrders = await PurchaseOrder.find()
    .populate("supplier")
    .populate("items.product")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(serialize({ purchaseOrders }));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { supplierId, expectedDate, items } = parsed.data;

  const po = await PurchaseOrder.create({
    supplier: supplierId,
    expectedDate: expectedDate ? new Date(expectedDate) : undefined,
    status: "DRAFT",
    items: items.map((i) => ({ product: i.productId, quantity: i.quantity, costPrice: i.costPrice })),
  });

  return NextResponse.json(serialize({ purchaseOrder: po }), { status: 201 });
}
