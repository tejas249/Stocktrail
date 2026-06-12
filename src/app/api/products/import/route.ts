import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { z } from "zod";

const rowSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().optional(),
  barcode: z.string().optional(),
  price: z.coerce.number().min(0).default(0),
  costPrice: z.coerce.number().min(0).default(0),
  reorderThreshold: z.coerce.number().int().min(0).default(0),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const body = await req.json();
  const rows = z.array(rowSchema).safeParse(body.rows);
  if (!rows.success) return NextResponse.json({ error: rows.error.flatten() }, { status: 400 });

  let created = 0;
  let skipped = 0;

  for (const row of rows.data) {
    const exists = await Product.findOne({ sku: row.sku });
    if (exists) { skipped++; continue; }
    await Product.create({ ...row, barcode: row.barcode || undefined, category: row.category || undefined });
    created++;
  }

  return NextResponse.json({ created, skipped });
}
