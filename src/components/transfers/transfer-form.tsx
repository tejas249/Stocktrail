"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { LocationCombobox, getOrCreateLocationId } from "@/components/ui/location-combobox";
import type { SelectedLocation } from "@/components/ui/location-combobox";
import { toast } from "sonner";

type Product = { id: string; name: string; sku: string };
type LocationItem = { id: string; name: string };

const inlineFieldStyle: React.CSSProperties = {
  width: "100%",
  height: 38,
  border: "1px solid var(--line)",
  borderRadius: 9,
  padding: "0 12px",
  fontSize: 13,
  color: "var(--ink)",
  backgroundColor: "#f8f9fb",
  outline: "none",
};

const inlineLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 500,
  color: "var(--muted-raw)",
  marginBottom: 6,
};

export function TransferForm({
  products,
  locations,
  inline = false,
}: {
  products: Product[];
  locations: LocationItem[];
  inline?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fromLocation, setFromLocation] = useState<SelectedLocation | null>(null);
  const [toLocation, setToLocation] = useState<SelectedLocation | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!fromLocation || !toLocation) {
      toast.error("Please select both From and To locations");
      return;
    }
    if (fromLocation.name === toLocation.name) {
      toast.error("From and To locations must be different");
      return;
    }

    // Capture form reference BEFORE any await
    const form = e.currentTarget;
    setLoading(true);

    const [fromLocationId, toLocationId] = await Promise.all([
      getOrCreateLocationId(fromLocation),
      getOrCreateLocationId(toLocation),
    ]);

    if (!fromLocationId || !toLocationId) {
      toast.error("Could not resolve locations — check permissions");
      setLoading(false);
      return;
    }

    const fd = new FormData(form);
    const payload = {
      productId: fd.get("productId"),
      fromLocationId,
      toLocationId,
      quantity: fd.get("quantity"),
    };

    const res = await fetch("/api/transfers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(
        data?.error === "INSUFFICIENT_STOCK"
          ? "Not enough stock at source location"
          : "Transfer failed"
      );
      return;
    }

    toast.success("Transfer recorded");
    setFromLocation(null);
    setToLocation(null);
    form.reset();
    router.refresh();
  }

  if (inline) {
    return (
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: 160 }}>
          <label style={inlineLabelStyle}>Product</label>
          <select name="productId" required style={inlineFieldStyle}>
            <option value="">Select product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1.2, minWidth: 130 }}>
          <LocationCombobox
            label="From"
            dbLocations={locations}
            value={fromLocation}
            onChange={setFromLocation}
            placeholder="Source…"
          />
        </div>
        <div style={{ flex: 1.2, minWidth: 130 }}>
          <LocationCombobox
            label="To"
            dbLocations={locations}
            value={toLocation}
            onChange={setToLocation}
            placeholder="Destination…"
          />
        </div>
        <div style={{ flex: 0.8, minWidth: 80 }}>
          <label style={inlineLabelStyle}>Qty</label>
          <input name="quantity" type="number" min={1} required style={inlineFieldStyle} />
        </div>
        <button
          type="submit"
          disabled={loading || !fromLocation || !toLocation}
          style={{
            height: 38, padding: "0 20px",
            backgroundColor: loading || !fromLocation || !toLocation ? "var(--muted-2)" : "var(--primary-hex)",
            color: "#fff", border: "none", borderRadius: 9,
            fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0,
          }}
        >
          {loading ? "Transferring…" : "Transfer"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-5">
      {/* Product */}
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="productId">Product</Label>
        <select
          id="productId"
          name="productId"
          required
          className="flex h-10 w-full rounded-[10px] border px-3 py-2 text-sm transition-all focus:outline-none"
          style={{ borderColor: "var(--line)", backgroundColor: "white", color: "var(--ink)" }}
        >
          <option value="">Select product…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku})
            </option>
          ))}
        </select>
      </div>

      {/* From location */}
      <LocationCombobox
        label="From"
        dbLocations={locations}
        value={fromLocation}
        onChange={setFromLocation}
        placeholder="Source location…"
      />

      {/* To location */}
      <LocationCombobox
        label="To"
        dbLocations={locations}
        value={toLocation}
        onChange={setToLocation}
        placeholder="Destination…"
      />

      {/* Quantity */}
      <div className="space-y-1.5">
        <Label htmlFor="quantity">Quantity</Label>
        <Input id="quantity" name="quantity" type="number" min={1} required />
      </div>

      <div className="flex items-end sm:col-span-5">
        <Button
          type="submit"
          disabled={loading || !fromLocation || !toLocation}
        >
          {loading ? "Transferring…" : "Transfer Stock"}
        </Button>
      </div>
    </form>
  );
}
