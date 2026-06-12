import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { connectDB, toClient } from "@/lib/mongodb";
import { Supplier } from "@/lib/models/Supplier";
import { Product } from "@/lib/models/Product";
import { PurchaseOrder } from "@/lib/models/PurchaseOrder";
import { AddSupplierDialog } from "@/components/suppliers/add-supplier-dialog";

export default async function SuppliersPage() {
  await connectDB();

  const [suppliersRaw, productCounts, poCounts] = await Promise.all([
    Supplier.find().sort({ name: 1 }).lean(),
    Product.aggregate([{ $group: { _id: "$supplier", count: { $sum: 1 } } }]),
    PurchaseOrder.aggregate([{ $group: { _id: "$supplier", count: { $sum: 1 } } }]),
  ]);

  const productCountMap = new Map(productCounts.map((c: any) => [c._id?.toString(), c.count]));
  const poCountMap = new Map(poCounts.map((c: any) => [c._id?.toString(), c.count]));

  const suppliers = (suppliersRaw as any[]).map((s) => ({
    ...s,
    _count: {
      products: productCountMap.get(s._id.toString()) || 0,
      purchaseOrders: poCountMap.get(s._id.toString()) || 0,
    },
  }));

  return (
    <div>
      <Topbar title="Suppliers" />
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{suppliers.length} suppliers</p>
          <AddSupplierDialog />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Purchase Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {toClient(suppliers).map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.contactEmail || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{s.phone || "—"}</TableCell>
                    <TableCell>{s._count.products}</TableCell>
                    <TableCell>{s._count.purchaseOrders}</TableCell>
                  </TableRow>
                ))}
                {suppliers.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No suppliers yet. Add your first supplier.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
