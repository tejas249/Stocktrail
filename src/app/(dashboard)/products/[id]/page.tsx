import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/input";
import { connectDB, toClient } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Stock } from "@/lib/models/Stock";
import { StockMovement } from "@/lib/models/StockMovement";
import "@/lib/models/Location";
import "@/lib/models/User";
import "@/lib/models/Supplier";
import { formatCurrency, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  await connectDB();

  const productRaw = await Product.findById(params.id).populate("supplier").lean();
  if (!productRaw) notFound();

  const [stocksRaw, movementsRaw] = await Promise.all([
    Stock.find({ product: params.id }).populate("location").lean(),
    StockMovement.find({ product: params.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("location")
      .populate("user")
      .lean(),
  ]);

  const product = toClient({ ...(productRaw as any), stocks: stocksRaw, movements: movementsRaw });
  const totalStock = product.stocks.reduce((sum: number, s: any) => sum + s.quantity, 0);

  return (
    <div>
      <Topbar title={product.name} />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>SKU</CardTitle></CardHeader>
            <CardContent className="text-lg font-semibold">{product.sku}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total Stock</CardTitle></CardHeader>
            <CardContent className="text-lg font-semibold">
              {totalStock}
              {totalStock <= product.reorderThreshold && (
                <Badge variant="warning" className="ml-2">Low</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Sale Price / Cost</CardTitle></CardHeader>
            <CardContent className="text-lg font-semibold">
              {formatCurrency(product.price)} / {formatCurrency(product.costPrice)}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-foreground text-base font-semibold">Stock by Location</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Location</TableHead><TableHead>Quantity</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {product.stocks.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.location?.name}</TableCell>
                    <TableCell>{s.quantity}</TableCell>
                  </TableRow>
                ))}
                {product.stocks.length === 0 && (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-6">No stock recorded yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {product.variants?.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-foreground text-base font-semibold">Variants</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>SKU</TableHead><TableHead>Size</TableHead><TableHead>Color</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {product.variants.map((v: any) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.sku}</TableCell>
                      <TableCell>{v.size || "—"}</TableCell>
                      <TableCell>{v.color || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-foreground text-base font-semibold">Movement History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.movements.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Badge variant={m.type === "IN" || m.type === "TRANSFER_IN" ? "success" : "warning"}>{m.type}</Badge>
                    </TableCell>
                    <TableCell>{m.location?.name}</TableCell>
                    <TableCell>{m.quantity}</TableCell>
                    <TableCell className="text-muted-foreground">{m.reason || "—"}</TableCell>
                    <TableCell>{m.user?.name}</TableCell>
                    <TableCell>{formatDate(m.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {product.movements.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No movements recorded yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
