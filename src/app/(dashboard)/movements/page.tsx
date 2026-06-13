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

const movementBadge = (type: string) => {
  if (type === "IN") return "movement-in" as const;
  if (type === "TRANSFER_IN") return "movement-transfer-in" as const;
  if (type === "OUT") return "movement-out" as const;
  return "movement-transfer-out" as const;
};

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
      <div className="mx-auto max-w-[1180px] space-y-6 p-6">

        <Card>
          <CardHeader>
            <CardTitle>Record Movement</CardTitle>
          </CardHeader>
          <CardContent>
            <RecordMovementForm products={toClient(products)} locations={toClient(locations)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Movement History</CardTitle>
            <span className="text-[12px] font-medium" style={{ color: "var(--muted-raw)" }}>Last 50</span>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <p className="font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{m.product?.name}</p>
                      {m.product?.sku && (
                        <p className="font-mono text-[11px] mt-0.5" style={{ color: "var(--muted-2)" }}>{m.product.sku}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: "var(--line-2)", color: "var(--ink-2)" }}>
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
                    <TableCell className="text-[13px]" style={{ color: "var(--muted-raw)" }}>{m.reason || "—"}</TableCell>
                    <TableCell className="text-[13px]" style={{ color: "var(--ink-2)" }}>{m.user?.name}</TableCell>
                    <TableCell className="text-[12px]" style={{ color: "var(--muted-raw)" }}>{formatDate(m.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {movements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm" style={{ color: "var(--muted-raw)" }}>
                      No movements recorded yet
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
