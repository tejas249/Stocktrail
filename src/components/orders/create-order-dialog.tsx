"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type Product = { id: string; name: string; sku: string; price: number };
type Location = { id: string; name: string };
type LineItem = { productId: string; quantity: number; price: number };

export function CreateOrderDialog({ products, locations }: { products: Product[]; locations: Location[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<LineItem[]>([{ productId: "", quantity: 1, price: 0 }]);
  const [locationId, setLocationId] = useState("");
  const [customerName, setCustomerName] = useState("");

  function addItem() { setItems([...items, { productId: "", quantity: 1, price: 0 }]); }
  function removeItem(idx: number) { setItems(items.filter((_, i) => i !== idx)); }
  function updateItem(idx: number, field: keyof LineItem, value: string) {
    const next = [...items];
    if (field === "productId") {
      next[idx].productId = value;
      const product = products.find((p) => p.id === value);
      if (product) next[idx].price = product.price;
    } else if (field === "quantity") next[idx].quantity = Number(value);
    else if (field === "price") next[idx].price = Number(value);
    setItems(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!locationId) { toast.error("Select a location"); return; }
    if (items.some((i) => !i.productId)) { toast.error("Select a product for every line item"); return; }

    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName: customerName || undefined, locationId, items }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data?.error === "INSUFFICIENT_STOCK" ? "Not enough stock for one or more items" : "Failed to create order");
      return;
    }

    toast.success("Order created and stock updated");
    setOpen(false);
    setItems([{ productId: "", quantity: 1, price: 0 }]);
    setCustomerName("");
    setLocationId("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus size={16} /> New Order</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>New Order</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="customerName">Customer (optional)</Label>
              <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="locationId">Fulfilling Location</Label>
              <select id="locationId" value={locationId} onChange={(e) => setLocationId(e.target.value)} required className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                <option value="">Select location</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Items</Label>
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                <select
                  className="col-span-6 flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={item.productId}
                  onChange={(e) => updateItem(idx, "productId", e.target.value)}
                  required
                >
                  <option value="">Select product</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
                <Input className="col-span-2" type="number" min={1} placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} />
                <Input className="col-span-3" type="number" step="0.01" min={0} placeholder="Price" value={item.price} onChange={(e) => updateItem(idx, "price", e.target.value)} />
                <Button type="button" variant="ghost" size="icon" className="col-span-1" onClick={() => removeItem(idx)} disabled={items.length === 1}>
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus size={14} /> Add Item
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Order"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
