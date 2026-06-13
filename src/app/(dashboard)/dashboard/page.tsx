import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { connectDB, toClient } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Stock } from "@/lib/models/Stock";
import { StockMovement } from "@/lib/models/StockMovement";
import { PurchaseOrder } from "@/lib/models/PurchaseOrder";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, AlertTriangle, DollarSign, ClipboardList } from "lucide-react";
import { MovementsChart } from "@/components/dashboard/movements-chart";

export default async function DashboardPage() {
  await connectDB();

  const [totalProducts, products, allStocks, recentMovementsRaw, pendingPOs] = await Promise.all([
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
  ]);

  const recentMovements = toClient(recentMovementsRaw);

  const stocksByProduct = new Map<string, number>();
  for (const s of allStocks as any[]) {
    const key = s.product.toString();
    stocksByProduct.set(key, (stocksByProduct.get(key) || 0) + s.quantity);
  }

  let lowStockCount = 0;
  let totalStockValue = 0;
  for (const p of products as any[]) {
    const qty = stocksByProduct.get(p._id.toString()) || 0;
    if (qty <= p.reorderThreshold) lowStockCount++;
    totalStockValue += qty * p.costPrice;
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const movements = await StockMovement.find({ createdAt: { $gte: since } })
    .select("type quantity createdAt")
    .lean();

  const chartMap = new Map<string, { date: string; in: number; out: number }>();
  for (const m of movements as any[]) {
    const key = new Date(m.createdAt).toISOString().slice(0, 10);
    if (!chartMap.has(key)) chartMap.set(key, { date: key, in: 0, out: 0 });
    const entry = chartMap.get(key)!;
    if (m.type === "IN" || m.type === "TRANSFER_IN") entry.in += m.quantity;
    else entry.out += m.quantity;
  }
  const chartData = Array.from(chartMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  const movementBadge = (type: string) => {
    if (type === "IN") return "movement-in" as const;
    if (type === "TRANSFER_IN") return "movement-transfer-in" as const;
    if (type === "OUT") return "movement-out" as const;
    return "movement-transfer-out" as const;
  };

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="mx-auto max-w-[1180px] space-y-6 p-6">

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Products"
            value={String(totalProducts)}
            icon={Package}
            color="#7c3aed"
          />
          <StatCard
            title="Low Stock Items"
            value={String(lowStockCount)}
            delta={lowStockCount > 0 ? `${lowStockCount} need restocking` : "All levels healthy"}
            deltaPositive={lowStockCount === 0}
            icon={AlertTriangle}
            color="#f59e0b"
          />
          <StatCard
            title="Total Stock Value"
            value={formatCurrency(totalStockValue)}
            icon={DollarSign}
            color="#22c55e"
          />
          <StatCard
            title="Pending Purchase Orders"
            value={String(pendingPOs)}
            icon={ClipboardList}
            color="#9333ea"
          />
        </div>

        {/* Movements chart */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Stock Movements — Last 30 Days</CardTitle>
            <span className="text-[12px] font-medium" style={{ color: "var(--muted-raw)" }}>30D</span>
          </CardHeader>
          <CardContent>
            <MovementsChart data={chartData} />
          </CardContent>
        </Card>

        {/* Recent movements table */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Recent Stock Movements</CardTitle>
            <a href="/movements" className="text-[12px] font-semibold hover:underline" style={{ color: "var(--primary-hex)" }}>
              View all →
            </a>
          </CardHeader>
          <CardContent className="p-0">
            {recentMovements.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm" style={{ color: "var(--muted-raw)" }}>
                No stock movements yet. Record one from the Stock Movements page.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMovements.map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <p className="font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{m.product?.name}</p>
                        {m.product?.sku && (
                          <p className="font-mono text-[11px] mt-0.5" style={{ color: "var(--muted-2)" }}>{m.product.sku}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{ backgroundColor: "var(--line-2)", color: "var(--ink-2)" }}
                        >
                          {m.location?.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={movementBadge(m.type)}>{m.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-[13px]" style={{
                        color: (m.type === "IN" || m.type === "TRANSFER_IN") ? "var(--green)" : "var(--rose)"
                      }}>
                        {(m.type === "IN" || m.type === "TRANSFER_IN") ? "+" : "-"}{m.quantity}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                            style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)" }}
                          >
                            {m.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                          <span className="text-[13px]" style={{ color: "var(--ink-2)" }}>{m.user?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[12px]" style={{ color: "var(--muted-raw)" }}>
                        {formatDate(m.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
