import { connectDB, toClient } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { Location } from "@/lib/models/Location";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrdersPageClient } from "@/components/pages/orders-client";

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

  const completedCount = orders.filter((o: any) => o.status === "COMPLETED").length;
  const pendingCount   = orders.filter((o: any) => o.status !== "COMPLETED" && o.status !== "CANCELLED").length;
  const totalRevenue   = orders
    .filter((o: any) => o.status === "COMPLETED")
    .reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);

  return (
    <OrdersPageClient
      orders={orders}
      products={toClient(products)}
      locations={toClient(locations)}
      completedCount={completedCount}
      pendingCount={pendingCount}
      totalRevenue={totalRevenue}
      canCreate={canCreate}
    />
  );
}
