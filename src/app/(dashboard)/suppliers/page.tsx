import { connectDB, toClient } from "@/lib/mongodb";
import { Supplier } from "@/lib/models/Supplier";
import { Product } from "@/lib/models/Product";
import { PurchaseOrder } from "@/lib/models/PurchaseOrder";
import { SuppliersPageClient } from "@/components/pages/suppliers-client";

export default async function SuppliersPage() {
  await connectDB();

  const [suppliersRaw, productCounts, poCounts, activePOs] = await Promise.all([
    Supplier.find().sort({ name: 1 }).lean(),
    Product.aggregate([{ $group: { _id: "$supplier", count: { $sum: 1 } } }]),
    PurchaseOrder.aggregate([{ $group: { _id: "$supplier", count: { $sum: 1 } } }]),
    PurchaseOrder.countDocuments({ status: { $in: ["DRAFT", "ORDERED"] } }),
  ]);

  const productCountMap = new Map(productCounts.map((c: any) => [c._id?.toString(), c.count]));
  const poCountMap      = new Map(poCounts.map((c: any)      => [c._id?.toString(), c.count]));

  const suppliers = (suppliersRaw as any[]).map((s) => ({
    ...s,
    _count: {
      products:       productCountMap.get(s._id.toString()) || 0,
      purchaseOrders: poCountMap.get(s._id.toString())      || 0,
    },
  }));

  const totalProducts   = suppliers.reduce((s, sup) => s + sup._count.products, 0);
  const totalPOs        = suppliers.reduce((s, sup) => s + sup._count.purchaseOrders, 0);
  const activeSuppliers = suppliers.filter((s) => s._count.products > 0).length;

  return (
    <SuppliersPageClient
      suppliers={toClient(suppliers)}
      totalProducts={totalProducts}
      totalPOs={totalPOs}
      activeSuppliers={activeSuppliers}
      activePOs={activePOs}
    />
  );
}
