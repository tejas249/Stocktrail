import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/input";
import { connectDB, toClient } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Location } from "@/lib/models/Location";
import { StockMovement } from "@/lib/models/StockMovement";
import { formatDate } from "@/lib/utils";
import { TransferForm } from "@/components/transfers/transfer-form";

export default async function TransfersPage() {
  await connectDB();

  const [products, locations, transfersRaw] = await Promise.all([
    Product.find().select("name sku").lean(),
    Location.find().lean(),
    StockMovement.find({ type: { $in: ["TRANSFER_IN", "TRANSFER_OUT"] } })
      .populate("product")
      .populate("location")
      .populate("user")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
  ]);

  const transfers = toClient(transfersRaw);

  return (
    <div>
      <Topbar title="Stock Transfers" />
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader><CardTitle className="text-foreground text-base font-semibold">New Transfer</CardTitle></CardHeader>
          <CardContent>
            <TransferForm products={toClient(products)} locations={toClient(locations)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-foreground text-base font-semibold">Transfer History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.product?.name}</TableCell>
                    <TableCell>{t.location?.name}</TableCell>
                    <TableCell>
                      <Badge variant={t.type === "TRANSFER_IN" ? "success" : "warning"}>
                        {t.type === "TRANSFER_IN" ? "Received" : "Sent"}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.quantity}</TableCell>
                    <TableCell>{t.user?.name}</TableCell>
                    <TableCell>{formatDate(t.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {transfers.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No transfers yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
