"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { toast } from "sonner";

type Product = { id: string; name: string; sku: string };
type Location = { id: string; name: string };

export function TransferForm({ products, locations }: { products: Product[]; locations: Location[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      productId: formData.get("productId"),
      fromLocationId: formData.get("fromLocationId"),
      toLocationId: formData.get("toLocationId"),
      quantity: formData.get("quantity"),
    };

    const res = await fetch("/api/transfers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data?.error === "INSUFFICIENT_STOCK" ? "Not enough stock at source location" : "Transfer failed");
      return;
    }

    toast.success("Transfer recorded");
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-5">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="productId">Product</Label>
        <select id="productId" name="productId" required className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
          <option value="">Select product</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="fromLocationId">From</Label>
        <select id="fromLocationId" name="fromLocationId" required className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
          <option value="">Select</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="toLocationId">To</Label>
        <select id="toLocationId" name="toLocationId" required className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
          <option value="">Select</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="quantity">Quantity</Label>
        <Input id="quantity" name="quantity" type="number" min={1} required />
      </div>
      <div className="flex items-end sm:col-span-5">
        <Button type="submit" disabled={loading}>{loading ? "Transferring..." : "Transfer Stock"}</Button>
      </div>
    </form>
  );
}
