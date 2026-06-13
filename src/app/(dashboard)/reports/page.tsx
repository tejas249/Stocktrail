import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Stock } from "@/lib/models/Stock";
import { StockMovement } from "@/lib/models/StockMovement";
import { PurchaseOrder } from "@/lib/models/PurchaseOrder";
import { formatCurrency } from "@/lib/utils";
import { TopProductsChart } from "@/components/reports/top-products-chart";
import { MonthlyVolumeChart } from "@/components/reports/monthly-volume-chart";
import { ExportButton } from "@/components/reports/export-button";
import { DollarSign, ArrowLeftRight, ClipboardList } from "lucide-react";

export default async function ReportsPage() {
  await connectDB();

  const [products, stocks, movements, purchaseOrders] = await Promise.all([
    Product.find().lean(),
    Stock.find().lean(),
    StockMovement.find().populate("product").sort({ createdAt: -1 }).limit(1000).lean(),
    PurchaseOrder.find().populate("supplier").lean(),
  ]);

  const movementByProduct = new Map<string, { name: string; out: number }>();
  for (const m of movements as any[]) {
    if (m.type !== "OUT") continue;
    const key = m.product?._id?.toString() || m.product?.toString();
    const entry = movementByProduct.get(key) || { name: m.product?.name || "Unknown", out: 0 };
    entry.out += m.quantity;
    movementByProduct.set(key, entry);
  }
  const sorted = Array.from(movementByProduct.values()).sort((a, b) => b.out - a.out);
  const fastest = sorted.slice(0, 10);
  const slowest = [...sorted].reverse().slice(0, 10);

  const monthlyMap = new Map<string, { month: string; in: number; out: number }>();
  for (const m of movements as any[]) {
    const key = new Date(m.createdAt).toISOString().slice(0, 7);
    if (!monthlyMap.has(key)) monthlyMap.set(key, { month: key, in: 0, out: 0 });
    const entry = monthlyMap.get(key)!;
    if (m.type === "IN" || m.type === "TRANSFER_IN") entry.in += m.quantity;
    else entry.out += m.quantity;
  }
  const monthlyData = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));

  const supplierMap = new Map<string, { name: string; orders: number; totalQty: number }>();
  for (const po of purchaseOrders as any[]) {
    const key = po.supplier?._id?.toString() || po.supplier?.toString();
    const entry = supplierMap.get(key) || { name: po.supplier?.name || "Unknown", orders: 0, totalQty: 0 };
    entry.orders += 1;
    entry.totalQty += po.items.reduce((s: number, i: any) => s + i.quantity, 0);
    supplierMap.set(key, entry);
  }
  const topSuppliers = Array.from(supplierMap.values()).sort((a, b) => b.orders - a.orders).slice(0, 10);

  const stockByProduct = new Map<string, number>();
  for (const s of stocks as any[]) {
    const key = s.product.toString();
    stockByProduct.set(key, (stockByProduct.get(key) || 0) + s.quantity);
  }
  const totalStockValue = (products as any[]).reduce((sum, p) => {
    return sum + (stockByProduct.get(p._id.toString()) || 0) * p.costPrice;
  }, 0);

  return (
    <div>
      <Topbar title="Reports" />
      <div className="mx-auto max-w-[1180px] space-y-6 p-6">

        <div className="flex justify-end">
          <ExportButton />
        </div>

        {/* Summary KPIs */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Current Stock Value" value={formatCurrency(totalStockValue)} icon={DollarSign} color="#22c55e" />
          <StatCard title="Total Movements Recorded" value={String(movements.length)} icon={ArrowLeftRight} color="#7c3aed" />
          <StatCard title="Total Purchase Orders" value={String(purchaseOrders.length)} icon={ClipboardList} color="#9333ea" />
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Fastest Moving Products</CardTitle>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--muted-raw)" }}>By units out</p>
            </CardHeader>
            <CardContent className="pt-0">
              <TopProductsChart data={fastest} color="#7c3aed" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Slowest Moving Products</CardTitle>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--muted-raw)" }}>Lowest outbound volume</p>
            </CardHeader>
            <CardContent className="pt-0">
              <TopProductsChart data={slowest} color="#f43f5e" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Stock In / Out Volume</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <MonthlyVolumeChart data={monthlyData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Suppliers by PO Volume</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {topSuppliers.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm" style={{ color: "var(--muted-raw)" }}>
                No purchase order data yet.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--line-2)", backgroundColor: "var(--bg)" }}>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>Supplier</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>Orders</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>Total Units</th>
                  </tr>
                </thead>
                <tbody>
                  {topSuppliers.map((s, i) => (
                    <tr key={s.name} style={{ borderBottom: i < topSuppliers.length - 1 ? "1px solid var(--line-2)" : undefined }}>
                      <td className="px-6 py-3 font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{s.name}</td>
                      <td className="px-6 py-3 text-right font-mono text-[13px]" style={{ color: "var(--ink-2)" }}>{s.orders}</td>
                      <td className="px-6 py-3 text-right font-mono font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{s.totalQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
