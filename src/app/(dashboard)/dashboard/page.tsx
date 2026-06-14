import { Topbar } from "@/components/layout/topbar";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { connectDB, toClient } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Stock } from "@/lib/models/Stock";
import { StockMovement } from "@/lib/models/StockMovement";
import { PurchaseOrder } from "@/lib/models/PurchaseOrder";
import "@/lib/models/Location";
import "@/lib/models/User";

export default async function DashboardPage() {
  await connectDB();

  const [totalProducts, products, allStocks, recentMovementsRaw, pendingPOs, openTransfers] = await Promise.all([
    Product.countDocuments(),
    Product.find().lean(),
    Stock.find().lean(),
    StockMovement.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("product")
      .populate("location")
      .populate("user")
      .lean(),
    PurchaseOrder.countDocuments({ status: { $in: ["DRAFT", "ORDERED"] } }),
    StockMovement.countDocuments({ type: { $in: ["TRANSFER_IN", "TRANSFER_OUT"] } }),
  ]);

  const recentMovements = toClient(recentMovementsRaw);

  const stocksByProduct = new Map<string, number>();
  for (const s of allStocks as any[]) {
    const key = s.product.toString();
    stocksByProduct.set(key, (stocksByProduct.get(key) || 0) + s.quantity);
  }

  let lowStockCount = 0;
  let totalStockValue = 0;
  const lowStockProducts: { name: string; qty: number; threshold: number }[] = [];

  for (const p of products as any[]) {
    const qty = stocksByProduct.get(p._id.toString()) || 0;
    totalStockValue += qty * (p.costPrice || 0);
    if (qty <= (p.reorderThreshold || 0)) {
      lowStockCount++;
      if (lowStockProducts.length < 5) {
        lowStockProducts.push({ name: p.name, qty, threshold: p.reorderThreshold || 0 });
      }
    }
  }

  const since90 = new Date();
  since90.setDate(since90.getDate() - 90);
  const movements90 = await StockMovement.find({ createdAt: { $gte: since90 } })
    .select("type quantity createdAt")
    .lean();

  const chartMap = new Map<string, { date: string; in: number; out: number }>();
  for (const m of movements90 as any[]) {
    const key = new Date(m.createdAt).toISOString().slice(0, 10);
    if (!chartMap.has(key)) chartMap.set(key, { date: key, in: 0, out: 0 });
    const entry = chartMap.get(key)!;
    if (m.type === "IN" || m.type === "TRANSFER_IN") entry.in += m.quantity;
    else entry.out += m.quantity;
  }
  const chartData = Array.from(chartMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <Topbar title="Dashboard" />
      <DashboardClient
        totalProducts={totalProducts}
        lowStockCount={lowStockCount}
        totalStockValue={totalStockValue}
        pendingPOs={pendingPOs}
        openTransfers={openTransfers}
        chartData={chartData}
        recentMovements={recentMovements}
        lowStockProducts={lowStockProducts}
      />
    </div>
  );
}
