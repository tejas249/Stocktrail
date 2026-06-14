import { connectDB, toClient } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Location } from "@/lib/models/Location";
import { StockMovement } from "@/lib/models/StockMovement";
import "@/lib/models/User";
import { MovementsPageClient } from "@/components/pages/movements-client";

export default async function MovementsPage() {
  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [products, locations, movementsRaw, todayCount] = await Promise.all([
    Product.find().select("name sku").lean(),
    Location.find().lean(),
    StockMovement.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("product")
      .populate("location")
      .populate("user")
      .lean(),
    StockMovement.countDocuments({ createdAt: { $gte: today } }),
  ]);

  const movements = toClient(movementsRaw);
  const inCount  = movements.filter((m: any) => m.type === "IN" || m.type === "TRANSFER_IN").length;
  const outCount = movements.filter((m: any) => m.type === "OUT" || m.type === "TRANSFER_OUT").length;

  return (
    <MovementsPageClient
      movements={movements}
      products={toClient(products)}
      locations={toClient(locations)}
      inCount={inCount}
      outCount={outCount}
      todayCount={todayCount}
    />
  );
}
