import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB, serialize } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Stock } from "@/lib/models/Stock";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  barcode: z.string().optional(),
  reorderThreshold: z.coerce.number().int().min(0).default(0),
  price: z.coerce.number().min(0).default(0),
  costPrice: z.coerce.number().min(0).default(0),
  supplierId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const category = searchParams.get("category") || undefined;
  const page = Number(searchParams.get("page") || "1");
  const pageSize = 10;

  const filter: any = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { sku: { $regex: q, $options: "i" } },
    ];
  }
  if (category) filter.category = category;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("supplier")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Product.countDocuments(filter),
  ]);

  // attach stocks for each product
  const productIds = products.map((p: any) => p._id);
  const stocks = await Stock.find({ product: { $in: productIds } }).populate("location").lean();
  const withStocks = products.map((p: any) => ({
    ...p,
    stocks: stocks.filter((s: any) => s.product._id.toString() === p._id.toString()),
  }));

  return NextResponse.json(serialize({ products: withStocks, total, page, pageSize }));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { supplierId, ...rest } = parsed.data;
  const product = await Product.create({ ...rest, supplier: supplierId || undefined });

  return NextResponse.json(serialize({ product }), { status: 201 });
}
