import { connectDB, toClient } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Stock } from "@/lib/models/Stock";
import { Supplier } from "@/lib/models/Supplier";
import "@/lib/models/Location";
import { formatCurrency } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProductsPageClient } from "@/components/pages/products-client";

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);
  await connectDB();

  const [productsRaw, suppliersRaw, stocksRaw] = await Promise.all([
    Product.find().populate("supplier").sort({ createdAt: -1 }).lean(),
    Supplier.find().lean(),
    Stock.find().populate("location").lean(),
  ]);

  const stocksByProduct = new Map<string, any[]>();
  for (const s of stocksRaw as any[]) {
    const key = s.product.toString();
    if (!stocksByProduct.has(key)) stocksByProduct.set(key, []);
    stocksByProduct.get(key)!.push(s);
  }

  const products = (productsRaw as any[]).map((p) => ({
    ...p,
    stocks: stocksByProduct.get(p._id.toString()) || [],
  }));

  let lowStockCount = 0;
  let totalStockValue = 0;
  let totalStockQty = 0;
  for (const p of products) {
    const qty = (p.stocks as any[]).reduce((s: number, st: any) => s + st.quantity, 0);
    totalStockQty += qty;
    totalStockValue += qty * (p.costPrice || 0);
    if (qty <= (p.reorderThreshold || 0)) lowStockCount++;
  }

  const canEdit = session?.user.role !== "VIEWER";

  return (
    <ProductsPageClient
      products={toClient(products)}
      suppliers={toClient(suppliersRaw)}
      lowStockCount={lowStockCount}
      totalStockValue={totalStockValue}
      totalStockQty={totalStockQty}
      canEdit={canEdit}
    />
  );
}
