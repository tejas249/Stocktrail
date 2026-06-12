import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/input";
import { connectDB, toClient } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { Location } from "@/lib/models/Location";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreateOrderDialog } from "@/components/orders/create-order-dialog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  await connectDB();

  const [ordersRaw, products, locations] = await Promise.all([
    Order.find().populate("customer").populate("items.product").sort({ createdAt: -1 }).limit(100).lean(),
    Product.find().select("name sku price").lean(),
    Location.find().lean(),
  ]);

  const orders = toClient(ordersRaw);
  const canCreate = session?.user.role !== "VIEWER";

  return (
    <div>
      <Topbar title="Orders" />
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{orders.length} orders</p>
          {canCreate && <CreateOrderDialog products={toClient(products)} locations={toClient(locations)} />}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">#{o.id.slice(-8)}</TableCell>
                    <TableCell>{o.customer?.name || "Walk-in"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {o.items.map((i: any) => `${i.product?.name} x${i.quantity}`).join(", ")}
                    </TableCell>
                    <TableCell>{formatCurrency(o.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={o.status === "COMPLETED" ? "success" : o.status === "CANCELLED" ? "destructive" : "warning"}>
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(o.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No orders yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
