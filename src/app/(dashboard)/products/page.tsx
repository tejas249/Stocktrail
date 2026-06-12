import { Topbar } from "@/components/layout/topbar";
import { connectDB, toClient } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Stock } from "@/lib/models/Stock";
import { Supplier } from "@/lib/models/Supplier";
import { ProductsTable } from "@/components/products/products-table";
import { AddProductDialog } from "@/components/products/add-product-dialog";
import { ImportProductsDialog } from "@/components/products/import-products-dialog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);
  await connectDB();

  const [productsRaw, suppliersRaw, stocksRaw] = await Promise.all([
    Product.find().populate("supplier").sort({ createdAt: -1 }).lean(),
    Supplier.find().lean(),
    Stock.find().populate("location").lean(),
  ]);

  const stocksByProduct = new Map<string, any[]>();
  for (const s of stocksRaw as any[]) {
    const key = s.product.toString();
    if (!stocksByProduct.has(key)) stocksByProduct.set(key, []);
    stocksByProduct.get(key)!.push(s);
  }

  const products = (productsRaw as any[]).map((p) => ({
    ...p,
    stocks: stocksByProduct.get(p._id.toString()) || [],
  }));

  const canEdit = session?.user.role !== "VIEWER";

  return (
    <div>
      <Topbar title="Products" />
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{products.length} products in catalog</p>
          {canEdit && (
            <div className="flex gap-2">
              <ImportProductsDialog />
              <AddProductDialog suppliers={toClient(suppliersRaw)} />
            </div>
          )}
        </div>
        <ProductsTable products={toClient(products)} canEdit={canEdit} />
      </div>
    </div>
  );
}
