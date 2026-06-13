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
      <div
        className="rounded-2xl border py-16 text-center"
        style={{ borderColor: "var(--line)", backgroundColor: "white" }}
      >
        <p className="text-sm" style={{ color: "var(--muted-raw)" }}>
          No products yet. Add your first product to get started.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Total Stock</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead>Supplier</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p) => {
          const totalStock = p.stocks.reduce((sum, s) => sum + s.quantity, 0);
          type BadgeVariant = "success" | "warning" | "destructive";
          let status: { label: string; variant: BadgeVariant } = { label: "In Stock", variant: "success" };
          if (totalStock === 0) status = { label: "Out of Stock", variant: "destructive" };
          else if (totalStock <= p.reorderThreshold) status = { label: "Low Stock", variant: "warning" };

          return (
            <TableRow key={p.id}>
              <TableCell>
                <Link href={`/products/${p.id}`} className="group">
                  <p className="font-semibold text-[13px] group-hover:underline" style={{ color: "var(--ink)" }}>{p.name}</p>
                  <p className="font-mono text-[11px] mt-0.5" style={{ color: "var(--muted-2)" }}>{p.sku}</p>
                </Link>
              </TableCell>
              <TableCell className="text-[13px]" style={{ color: "var(--muted-raw)" }}>
                {p.category || "—"}
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-[13px]" style={{ color: "var(--ink)" }}>
                {totalStock}
              </TableCell>
              <TableCell>
                <Badge variant={status.variant}>{status.label}</Badge>
              </TableCell>
              <TableCell className="text-right font-mono text-[13px]" style={{ color: "var(--ink-2)" }}>
                {formatCurrency(p.price)}
              </TableCell>
              <TableCell className="text-[13px]" style={{ color: "var(--muted-raw)" }}>
                {p.supplier?.name || "—"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
