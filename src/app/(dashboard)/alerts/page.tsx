import { connectDB, toClient } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Stock } from "@/lib/models/Stock";
import "@/lib/models/Supplier";
import "@/lib/models/Location";
import { AlertsPageClient } from "@/components/pages/alerts-client";

export default async function AlertsPage() {
  await connectDB();

  const [products, stocksRaw] = await Promise.all([
    Product.find().populate("supplier").lean(),
    Stock.find().populate("location").lean(),
  ]);

  const stocksByProduct = new Map<string, any[]>();
  for (const s of stocksRaw as any[]) {
    const key = s.product.toString();
    if (!stocksByProduct.has(key)) stocksByProduct.set(key, []);
    stocksByProduct.get(key)!.push(s);
  }

  const lowStock = (products as any[])
    .map((p) => {
      const stocks = stocksByProduct.get(p._id.toString()) || [];
      return { ...p, stocks, totalStock: stocks.reduce((sum: number, s: any) => sum + s.quantity, 0) };
    })
    .filter((p) => p.totalStock <= p.reorderThreshold);

  return <AlertsPageClient lowStock={toClient(lowStock)} />;
}
