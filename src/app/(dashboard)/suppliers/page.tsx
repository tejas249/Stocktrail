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
      <div className="mx-auto max-w-[1180px] space-y-5 p-6">

        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium" style={{ color: "var(--muted-raw)" }}>
            {suppliers.length} supplier{suppliers.length !== 1 ? "s" : ""} registered
          </p>
          <AddSupplierDialog />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead className="text-right">Purchase Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {toClient(suppliers).map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                          style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)" }}
                        >
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px]" style={{ color: "var(--muted-raw)" }}>{s.contactEmail || "—"}</TableCell>
                    <TableCell className="text-[13px]" style={{ color: "var(--muted-raw)" }}>{s.phone || "—"}</TableCell>
                    <TableCell className="text-right font-mono font-semibold text-[13px]" style={{ color: "var(--ink-2)" }}>{s._count.products}</TableCell>
                    <TableCell className="text-right font-mono font-semibold text-[13px]" style={{ color: "var(--ink-2)" }}>{s._count.purchaseOrders}</TableCell>
                  </TableRow>
                ))}
                {suppliers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm" style={{ color: "var(--muted-raw)" }}>
                      No suppliers yet. Add your first supplier.
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
