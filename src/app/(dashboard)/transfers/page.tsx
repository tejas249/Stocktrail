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
      <div className="mx-auto max-w-[1180px] space-y-6 p-6">

        <Card>
          <CardHeader>
            <CardTitle>New Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <TransferForm products={toClient(products)} locations={toClient(locations)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Transfer History</CardTitle>
            <span className="text-[12px] font-medium" style={{ color: "var(--muted-raw)" }}>Last 50</span>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <p className="font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{t.product?.name}</p>
                      {t.product?.sku && (
                        <p className="font-mono text-[11px] mt-0.5" style={{ color: "var(--muted-2)" }}>{t.product.sku}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: "var(--line-2)", color: "var(--ink-2)" }}>
                        {t.location?.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.type === "TRANSFER_IN" ? "movement-transfer-in" : "movement-transfer-out"}>
                        {t.type === "TRANSFER_IN" ? "Received" : "Sent"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-[13px]" style={{
                      color: t.type === "TRANSFER_IN" ? "var(--sky)" : "var(--amber-c)"
                    }}>
                      {t.type === "TRANSFER_IN" ? "+" : "-"}{t.quantity}
                    </TableCell>
                    <TableCell className="text-[13px]" style={{ color: "var(--ink-2)" }}>{t.user?.name}</TableCell>
                    <TableCell className="text-[12px]" style={{ color: "var(--muted-raw)" }}>{formatDate(t.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {transfers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm" style={{ color: "var(--muted-raw)" }}>
                      No transfers yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
