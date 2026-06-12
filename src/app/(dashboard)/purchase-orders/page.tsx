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

export default async function PurchaseOrdersPage() {
  await connectDB();

  const [purchaseOrdersRaw, suppliers, products, locations] = await Promise.all([
    PurchaseOrder.find().populate("supplier").populate("items.product").sort({ createdAt: -1 }).lean(),
    Supplier.find().lean(),
    Product.find().select("name sku costPrice").lean(),
    Location.find().lean(),
  ]);

  const purchaseOrders = toClient(purchaseOrdersRaw);

  const statusVariant: Record<string, "default" | "success" | "warning" | "destructive"> = {
    DRAFT: "default",
    ORDERED: "warning",
    RECEIVED: "success",
    CANCELLED: "destructive",
  };

  return (
    <div>
      <Topbar title="Purchase Orders" />
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{purchaseOrders.length} purchase orders</p>
          <CreatePODialog suppliers={toClient(suppliers)} products={toClient(products)} />
        </div>

        <div className="space-y-4">
          {purchaseOrders.length === 0 && (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No purchase orders yet.</CardContent></Card>
          )}
          {purchaseOrders.map((po: any) => {
            const total = po.items.reduce((sum: number, i: any) => sum + i.quantity * i.costPrice, 0);
            return (
              <Card key={po.id}>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-foreground text-base font-semibold">{po.supplier?.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      PO #{po.id.slice(-8)} • {formatDate(po.createdAt)}
                      {po.expectedDate && ` • Expected ${formatDate(po.expectedDate)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[po.status]}>{po.status}</Badge>
                    <POActions po={po} locations={toClient(locations)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>Product</TableHead><TableHead>Quantity</TableHead><TableHead>Cost Price</TableHead><TableHead>Subtotal</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {po.items.map((i: any) => (
                        <TableRow key={i.id}>
                          <TableCell>{i.product?.name}</TableCell>
                          <TableCell>{i.quantity}</TableCell>
                          <TableCell>{formatCurrency(i.costPrice)}</TableCell>
                          <TableCell>{formatCurrency(i.quantity * i.costPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <p className="mt-2 text-right text-sm font-semibold">Total: {formatCurrency(total)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
