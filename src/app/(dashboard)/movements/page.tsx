import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/input";
import { connectDB, toClient } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Location } from "@/lib/models/Location";
import { StockMovement } from "@/lib/models/StockMovement";
import { formatDate } from "@/lib/utils";
import { RecordMovementForm } from "@/components/movements/record-movement-form";

export default async function MovementsPage() {
  await connectDB();

  const [products, locations, movementsRaw] = await Promise.all([
    Product.find().select("name sku").lean(),
    Location.find().lean(),
    StockMovement.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("product")
      .populate("location")
      .populate("user")
      .lean(),
  ]);

  const movements = toClient(movementsRaw);

  return (
    <div>
      <Topbar title="Stock Movements" />
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader><CardTitle className="text-foreground text-base font-semibold">Record Movement</CardTitle></CardHeader>
          <CardContent>
            <RecordMovementForm products={toClient(products)} locations={toClient(locations)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-foreground text-base font-semibold">Movement History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.product?.name}</TableCell>
                    <TableCell>{m.location?.name}</TableCell>
                    <TableCell>
                      <Badge variant={m.type === "IN" || m.type === "TRANSFER_IN" ? "success" : "warning"}>{m.type}</Badge>
                    </TableCell>
                    <TableCell>{m.quantity}</TableCell>
                    <TableCell className="text-muted-foreground">{m.reason || "—"}</TableCell>
                    <TableCell>{m.user?.name}</TableCell>
                    <TableCell>{formatDate(m.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {movements.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No movements recorded yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
