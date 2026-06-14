"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LocationCombobox, getOrCreateLocationId } from "@/components/ui/location-combobox";
import type { SelectedLocation } from "@/components/ui/location-combobox";
import { toast } from "sonner";

type Location = { id: string; name: string };
type PO = { id: string; status: string };

export function POActions({ po, locations }: { po: PO; locations: Location[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receiveLocation, setReceiveLocation] = useState<SelectedLocation | null>(null);

  async function updateStatus(status: string, locationId?: string) {
    setLoading(true);
    const res = await fetch(`/api/purchase-orders/${po.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, locationId }),
    });
    setLoading(false);
    if (!res.ok) { toast.error("Action failed"); return; }
    toast.success(`Marked as ${status}`);
    router.refresh();
  }

  async function handleReceiveConfirm() {
    if (!receiveLocation) { toast.error("Select a location"); return; }
    const locationId = await getOrCreateLocationId(receiveLocation);
    if (!locationId) { toast.error("Could not resolve location — check permissions"); return; }
    setReceiveOpen(false);
    setReceiveLocation(null);
    await updateStatus("RECEIVED", locationId);
  }

  if (po.status === "RECEIVED" || po.status === "CANCELLED") return null;

  return (
    <div className="flex items-center gap-2">
      {po.status === "DRAFT" && (
        <Button size="sm" variant="outline" disabled={loading} onClick={() => updateStatus("ORDERED")}>
          Mark Ordered
        </Button>
      )}

      <Dialog open={receiveOpen} onOpenChange={(o) => { setReceiveOpen(o); if (!o) setReceiveLocation(null); }}>
        <DialogTrigger asChild>
          <Button size="sm" disabled={loading}>
            Receive PO
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive Purchase Order</DialogTitle>
          </DialogHeader>
          <p className="text-[13px]" style={{ color: "var(--muted-raw)" }}>
            Select the warehouse / location where this stock is being received.
          </p>
          <LocationCombobox
            label="Destination Location"
            dbLocations={locations}
            value={receiveLocation}
            onChange={setReceiveLocation}
            placeholder="Search cities, warehouses…"
          />
          <Button
            className="w-full mt-2"
            disabled={loading || !receiveLocation}
            onClick={handleReceiveConfirm}
          >
            {loading ? "Processing…" : "Confirm Receive"}
          </Button>
        </DialogContent>
      </Dialog>

      <Button size="sm" variant="ghost" disabled={loading} onClick={() => updateStatus("CANCELLED")}>
        Cancel
      </Button>
    </div>
  );
}
