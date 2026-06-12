import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Stock } from "@/lib/models/Stock";
import { StockMovement } from "@/lib/models/StockMovement";

function toCsv(rows: Record<string, any>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => JSON.stringify(row[h] ?? "")).join(","));
  }
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "products";

  let csv = "";
  let filename = "export.csv";

  if (type === "products") {
    const products = await Product.find().populate("supplier").lean();
    const productIds = products.map((p: any) => p._id);
    const stocks = await Stock.find({ product: { $in: productIds } }).lean();

    csv = toCsv(
      products.map((p: any) => ({
        name: p.name,
        sku: p.sku,
        category: p.category || "",
        barcode: p.barcode || "",
        price: p.price,
        costPrice: p.costPrice,
        reorderThreshold: p.reorderThreshold,
        totalStock: stocks
          .filter((s: any) => s.product.toString() === p._id.toString())
          .reduce((sum: number, s: any) => sum + s.quantity, 0),
        supplier: p.supplier?.name || "",
      }))
    );
    filename = "products.csv";
  } else if (type === "movements") {
    const movements = await StockMovement.find()
      .populate("product")
      .populate("location")
      .populate("user")
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean();

    csv = toCsv(
      movements.map((m: any) => ({
        date: m.createdAt.toISOString(),
        product: m.product?.name || "",
        sku: m.product?.sku || "",
        location: m.location?.name || "",
        type: m.type,
        quantity: m.quantity,
        reason: m.reason || "",
        user: m.user?.name || "",
      }))
    );
    filename = "stock-movements.csv";
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
