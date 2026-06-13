import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/input";
import { connectDB, toClient } from "@/lib/mongodb";
import { PurchaseOrder } from "@/lib/models/PurchaseOrder";
import { Supplier } from "@/lib/models/Supplier";
import { Product } from "@/lib/models/Product";
import { Location } from "@/lib/models/Location";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreatePODialog } from "@/components/purchase-orders/create-po-dialog";
import { POActions } from "@/components/purchase-orders/po-actions";

type BadgeVariant = "default" | "success" | "warning" | "destructive";

const statusVariant: Record<string, BadgeVariant> = {
  DRAFT: "default",
  ORDERED: "warning",
  RECEIVED: "success",
  CANCELLED: "destructive",
};

export default async function PurchaseOrdersPage() {
  await connectDB();

  const [purchaseOrdersRaw, suppliers, products, locations] = await Promise.all([
    PurchaseOrder.find().populate("supplier").populate("items.product").sort({ createdAt: -1 }).lean(),
    Supplier.find().lean(),
    Product.find().select("name sku costPrice").lean(),
    Location.find().lean(),
  ]);

  const purchaseOrders = toClient(purchaseOrdersRaw);

  return (
    <div>
      <Topbar title="Purchase Orders" />
      <div className="mx-auto max-w-[1180px] space-y-5 p-6">

        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium" style={{ color: "var(--muted-raw)" }}>
            {purchaseOrders.length} purchase order{purchaseOrders.length !== 1 ? "s" : ""}
          </p>
          <CreatePODialog suppliers={toClient(suppliers)} products={toClient(products)} />
        </div>

        <div className="space-y-4">
          {purchaseOrders.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm" style={{ color: "var(--muted-raw)" }}>
                No purchase orders yet.
              </CardContent>
            </Card>
          )}
          {purchaseOrders.map((po: any) => {
            const total = po.items.reduce((sum: number, i: any) => sum + i.quantity * i.costPrice, 0);
            return (
              <Card key={po.id}>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <CardTitle>{po.supplier?.name}</CardTitle>
                      <Badge variant={statusVariant[po.status]}>{po.status}</Badge>
                    </div>
                    <p className="mt-1 text-[12px]" style={{ color: "var(--muted-raw)" }}>
                      PO #{po.id.slice(-8)} · {formatDate(po.createdAt)}
                      {po.expectedDate && ` · Expected ${formatDate(po.expectedDate)}`}
                    </p>
                  </div>
                  <POActions po={po} locations={toClient(locations)} />
                </CardHeader>
                <CardContent className="p-0 pb-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Cost</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {po.items.map((i: any) => (
                        <TableRow key={i.id}>
                          <TableCell className="font-medium text-[13px]" style={{ color: "var(--ink)" }}>{i.product?.name}</TableCell>
                          <TableCell className="text-right font-mono text-[13px]" style={{ color: "var(--ink-2)" }}>{i.quantity}</TableCell>
                          <TableCell className="text-right font-mono text-[13px]" style={{ color: "var(--ink-2)" }}>{formatCurrency(i.costPrice)}</TableCell>
                          <TableCell className="text-right font-mono font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{formatCurrency(i.quantity * i.costPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-2 flex justify-end px-4">
                    <p className="text-[13px] font-bold" style={{ color: "var(--ink)" }}>
                      Total:&nbsp;
                      <span style={{ color: "var(--primary-hex)" }}>{formatCurrency(total)}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </div>
  );
}
