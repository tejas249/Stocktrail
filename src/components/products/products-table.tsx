"use client";

import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  price: number;
  costPrice: number;
  reorderThreshold: number;
  stocks: { quantity: number; location: { name: string } }[];
  supplier: { name: string } | null;
};

export function ProductsTable({ products, canEdit }: { products: Product[]; canEdit: boolean }) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card py-16 text-center">
        <p className="text-sm text-muted-foreground">No products yet. Add your first product to get started.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Total Stock</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Supplier</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p) => {
          const totalStock = p.stocks.reduce((sum, s) => sum + s.quantity, 0);
          let status: { label: string; variant: "success" | "warning" | "destructive" } = {
            label: "In Stock",
            variant: "success",
          };
          if (totalStock === 0) status = { label: "Out of Stock", variant: "destructive" };
          else if (totalStock <= p.reorderThreshold) status = { label: "Low Stock", variant: "warning" };

          return (
            <TableRow key={p.id}>
              <TableCell className="font-medium">
                <Link href={`/products/${p.id}`} className="hover:underline">
                  {p.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{p.sku}</TableCell>
              <TableCell>{p.category || "—"}</TableCell>
              <TableCell>{totalStock}</TableCell>
              <TableCell>
                <Badge variant={status.variant}>{status.label}</Badge>
              </TableCell>
              <TableCell>{formatCurrency(p.price)}</TableCell>
              <TableCell className="text-muted-foreground">{p.supplier?.name || "—"}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
