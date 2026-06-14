import { connectDB, toClient } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Location } from "@/lib/models/Location";
import { StockMovement } from "@/lib/models/StockMovement";
import "@/lib/models/User";
import { TransfersPageClient } from "@/components/pages/transfers-client";

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

  return (
    <TransfersPageClient
      transfers={toClient(transfersRaw)}
      products={toClient(products)}
      locations={toClient(locations)}
    />
  );
}
