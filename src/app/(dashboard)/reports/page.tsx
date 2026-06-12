import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Stock } from "@/lib/models/Stock";
import { StockMovement } from "@/lib/models/StockMovement";
import { PurchaseOrder } from "@/lib/models/PurchaseOrder";
import { formatCurrency } from "@/lib/utils";
import { TopProductsChart } from "@/components/reports/top-products-chart";
import { MonthlyVolumeChart } from "@/components/reports/monthly-volume-chart";
import { ExportButton } from "@/components/reports/export-button";

export default async function ReportsPage() {
  await connectDB();

  const [products, stocks, movements, purchaseOrders] = await Promise.all([
    Product.find().lean(),
    Stock.find().lean(),
    StockMovement.find().populate("product").sort({ createdAt: -1 }).limit(1000).lean(),
    PurchaseOrder.find().populate("supplier").lean(),
  ]);

  // Fastest / slowest moving: total OUT quantity per product
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

  // Monthly in/out volume
  const monthlyMap = new Map<string, { month: string; in: number; out: number }>();
  for (const m of movements as any[]) {
    const key = new Date(m.createdAt).toISOString().slice(0, 7);
    if (!monthlyMap.has(key)) monthlyMap.set(key, { month: key, in: 0, out: 0 });
    const entry = monthlyMap.get(key)!;
    if (m.type === "IN" || m.type === "TRANSFER_IN") entry.in += m.quantity;
    else entry.out += m.quantity;
  }
  const monthlyData = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));

  // Top suppliers by PO volume
  const supplierMap = new Map<string, { name: string; orders: number; totalQty: number }>();
  for (const po of purchaseOrders as any[]) {
    const key = po.supplier?._id?.toString() || po.supplier?.toString();
    const entry = supplierMap.get(key) || { name: po.supplier?.name || "Unknown", orders: 0, totalQty: 0 };
    entry.orders += 1;
    entry.totalQty += po.items.reduce((s: number, i: any) => s + i.quantity, 0);
    supplierMap.set(key, entry);
  }
  const topSuppliers = Array.from(supplierMap.values()).sort((a, b) => b.orders - a.orders).slice(0, 10);

  // Stock value snapshot
  const stockByProduct = new Map<string, number>();
  for (const s of stocks as any[]) {
    const key = s.product.toString();
    stockByProduct.set(key, (stockByProduct.get(key) || 0) + s.quantity);
  }
  const totalStockValue = (products as any[]).reduce((sum, p) => {
    const qty = stockByProduct.get(p._id.toString()) || 0;
    return sum + qty * p.costPrice;
  }, 0);

  return (
    <div>
      <Topbar title="Reports" />
      <div className="space-y-6 p-6">
        <div className="flex justify-end">
          <ExportButton />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Current Stock Value</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{formatCurrency(totalStockValue)}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total Movements Recorded</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{movements.length}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total Purchase Orders</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{purchaseOrders.length}</CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-foreground text-base font-semibold">Fastest Moving Products (by units sold/out)</CardTitle></CardHeader>
            <CardContent><TopProductsChart data={fastest} color="#22c55e" /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-foreground text-base font-semibold">Slowest Moving Products</CardTitle></CardHeader>
            <CardContent><TopProductsChart data={slowest} color="#ef4444" /></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-foreground text-base font-semibold">Monthly Stock In/Out Volume</CardTitle></CardHeader>
          <CardContent><MonthlyVolumeChart data={monthlyData} /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-foreground text-base font-semibold">Top Suppliers by PO Volume</CardTitle></CardHeader>
          <CardContent>
            {topSuppliers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No purchase order data yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">Supplier</th>
                    <th className="py-2">Orders</th>
                    <th className="py-2">Total Units Ordered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topSuppliers.map((s) => (
                    <tr key={s.name}>
                      <td className="py-2 font-medium">{s.name}</td>
                      <td className="py-2">{s.orders}</td>
                      <td className="py-2">{s.totalQty}</td>
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
