import { connectDB, toClient } from "@/lib/mongodb";
import { PurchaseOrder } from "@/lib/models/PurchaseOrder";
import { Supplier } from "@/lib/models/Supplier";
import { Product } from "@/lib/models/Product";
import { Location } from "@/lib/models/Location";
import { PurchaseOrdersPageClient } from "@/components/pages/purchase-orders-client";

export default async function PurchaseOrdersPage() {
  await connectDB();

  const [purchaseOrdersRaw, suppliers, products, locations] = await Promise.all([
    PurchaseOrder.find().populate("supplier").populate("items.product").sort({ createdAt: -1 }).lean(),
    Supplier.find().lean(),
    Product.find().select("name sku costPrice").lean(),
    Location.find().lean(),
  ]);

  return (
    <PurchaseOrdersPageClient
      purchaseOrders={toClient(purchaseOrdersRaw)}
      suppliers={toClient(suppliers)}
      products={toClient(products)}
      locations={toClient(locations)}
    />
  );
}
