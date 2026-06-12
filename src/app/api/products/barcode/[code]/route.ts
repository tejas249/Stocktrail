import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB, toClient } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Stock } from "@/lib/models/Stock";

export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const product = await Product.findOne({ barcode: params.code }).lean();
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const stocks = await Stock.find({ product: (product as any)._id }).populate("location").lean();

  return NextResponse.json(toClient({ product: { ...product, stocks } }));
}
