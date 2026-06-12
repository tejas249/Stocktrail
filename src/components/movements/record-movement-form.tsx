"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { toast } from "sonner";

type Product = { id: string; name: string; sku: string };
type Location = { id: string; name: string };

export function RecordMovementForm({ products, locations }: { products: Product[]; locations: Location[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      productId: formData.get("productId"),
      locationId: formData.get("locationId"),
      type: formData.get("type"),
      quantity: formData.get("quantity"),
      reason: formData.get("reason") || undefined,
    };

    const res = await fetch("/api/stock-movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data?.error === "INSUFFICIENT_STOCK" || (typeof data?.error === "string" && data.error.includes("INSUFFICIENT"))) {
        toast.error("Not enough stock at this location for an outbound movement");
      } else {
        toast.error("Failed to record movement");
      }
      return;
    }

    toast.success("Movement recorded");
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-5">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="productId">Product</Label>
        <select id="productId" name="productId" required className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="locationId">Location</Label>
        <select id="locationId" name="locationId" required className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
          <option value="">Select</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="type">Type</Label>
        <select id="type" name="type" required className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
          <option value="IN">Stock In</option>
          <option value="OUT">Stock Out</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="quantity">Quantity</Label>
        <Input id="quantity" name="quantity" type="number" min={1} required />
      </div>
      <div className="space-y-1.5 sm:col-span-4">
        <Label htmlFor="reason">Reason (optional)</Label>
        <Input id="reason" name="reason" placeholder="e.g. Purchase order #102, damaged goods, sale, etc." />
      </div>
      <div className="flex items-end">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Record"}
        </Button>
      </div>
    </form>
  );
}
