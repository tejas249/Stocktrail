import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/input";
import { connectDB, toClient } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Stock } from "@/lib/models/Stock";

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
      return {
        ...p,
        stocks,
        totalStock: stocks.reduce((sum, s) => sum + s.quantity, 0),
      };
    })
    .filter((p) => p.totalStock <= p.reorderThreshold);

  return (
    <div>
      <Topbar title="Low Stock Alerts" />
      <div className="space-y-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground text-base font-semibold">
              Products at or below reorder threshold
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                🎉 All products are above their reorder threshold.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reorder Threshold</TableHead>
                    <TableHead>Locations</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {toClient(lowStock).map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                      <TableCell>{p.totalStock}</TableCell>
                      <TableCell>{p.reorderThreshold}</TableCell>
                      <TableCell className="text-muted-foreground">
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
