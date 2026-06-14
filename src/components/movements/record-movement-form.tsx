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

export function RecordMovementForm({
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
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedLocation) {
      toast.error("Please select a location");
      return;
    }

    // Capture form reference BEFORE any await — currentTarget becomes null after async gaps
    const form = e.currentTarget;
    setLoading(true);

    const locationId = await getOrCreateLocationId(selectedLocation);
    if (!locationId) {
      toast.error("Could not create location — check permissions");
      setLoading(false);
      return;
    }

    const fd = new FormData(form);
    const payload = {
      productId: fd.get("productId"),
      locationId,
      type: fd.get("type"),
      quantity: fd.get("quantity"),
      reason: fd.get("reason") || undefined,
    };

    const res = await fetch("/api/stock-movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (
        data?.error === "INSUFFICIENT_STOCK" ||
        (typeof data?.error === "string" && data.error.includes("INSUFFICIENT"))
      ) {
        toast.error("Not enough stock at this location for an outbound movement");
      } else {
        toast.error("Failed to record movement");
      }
      return;
    }

    toast.success("Movement recorded successfully");
    setSelectedLocation(null);
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
        <div style={{ flex: 1.2, minWidth: 140 }}>
          <LocationCombobox
            label="Location"
            dbLocations={locations}
            value={selectedLocation}
            onChange={setSelectedLocation}
          />
        </div>
        <div style={{ flex: 1, minWidth: 100 }}>
          <label style={inlineLabelStyle}>Type</label>
          <select name="type" required style={inlineFieldStyle}>
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
          </select>
        </div>
        <div style={{ flex: 0.8, minWidth: 80 }}>
          <label style={inlineLabelStyle}>Qty</label>
          <input name="quantity" type="number" min={1} required style={inlineFieldStyle} />
        </div>
        <div style={{ flex: 1.5, minWidth: 120 }}>
          <label style={inlineLabelStyle}>Reason</label>
          <input name="reason" placeholder="optional…" style={inlineFieldStyle} />
        </div>
        <button
          type="submit"
          disabled={loading || !selectedLocation}
          style={{
            height: 38, padding: "0 20px",
            backgroundColor: loading || !selectedLocation ? "var(--muted-2)" : "var(--primary-hex)",
            color: "#fff", border: "none", borderRadius: 9,
            fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0,
          }}
        >
          {loading ? "Saving…" : "Record"}
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

      {/* Location */}
      <LocationCombobox
        label="Location"
        dbLocations={locations}
        value={selectedLocation}
        onChange={setSelectedLocation}
      />

      {/* Type */}
      <div className="space-y-1.5">
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          name="type"
          required
          className="flex h-10 w-full rounded-[10px] border px-3 py-2 text-sm"
          style={{ borderColor: "var(--line)", backgroundColor: "white", color: "var(--ink)" }}
        >
          <option value="IN">Stock In</option>
          <option value="OUT">Stock Out</option>
        </select>
      </div>

      {/* Quantity */}
      <div className="space-y-1.5">
        <Label htmlFor="quantity">Quantity</Label>
        <Input id="quantity" name="quantity" type="number" min={1} required />
      </div>

      {/* Reason */}
      <div className="space-y-1.5 sm:col-span-4">
        <Label htmlFor="reason">Reason (optional)</Label>
        <Input
          id="reason"
          name="reason"
          placeholder="e.g. Purchase order #102, damaged goods, sale…"
        />
      </div>

      <div className="flex items-end">
        <Button type="submit" className="w-full" disabled={loading || !selectedLocation}>
          {loading ? "Saving…" : "Record"}
        </Button>
      </div>
    </form>
  );
}
