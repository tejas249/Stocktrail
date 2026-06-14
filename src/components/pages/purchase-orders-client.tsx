"use client";

import { Topbar } from "@/components/layout/topbar";
import { useLayoutMode } from "@/components/layout/layout-mode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/input";
import { CreatePODialog } from "@/components/purchase-orders/create-po-dialog";
import { POActions } from "@/components/purchase-orders/po-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

type BadgeVariant = "default" | "success" | "warning" | "destructive";

const statusVariant: Record<string, BadgeVariant> = {
  DRAFT: "default", ORDERED: "warning", RECEIVED: "success", CANCELLED: "destructive",
};

const STATUS_CONFIG: { key: string; label: string; color: string; bg: string }[] = [
  { key: "DRAFT",     label: "Draft",     color: "#475569", bg: "#f1f5f9" },
  { key: "ORDERED",   label: "Ordered",   color: "#a16207", bg: "#fef9c3" },
  { key: "RECEIVED",  label: "Received",  color: "#15803d", bg: "#dcfce7" },
  { key: "CANCELLED", label: "Cancelled", color: "#b91c1c", bg: "#fee2e2" },
];

interface POItem { id: string; product?: { name: string }; quantity: number; costPrice: number; }
interface PO {
  id: string;
  supplier?: { name: string };
  status: string;
  createdAt: string;
  expectedDate?: string;
  items: POItem[];
}
interface Props {
  purchaseOrders: PO[];
  suppliers: { id: string; name: string }[];
  products: { id: string; name: string; sku: string; costPrice: number }[];
  locations: { id: string; name: string }[];
}

function POCard({ po, locations }: { po: PO; locations: { id: string; name: string }[] }) {
  const total = po.items.reduce((sum, i) => sum + i.quantity * i.costPrice, 0);
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <CardTitle>{po.supplier?.name}</CardTitle>
            <Badge variant={statusVariant[po.status]}>{po.status}</Badge>
          </div>
          <p className="mt-1 text-[12px]" style={{ color: "var(--muted-raw)" }}>
            PO #{po.id.slice(-8)} · {formatDate(po.createdAt)}
            {po.expectedDate && ` · Expected ${formatDate(po.expectedDate)}`}
          </p>
        </div>
        <POActions po={po} locations={locations} />
      </CardHeader>
      <CardContent className="p-0 pb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {po.items.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-medium text-[13px]" style={{ color: "var(--ink)" }}>{i.product?.name}</TableCell>
                <TableCell className="text-right font-mono text-[13px]" style={{ color: "var(--ink-2)" }}>{i.quantity}</TableCell>
                <TableCell className="text-right font-mono text-[13px]" style={{ color: "var(--ink-2)" }}>{formatCurrency(i.costPrice)}</TableCell>
                <TableCell className="text-right font-mono font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{formatCurrency(i.quantity * i.costPrice)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-2 flex justify-end px-4">
          <p className="text-[13px] font-bold" style={{ color: "var(--ink)" }}>
            Total:&nbsp;<span style={{ color: "var(--primary-hex)" }}>{formatCurrency(total)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function PurchaseOrdersPageClient({ purchaseOrders, suppliers, products, locations }: Props) {
  const { mode } = useLayoutMode();

  const pendingCount = purchaseOrders.filter((po) => po.status === "DRAFT" || po.status === "ORDERED").length;

  const topbarActions = <CreatePODialog suppliers={suppliers} products={products} />;

  if (mode === "classic") {
    return (
      <div>
        <Topbar title="Purchase Orders" actions={topbarActions} />
        <div className="mx-auto max-w-[1180px] space-y-5 p-6">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium" style={{ color: "var(--muted-raw)" }}>
              {purchaseOrders.length} purchase order{purchaseOrders.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="space-y-4">
            {purchaseOrders.length === 0 && (
              <Card><CardContent className="py-10 text-center text-sm" style={{ color: "var(--muted-raw)" }}>No purchase orders yet.</CardContent></Card>
            )}
            {purchaseOrders.map((po) => <POCard key={po.id} po={po} locations={locations} />)}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "command") {
    const statusCounts = STATUS_CONFIG.map((s) => ({
      ...s,
      count: purchaseOrders.filter((po) => po.status === s.key).length,
    }));

    return (
      <div>
        <Topbar title="Purchase Orders" actions={topbarActions} />
        <div className="mx-auto max-w-[1180px] p-6">
          <div className="flex gap-4 items-start">
            <div className="flex-[1.7] min-w-0 space-y-4">
              {purchaseOrders.length === 0 && (
                <Card><CardContent className="py-10 text-center text-sm" style={{ color: "var(--muted-raw)" }}>No purchase orders yet.</CardContent></Card>
              )}
              {purchaseOrders.map((po) => <POCard key={po.id} po={po} locations={locations} />)}
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "3px solid #049fd9", boxShadow: "var(--shadow-card)" }}>
                  <p className="text-[11.5px] font-semibold" style={{ color: "#64748b" }}>Total POs</p>
                  <p className="mt-2 text-[24px] font-bold leading-none" style={{ color: "#049fd9", letterSpacing: "-0.5px" }}>{purchaseOrders.length}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "4px solid #f59e0b", boxShadow: "var(--shadow-card)" }}>
                  <p className="text-[11.5px] font-semibold" style={{ color: "#64748b" }}>Pending</p>
                  <p className="mt-2 text-[24px] font-bold leading-none" style={{ color: "#f59e0b", letterSpacing: "-0.5px" }}>{pendingCount}</p>
                </div>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-[14px]">Status Summary</CardTitle></CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {statusCounts.map((s) => (
                    <div key={s.key} className="flex items-center justify-between rounded-[9px] px-3 py-2" style={{ backgroundColor: s.bg }}>
                      <span className="text-[13px] font-semibold" style={{ color: s.color }}>{s.label}</span>
                      <span className="text-[15px] font-bold font-mono" style={{ color: s.color }}>{s.count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <CreatePODialog suppliers={suppliers} products={products} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Triage */
  const statusCounts = STATUS_CONFIG.map((s) => ({
    ...s,
    count: purchaseOrders.filter((po) => po.status === s.key).length,
  }));

  return (
    <div data-layout="triage">
      <Topbar title="Purchase Orders" actions={topbarActions} />
      <div className="mx-auto max-w-[1180px] space-y-4 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statusCounts.map((s) => (
            <div key={s.key} className="rounded-2xl p-4 text-center" style={{ backgroundColor: s.bg, border: `1px solid ${s.color}30` }}>
              <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: s.color }}>{s.label}</p>
              <p className="mt-2 text-[36px] font-bold leading-none" style={{ color: s.color, letterSpacing: "-1px" }}>{s.count}</p>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {purchaseOrders.length === 0 && (
            <Card><CardContent className="py-10 text-center text-sm" style={{ color: "var(--muted-raw)" }}>No purchase orders yet.</CardContent></Card>
          )}
          {purchaseOrders.map((po) => <POCard key={po.id} po={po} locations={locations} />)}
        </div>
      </div>
    </div>
  );
}
