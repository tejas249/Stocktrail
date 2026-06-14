"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { useLayoutMode } from "@/components/layout/layout-mode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/input";
import { TransferForm } from "@/components/transfers/transfer-form";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

interface Transfer {
  id: string;
  type: string;
  quantity: number;
  createdAt: string;
  product?: { name: string; sku?: string };
  location?: { name: string };
  user?: { name: string };
}

interface Props {
  transfers: Transfer[];
  products: { id: string; name: string; sku: string }[];
  locations: { id: string; name: string }[];
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3 py-1 text-[12px] font-semibold transition-all"
      style={active ? { backgroundColor: "var(--primary-hex)", color: "#fff" } : { backgroundColor: "var(--line-2)", color: "var(--muted-raw)" }}
    >
      {children}
    </button>
  );
}

function TransferRow({ t }: { t: Transfer }) {
  return (
    <TableRow>
      <TableCell>
        <p className="font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{t.product?.name}</p>
        {t.product?.sku && <p className="font-mono text-[11px] mt-0.5" style={{ color: "var(--muted-2)" }}>{t.product.sku}</p>}
      </TableCell>
      <TableCell>
        <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: "var(--line-2)", color: "var(--ink-2)" }}>
          {t.location?.name}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant={t.type === "TRANSFER_IN" ? "movement-transfer-in" : "movement-transfer-out"}>
          {t.type === "TRANSFER_IN" ? "Received" : "Sent"}
        </Badge>
      </TableCell>
      <TableCell className="text-right font-mono font-semibold text-[13px]" style={{ color: t.type === "TRANSFER_IN" ? "var(--sky)" : "var(--amber-c)" }}>
        {t.type === "TRANSFER_IN" ? "+" : "-"}{t.quantity}
      </TableCell>
      <TableCell className="text-[13px]" style={{ color: "var(--ink-2)" }}>{t.user?.name}</TableCell>
      <TableCell className="text-[12px]" style={{ color: "var(--muted-raw)" }}>{formatDate(t.createdAt)}</TableCell>
    </TableRow>
  );
}

export function TransfersPageClient({ transfers, products, locations }: Props) {
  const { mode } = useLayoutMode();
  const [dirFilter, setDirFilter] = useState<"all" | "in" | "out">("all");

  const receivedCount = transfers.filter((t) => t.type === "TRANSFER_IN").length;
  const sentCount     = transfers.filter((t) => t.type === "TRANSFER_OUT").length;

  const filtered = transfers.filter((t) => {
    if (dirFilter === "in")  return t.type === "TRANSFER_IN";
    if (dirFilter === "out") return t.type === "TRANSFER_OUT";
    return true;
  });

  const topbarActions = (
    <button className="flex items-center gap-1.5 rounded-[9px] px-3 py-[7px] text-[13px] font-semibold text-white" style={{ backgroundColor: "var(--primary-hex)" }}>
      <Plus size={14} /> New Transfer
    </button>
  );

  const HistoryTable = ({ rows, compact = false }: { rows: Transfer[]; compact?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Direction</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          {!compact && <><TableHead>User</TableHead><TableHead>Date</TableHead></>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((t) => compact ? (
          <TableRow key={t.id}>
            <TableCell className="font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{t.product?.name}</TableCell>
            <TableCell>
              <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: "var(--line-2)", color: "var(--ink-2)" }}>{t.location?.name}</span>
            </TableCell>
            <TableCell>
              <Badge variant={t.type === "TRANSFER_IN" ? "movement-transfer-in" : "movement-transfer-out"}>
                {t.type === "TRANSFER_IN" ? "Received" : "Sent"}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-mono font-semibold text-[13px]" style={{ color: t.type === "TRANSFER_IN" ? "var(--sky)" : "var(--amber-c)" }}>
              {t.type === "TRANSFER_IN" ? "+" : "-"}{t.quantity}
            </TableCell>
          </TableRow>
        ) : <TransferRow key={t.id} t={t} />)}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={compact ? 4 : 6} className="py-10 text-center text-sm" style={{ color: "var(--muted-raw)" }}>
              No transfers yet
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  if (mode === "classic") {
    return (
      <div>
        <Topbar title="Stock Transfers" actions={topbarActions} />
        <div className="mx-auto max-w-[1180px] space-y-6 p-6">
          <Card>
            <CardHeader><CardTitle>New Transfer</CardTitle></CardHeader>
            <CardContent>
              <TransferForm products={products} locations={locations} inline />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Transfer History</CardTitle>
              <span className="text-[12px]" style={{ color: "var(--muted-raw)" }}>Last 50</span>
            </CardHeader>
            <CardContent className="p-0">
              <HistoryTable rows={filtered} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === "command") {
    return (
      <div>
        <Topbar title="Stock Transfers" actions={topbarActions} />
        <div className="mx-auto max-w-[1180px] p-6">
          <div className="flex gap-4 items-start">
            <div className="flex-[1.7] min-w-0">
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle>Transfer History</CardTitle>
                  <div className="flex items-center gap-1.5">
                    <FilterChip active={dirFilter === "all"} onClick={() => setDirFilter("all")}>All</FilterChip>
                    <FilterChip active={dirFilter === "in"}  onClick={() => setDirFilter("in")}>Received</FilterChip>
                    <FilterChip active={dirFilter === "out"} onClick={() => setDirFilter("out")}>Sent</FilterChip>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <HistoryTable rows={filtered} />
                </CardContent>
              </Card>
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "4px solid #0ea5e9", boxShadow: "var(--shadow-card)" }}>
                  <p className="text-[11.5px] font-semibold" style={{ color: "#64748b" }}>Received</p>
                  <p className="mt-2 text-[24px] font-bold leading-none" style={{ color: "#0ea5e9", letterSpacing: "-0.5px" }}>{receivedCount}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "4px solid #f59e0b", boxShadow: "var(--shadow-card)" }}>
                  <p className="text-[11.5px] font-semibold" style={{ color: "#64748b" }}>Sent</p>
                  <p className="mt-2 text-[24px] font-bold leading-none" style={{ color: "#f59e0b", letterSpacing: "-0.5px" }}>{sentCount}</p>
                </div>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-[14px]">New Transfer</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  <TransferForm products={products} locations={locations} />
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
      <Topbar title="Stock Transfers" actions={topbarActions} />
      <div className="mx-auto max-w-[1180px] space-y-4 p-6">
        <div className="flex gap-4 items-start">
          <div className="flex-[1.6] min-w-0">
            <Card>
              <CardHeader><CardTitle>Execute Transfer</CardTitle></CardHeader>
              <CardContent>
                <TransferForm products={products} locations={locations} />
              </CardContent>
            </Card>
          </div>
          <div className="flex-1 min-w-0">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-[14px]">Recent Transfers</CardTitle></CardHeader>
              <CardContent className="p-0">
                <HistoryTable rows={transfers.slice(0, 3)} compact />
              </CardContent>
            </Card>
          </div>
        </div>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Full History</CardTitle>
            <span className="text-[12px]" style={{ color: "var(--muted-raw)" }}>Last 50</span>
          </CardHeader>
          <CardContent className="p-0">
            <HistoryTable rows={transfers} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
