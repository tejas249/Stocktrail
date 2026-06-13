import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/input";
import { connectDB, toClient } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Stock } from "@/lib/models/Stock";
import { AlertTriangle } from "lucide-react";

export default async function AlertsPage() {
  await connectDB();

  const [products, stocksRaw] = await Promise.all([
    Product.find().lean(),
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
      return { ...p, stocks, totalStock: stocks.reduce((sum, s) => sum + s.quantity, 0) };
    })
    .filter((p) => p.totalStock <= p.reorderThreshold);

  return (
    <div>
      <Topbar title="Low Stock Alerts" />
      <div className="mx-auto max-w-[1180px] space-y-6 p-6">

        {/* Summary banner */}
        {lowStock.length > 0 && (
          <div
            className="flex items-center gap-3 rounded-2xl border px-5 py-4"
            style={{ borderColor: "rgba(239,68,68,.25)", backgroundColor: "rgba(239,68,68,.06)" }}
          >
            <AlertTriangle size={18} style={{ color: "#ef4444", flexShrink: 0 }} />
            <p className="text-[13px] font-semibold" style={{ color: "#b91c1c" }}>
              {lowStock.length} product{lowStock.length !== 1 ? "s" : ""} at or below reorder threshold.
              Review and create purchase orders as needed.
            </p>
          </div>
        )}

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Products at or below reorder threshold</CardTitle>
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-bold"
              style={{ backgroundColor: lowStock.length > 0 ? "rgba(239,68,68,.1)" : "rgba(34,197,94,.1)", color: lowStock.length > 0 ? "#ef4444" : "#22c55e" }}
            >
              {lowStock.length} item{lowStock.length !== 1 ? "s" : ""}
            </span>
          </CardHeader>
          <CardContent className="p-0">
            {lowStock.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm" style={{ color: "var(--muted-raw)" }}>
                All products are above their reorder threshold.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Reorder At</TableHead>
                    <TableHead>Locations</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {toClient(lowStock).map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <p className="font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{p.name}</p>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-[12px]" style={{ color: "var(--muted-raw)" }}>{p.sku}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-[13px]" style={{ color: p.totalStock === 0 ? "var(--red)" : "var(--amber-c)" }}>
                        {p.totalStock}
                      </TableCell>
                      <TableCell className="text-right font-mono text-[13px]" style={{ color: "var(--muted-raw)" }}>
                        {p.reorderThreshold}
                      </TableCell>
                      <TableCell className="text-[12px]" style={{ color: "var(--muted-raw)" }}>
                        {p.stocks.map((s: any) => `${s.location?.name}: ${s.quantity}`).join(", ") || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.totalStock === 0 ? "destructive" : "warning"}>
                          {p.totalStock === 0 ? "Out of Stock" : "Low Stock"}
                        </Badge>
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
