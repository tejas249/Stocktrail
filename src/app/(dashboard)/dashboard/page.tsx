import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/input";
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

  // movements over last 30 days, grouped by day
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

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Total Stock Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalStockValue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Pending Purchase Orders</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPOs}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground text-base font-semibold">Stock Movements (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <MovementsChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground text-base font-semibold">Recent Stock Movements</CardTitle>
          </CardHeader>
          <CardContent>
            {recentMovements.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No stock movements yet. Record one from the Stock Movements page.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMovements.map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.product?.name}</TableCell>
                      <TableCell>{m.location?.name}</TableCell>
                      <TableCell>
                        <Badge variant={m.type === "IN" || m.type === "TRANSFER_IN" ? "success" : "warning"}>
                          {m.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{m.quantity}</TableCell>
                      <TableCell>{m.user?.name}</TableCell>
                      <TableCell>{formatDate(m.createdAt)}</TableCell>
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
