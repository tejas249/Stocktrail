"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/input";
import { toast } from "sonner";

type Location = { id: string; name: string };

type Product = {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  reorderThreshold: number;
  stocks: { quantity: number; location: { id: string; name: string } }[];
};

export function BarcodeScanner({ locations }: { locations: Location[] }) {
  const router = useRouter();
  const scannerRef = useRef<HTMLDivElement>(null);
  const [scanning, setScanning] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!scanning) return;

    let html5QrCode: any;
    let active = true;

    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      html5QrCode = new Html5Qrcode("barcode-scanner-region");
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText: string) => {
            if (!active) return;
            active = false;
            await lookupProduct(decodedText);
            await html5QrCode.stop();
            setScanning(false);
          },
          () => {}
        );
      } catch (err) {
        toast.error("Could not access camera. Try manual entry instead.");
        setScanning(false);
      }
    })();

    return () => {
      active = false;
      if (html5QrCode) html5QrCode.stop().catch(() => {});
    };
  }, [scanning]);

  async function lookupProduct(code: string) {
    const res = await fetch(`/api/products/barcode/${code}`);
    if (!res.ok) {
      toast.error(`No product found with barcode ${code}`);
      setProduct(null);
      return;
    }
    const data = await res.json();
    setProduct(data.product);
  }

  async function handleMovement(type: "IN" | "OUT", locationId: string, quantity: number) {
    if (!product) return;
    setLoading(true);
    const res = await fetch("/api/stock-movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, locationId, type, quantity }),
    });
    setLoading(false);
    if (!res.ok) { toast.error("Failed to record movement"); return; }
    toast.success(`Recorded ${type === "IN" ? "+" : "-"}${quantity} for ${product.name}`);
    await lookupProduct(product.barcode!);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setScanning(!scanning)}>
          {scanning ? "Stop Scanning" : "Start Camera Scan"}
        </Button>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Or enter barcode manually"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="w-56"
          />
          <Button variant="outline" onClick={() => manualCode && lookupProduct(manualCode)}>Lookup</Button>
        </div>
      </div>

      {scanning && <div id="barcode-scanner-region" ref={scannerRef} className="w-full max-w-sm rounded-lg border border-border overflow-hidden" />}

      {product && (
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">SKU: {product.sku} • Barcode: {product.barcode}</p>
            </div>
            {product.stocks.reduce((s, st) => s + st.quantity, 0) <= product.reorderThreshold && (
              <Badge variant="warning">Low Stock</Badge>
            )}
          </div>

          <div className="mt-3 space-y-1 text-sm">
            {product.stocks.map((s) => (
              <div key={s.location.id} className="flex justify-between text-muted-foreground">
                <span>{s.location.name}</span>
                <span>{s.quantity} units</span>
              </div>
            ))}
          </div>

          <QuickMovementForm locations={locations} loading={loading} onSubmit={handleMovement} />
        </div>
      )}
    </div>
  );
}

function QuickMovementForm({
  locations,
  loading,
  onSubmit,
}: {
  locations: Location[];
  loading: boolean;
  onSubmit: (type: "IN" | "OUT", locationId: string, quantity: number) => void;
}) {
  const [locationId, setLocationId] = useState(locations[0]?.id || "");
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className="col-span-2 sm:col-span-2 flex h-10 rounded-md border border-border bg-background px-3 py-2 text-sm">
        {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
      </select>
      <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      <div className="flex gap-2">
        <Button size="sm" disabled={loading} onClick={() => onSubmit("IN", locationId, quantity)}>+ In</Button>
        <Button size="sm" variant="outline" disabled={loading} onClick={() => onSubmit("OUT", locationId, quantity)}>- Out</Button>
      </div>
    </div>
  );
}
