import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB, serialize } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Stock } from "@/lib/models/Stock";
import { StockMovement } from "@/lib/models/StockMovement";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const product = await Product.findById(params.id).populate("supplier").lean();
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [stocks, movements] = await Promise.all([
    Stock.find({ product: params.id }).populate("location").lean(),
    StockMovement.find({ product: params.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("location")
      .populate("user")
      .lean(),
  ]);

  return NextResponse.json(serialize({ product: { ...product, stocks, movements } }));
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const body = await req.json();
  const product = await Product.findByIdAndUpdate(params.id, body, { new: true }).lean();
  return NextResponse.json(serialize({ product }));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  await Product.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
