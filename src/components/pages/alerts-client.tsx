"use client";

import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { useLayoutMode } from "@/components/layout/layout-mode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/input";
import { AlertTriangle, Download, ClipboardList } from "lucide-react";

interface StockEntry { id: string; quantity: number; location?: { name: string } }
interface AlertProduct {
  id: string;
  name: string;
  sku: string;
  reorderThreshold: number;
  totalStock: number;
  stocks: StockEntry[];
  supplier?: { id: string; name: string };
}

interface Props {
  lowStock: AlertProduct[];
}

function AlertsTable({ products }: { products: AlertProduct[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead className="text-right">Current Stock</TableHead>
          <TableHead className="text-right">Reorder At</TableHead>
          <TableHead>Locations</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p) => (
          <TableRow key={p.id}>
            <TableCell>
              <p className="font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{p.name}</p>
            </TableCell>
            <TableCell>
              <span className="font-mono text-[12px]" style={{ color: "var(--muted-raw)" }}>{p.sku}</span>
            </TableCell>
            <TableCell className="text-right font-mono font-bold text-[13px]" style={{ color: p.totalStock === 0 ? "var(--red)" : "var(--amber-c)" }}>
              {p.totalStock}
            </TableCell>
            <TableCell className="text-right font-mono text-[13px]" style={{ color: "var(--muted-raw)" }}>
              {p.reorderThreshold}
            </TableCell>
            <TableCell className="text-[12px]" style={{ color: "var(--muted-raw)" }}>
              {p.stocks.map((s) => `${s.location?.name}: ${s.quantity}`).join(", ") || "—"}
            </TableCell>
            <TableCell>
              <Badge variant={p.totalStock === 0 ? "destructive" : "warning"}>
                {p.totalStock === 0 ? "Out of Stock" : "Low Stock"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
        {products.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="py-10 text-center text-sm" style={{ color: "var(--muted-raw)" }}>
              All products are above their reorder threshold.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function AlertBanner({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border px-5 py-4"
      style={{ borderColor: "rgba(239,68,68,.25)", backgroundColor: "rgba(239,68,68,.06)" }}
    >
      <AlertTriangle size={18} style={{ color: "#ef4444", flexShrink: 0 }} />
      <p className="text-[13px] font-semibold" style={{ color: "#b91c1c" }}>
        {count} product{count !== 1 ? "s" : ""} at or below reorder threshold. Review and create purchase orders as needed.
      </p>
    </div>
  );
}

export function AlertsPageClient({ lowStock }: Props) {
  const { mode } = useLayoutMode();

  const outOfStock = lowStock.filter((p) => p.totalStock === 0);
  const lowOnly    = lowStock.filter((p) => p.totalStock > 0);

  const poAction = (
    <Link
      href="/purchase-orders"
      className="flex items-center gap-1.5 rounded-[9px] px-3 py-[7px] text-[13px] font-semibold text-white"
      style={{ backgroundColor: "var(--primary-hex)" }}
    >
      <ClipboardList size={14} /> Create PO
    </Link>
  );

  const exportOutline = (
    <button className="flex items-center gap-1.5 rounded-[9px] border px-3 py-[7px] text-[13px] font-semibold" style={{ borderColor: "var(--line)", backgroundColor: "#fff", color: "var(--ink-2)" }}>
      <Download size={14} /> Export
    </button>
  );

  if (mode === "classic") {
    return (
      <div>
        <Topbar title="Low Stock Alerts" actions={poAction} />
        <div className="mx-auto max-w-[1180px] space-y-6 p-6">
          <AlertBanner count={lowStock.length} />
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Products at or below reorder threshold</CardTitle>
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ backgroundColor: lowStock.length > 0 ? "rgba(239,68,68,.1)" : "rgba(34,197,94,.1)", color: lowStock.length > 0 ? "#ef4444" : "#22c55e" }}
              >
                {lowStock.length} item{lowStock.length !== 1 ? "s" : ""}
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <AlertsTable products={lowStock} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === "command") {
    const supplierMap = new Map<string, { name: string; count: number }>();
    for (const p of lowStock) {
      if (p.supplier) {
        const entry = supplierMap.get(p.supplier.id) || { name: p.supplier.name, count: 0 };
        entry.count++;
        supplierMap.set(p.supplier.id, entry);
      }
    }
    const supplierRestocks = Array.from(supplierMap.values()).slice(0, 4);

    return (
      <div>
        <Topbar title="Low Stock Alerts" actions={poAction} />
        <div className="mx-auto max-w-[1180px] p-6">
          <div className="flex gap-4 items-start">
            <div className="flex-[1.7] min-w-0 space-y-4">
              <AlertBanner count={lowStock.length} />
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle>Alerts</CardTitle>
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: "rgba(239,68,68,.1)", color: "#ef4444" }}>
                    {lowStock.length} items
                  </span>
                </CardHeader>
                <CardContent className="p-0">
                  <AlertsTable products={lowStock} />
                </CardContent>
              </Card>
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-4" style={{ background: "#fffbeb", border: "1px solid #fde68a", boxShadow: "var(--shadow-card)" }}>
                  <p className="text-[11.5px] font-semibold" style={{ color: "#92400e" }}>Low Stock</p>
                  <p className="mt-2 text-[28px] font-bold leading-none" style={{ color: "#d97706", letterSpacing: "-0.5px" }}>{lowOnly.length}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: "#fef2f2", border: "1px solid #fecaca", boxShadow: "var(--shadow-card)" }}>
                  <p className="text-[11.5px] font-semibold" style={{ color: "#991b1b" }}>Out of Stock</p>
                  <p className="mt-2 text-[28px] font-bold leading-none" style={{ color: "#ef4444", letterSpacing: "-0.5px" }}>{outOfStock.length}</p>
                </div>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-[14px]">Quick Actions</CardTitle></CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <Link href="/purchase-orders" className="flex w-full items-center justify-center gap-2 rounded-[9px] py-2.5 text-[13px] font-semibold text-white" style={{ backgroundColor: "var(--primary-hex)" }}>
                    <ClipboardList size={14} /> Create PO for all
                  </Link>
                  <button className="flex w-full items-center justify-center gap-2 rounded-[9px] border py-2.5 text-[13px] font-semibold" style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}>
                    <Download size={14} /> Export list
                  </button>
                  {supplierRestocks.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[12px] font-semibold mb-2" style={{ color: "var(--muted-raw)" }}>Restock by Supplier</p>
                      <div className="space-y-1.5">
                        {supplierRestocks.map((s) => (
                          <div key={s.name} className="flex items-center justify-between rounded-[8px] px-3 py-2" style={{ backgroundColor: "var(--bg)", border: "1px solid var(--line-2)" }}>
                            <span className="text-[12.5px] font-medium truncate" style={{ color: "var(--ink)" }}>{s.name} <span style={{ color: "var(--muted-raw)" }}>({s.count})</span></span>
                            <Link href="/purchase-orders" className="text-[11px] font-bold px-2 py-1 rounded-[6px] text-white ml-2" style={{ backgroundColor: "var(--primary-hex)" }}>PO</Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Triage */
  return (
    <div data-layout="triage">
      <Topbar title="Low Stock Alerts" actions={<>{exportOutline}{poAction}</>} />
      <div className="mx-auto max-w-[1180px] space-y-4 p-6">
        <div className="flex gap-4 items-start">
          {/* Out of stock */}
          <div className="flex-1 min-w-0 rounded-2xl overflow-hidden" style={{ border: "1px solid #fecaca", boxShadow: "var(--shadow-card)" }}>
            <div className="px-5 py-4" style={{ backgroundColor: "#fef2f2", borderBottom: "1px solid #fecaca" }}>
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-bold" style={{ color: "#991b1b" }}>Out of Stock</p>
                <span className="text-[22px] font-bold font-mono" style={{ color: "#ef4444" }}>{outOfStock.length}</span>
              </div>
            </div>
            <div className="p-3 space-y-1" style={{ backgroundColor: "#fffafa" }}>
              {outOfStock.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-[8px] px-3 py-2" style={{ backgroundColor: "rgba(239,68,68,.06)" }}>
                  <span className="text-[13px] font-semibold truncate" style={{ color: "var(--ink)" }}>{p.name}</span>
                  <span className="text-[12px] font-bold font-mono ml-2" style={{ color: "#ef4444" }}>0</span>
                </div>
              ))}
              {outOfStock.length === 0 && <p className="text-[13px] text-center py-2" style={{ color: "var(--muted-raw)" }}>None</p>}
              <Link href="/purchase-orders" className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[9px] py-2 text-[13px] font-semibold text-white" style={{ backgroundColor: "#ef4444" }}>
                <ClipboardList size={13} /> Create PO now
              </Link>
            </div>
          </div>

          {/* Low stock */}
          <div className="flex-[2] min-w-0 rounded-2xl overflow-hidden" style={{ border: "1px solid #fde68a", boxShadow: "var(--shadow-card)" }}>
            <div className="px-5 py-4" style={{ backgroundColor: "#fffbeb", borderBottom: "1px solid #fde68a" }}>
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-bold" style={{ color: "#92400e" }}>Low Stock</p>
                <span className="text-[22px] font-bold font-mono" style={{ color: "#d97706" }}>{lowOnly.length}</span>
              </div>
            </div>
            <div className="p-3 space-y-1" style={{ backgroundColor: "#fffdf7" }}>
              {lowOnly.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-[8px] px-3 py-2" style={{ backgroundColor: "rgba(245,158,11,.06)" }}>
                  <span className="text-[13px] font-semibold truncate" style={{ color: "var(--ink)" }}>{p.name}</span>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <span className="text-[12px] font-mono font-bold" style={{ color: "#d97706" }}>{p.totalStock}</span>
                    <span className="text-[11px]" style={{ color: "var(--muted-raw)" }}>/ {p.reorderThreshold}</span>
                  </div>
                </div>
              ))}
              {lowOnly.length === 0 && <p className="text-[13px] text-center py-2" style={{ color: "var(--muted-raw)" }}>None</p>}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>All Alerts</CardTitle>
            <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: "rgba(239,68,68,.1)", color: "#ef4444" }}>
              {lowStock.length} items
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <AlertsTable products={lowStock} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
