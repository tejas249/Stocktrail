import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB, serialize } from "@/lib/mongodb";
import { PurchaseOrder } from "@/lib/models/PurchaseOrder";
import { StockMovement } from "@/lib/models/StockMovement";
import { Stock } from "@/lib/models/Stock";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["DRAFT", "ORDERED", "RECEIVED", "CANCELLED"]),
  locationId: z.string().optional(), // required when status === RECEIVED
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { status, locationId } = parsed.data;

  const po = await PurchaseOrder.findById(params.id);
  if (!po) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (status === "RECEIVED") {
    if (!locationId) return NextResponse.json({ error: "locationId required to receive" }, { status: 400 });
    if (po.status === "RECEIVED") return NextResponse.json({ error: "Already received" }, { status: 400 });

    for (const item of po.items) {
      await StockMovement.create({
        product: item.product,
        location: locationId,
        type: "IN",
        quantity: item.quantity,
        reason: `Received PO #${po._id.toString().slice(-8)}`,
        user: session.user.id,
      });
      await Stock.findOneAndUpdate(
        { product: item.product, location: locationId },
        { $inc: { quantity: item.quantity } },
        { upsert: true }
      );
    }

    po.status = "RECEIVED";
    await po.save();
    return NextResponse.json({ success: true });
  }

  po.status = status;
  await po.save();
  return NextResponse.json(serialize({ purchaseOrder: po }));
}
