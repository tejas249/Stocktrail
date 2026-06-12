"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Location = { id: string; name: string };
type PO = { id: string; status: string };

export function POActions({ po, locations }: { po: PO; locations: Location[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  if (po.status === "RECEIVED" || po.status === "CANCELLED") return null;

  return (
    <div className="flex items-center gap-2">
      {po.status === "DRAFT" && (
        <Button size="sm" variant="outline" disabled={loading} onClick={() => updateStatus("ORDERED")}>
          Mark Ordered
        </Button>
      )}
      <select
        className="h-8 rounded-md border border-border bg-background px-2 text-xs"
        disabled={loading}
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) updateStatus("RECEIVED", e.target.value);
        }}
      >
        <option value="">Receive into...</option>
        {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
      </select>
      <Button size="sm" variant="ghost" disabled={loading} onClick={() => updateStatus("CANCELLED")}>
        Cancel
      </Button>
    </div>
  );
}
