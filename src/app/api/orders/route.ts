import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB, serialize } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { Customer } from "@/lib/models/Customer";
import { Stock } from "@/lib/models/Stock";
import { StockMovement } from "@/lib/models/StockMovement";
import { z } from "zod";

const schema = z.object({
  customerName: z.string().optional(),
  locationId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.coerce.number().int().positive(),
    price: z.coerce.number().min(0),
  })).min(1),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const orders = await Order.find()
    .populate("customer")
    .populate("items.product")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json(serialize({ orders }));
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

  const { customerName, locationId, items } = parsed.data;

  // verify stock availability
  for (const item of items) {
    const stock = await Stock.findOne({ product: item.productId, location: locationId });
    if (!stock || stock.quantity < item.quantity) {
      return NextResponse.json({ error: "INSUFFICIENT_STOCK" }, { status: 400 });
    }
  }

  let customerId: string | undefined;
  if (customerName) {
    const customer = await Customer.create({ name: customerName });
    customerId = customer._id.toString();
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const order = await Order.create({
    customer: customerId,
    status: "COMPLETED",
    totalAmount: total,
    items: items.map((i) => ({ product: i.productId, quantity: i.quantity, price: i.price })),
  });

  for (const item of items) {
    await Stock.findOneAndUpdate(
      { product: item.productId, location: locationId },
      { $inc: { quantity: -item.quantity } }
    );
    await StockMovement.create({
      product: item.productId,
      location: locationId,
      type: "OUT",
      quantity: item.quantity,
      reason: `Order #${order._id.toString().slice(-8)}`,
      user: session.user.id,
    });
  }

  return NextResponse.json(serialize({ order }), { status: 201 });
}
