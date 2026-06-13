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

type BadgeVariant = "default" | "success" | "warning" | "destructive";

const orderStatusVariant = (status: string): BadgeVariant => {
  if (status === "COMPLETED") return "success";
  if (status === "CANCELLED") return "destructive";
  return "warning";
};

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
      <div className="mx-auto max-w-[1180px] space-y-5 p-6">

        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium" style={{ color: "var(--muted-raw)" }}>
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
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
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono font-semibold text-[12px]" style={{ color: "var(--primary-hex)" }}>
                      #{o.id.slice(-8)}
                    </TableCell>
                    <TableCell className="font-medium text-[13px]" style={{ color: "var(--ink)" }}>
                      {o.customer?.name || "Walk-in"}
                    </TableCell>
                    <TableCell className="text-[12px]" style={{ color: "var(--muted-raw)" }}>
                      {o.items.map((i: any) => `${i.product?.name} ×${i.quantity}`).join(", ")}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-[13px]" style={{ color: "var(--ink)" }}>
                      {formatCurrency(o.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={orderStatusVariant(o.status)}>{o.status}</Badge>
                    </TableCell>
                    <TableCell className="text-[12px]" style={{ color: "var(--muted-raw)" }}>
                      {formatDate(o.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm" style={{ color: "var(--muted-raw)" }}>
                      No orders yet.
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
