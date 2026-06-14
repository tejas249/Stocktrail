"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { useLayoutMode } from "@/components/layout/layout-mode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageStatsRow } from "@/components/ui/page-stats-row";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/input";
import { RecordMovementForm } from "@/components/movements/record-movement-form";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScanLine, Plus } from "lucide-react";
import Link from "next/link";

interface Movement {
  id: string;
  type: string;
  quantity: number;
  createdAt: string;
  reason?: string;
  product?: { name: string; sku?: string };
  location?: { name: string };
  user?: { name: string };
}

interface Props {
  movements: Movement[];
  products: { id: string; name: string; sku: string }[];
  locations: { id: string; name: string }[];
  inCount: number;
  outCount: number;
  todayCount: number;
}

function movementBadge(type: string) {
  if (type === "IN")          return "movement-in"           as const;
  if (type === "TRANSFER_IN") return "movement-transfer-in"  as const;
  if (type === "OUT")         return "movement-out"          as const;
  return                             "movement-transfer-out" as const;
}

function isInbound(type: string) { return type === "IN" || type === "TRANSFER_IN"; }

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

function MovementRow({ m, compact = false }: { m: Movement; compact?: boolean }) {
  const inbound = isInbound(m.type);
  return (
    <TableRow>
      <TableCell>
        <p className="font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{m.product?.name}</p>
        {m.product?.sku && <p className="font-mono text-[11px] mt-0.5" style={{ color: "var(--muted-2)" }}>{m.product.sku}</p>}
      </TableCell>
      {!compact && (
        <TableCell>
          <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: "var(--line-2)", color: "var(--ink-2)" }}>
            {m.location?.name}
          </span>
        </TableCell>
      )}
      <TableCell><Badge variant={movementBadge(m.type)}>{m.type}</Badge></TableCell>
      <TableCell className="text-right font-mono font-semibold text-[13px]" style={{ color: inbound ? "var(--green)" : "var(--rose)" }}>
        {inbound ? "+" : "-"}{m.quantity}
      </TableCell>
      {!compact && (
        <>
          <TableCell className="text-[13px]" style={{ color: "var(--muted-raw)" }}>{m.reason || "—"}</TableCell>
          <TableCell className="text-[13px]" style={{ color: "var(--ink-2)" }}>{m.user?.name}</TableCell>
          <TableCell className="text-[12px]" style={{ color: "var(--muted-raw)" }}>{formatDate(m.createdAt)}</TableCell>
        </>
      )}
    </TableRow>
  );
}

function MovementsTable({ movements, compact = false }: { movements: Movement[]; compact?: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          {!compact && <TableHead>Location</TableHead>}
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          {!compact && (
            <>
              <TableHead>Reason</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
            </>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((m) => <MovementRow key={m.id} m={m} compact={compact} />)}
        {movements.length === 0 && (
          <TableRow>
            <TableCell colSpan={compact ? 3 : 7} className="py-10 text-center text-sm" style={{ color: "var(--muted-raw)" }}>
              No movements recorded yet
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export function MovementsPageClient({ movements, products, locations, inCount, outCount, todayCount }: Props) {
  const { mode } = useLayoutMode();
  const [typeFilter, setTypeFilter] = useState<"all" | "in" | "out">("all");

  const kpiStats = [
    { title: "Total Movements",  value: String(movements.length), icon: "ArrowLeftRight", color: "#0ea5e9", delta: "Last 50 shown" },
    { title: "Stock In",         value: String(inCount),          icon: "ArrowDownCircle", color: "#22c55e", delta: `${inCount} inbound`, deltaPositive: true },
    { title: "Stock Out",        value: String(outCount),         icon: "ArrowUpCircle",  color: "#f43f5e", warn: true, delta: `${outCount} outbound`, deltaPositive: false },
    { title: "Today's Activity", value: String(todayCount),       icon: "Activity",       color: "#049fd9", delta: todayCount > 0 ? `${todayCount} today` : "No movements today", deltaPositive: todayCount > 0 },
  ];

  const filtered = movements.filter((m) => {
    if (typeFilter === "in")  return isInbound(m.type);
    if (typeFilter === "out") return !isInbound(m.type);
    return true;
  });

  const topbarActions = (
    <>
      <Link href="/scan" className="flex items-center gap-1.5 rounded-[9px] border px-3 py-[7px] text-[13px] font-semibold transition-all" style={{ borderColor: "var(--line)", backgroundColor: "#fff", color: "var(--ink-2)" }}>
        <ScanLine size={14} /> Scan
      </Link>
      <button className="flex items-center gap-1.5 rounded-[9px] px-3 py-[7px] text-[13px] font-semibold text-white" style={{ backgroundColor: "var(--primary-hex)" }}>
        <Plus size={14} /> Record
      </button>
    </>
  );

  if (mode === "classic") {
    return (
      <div>
        <Topbar title="Stock Movements" actions={topbarActions} />
        <div className="mx-auto max-w-[1180px] space-y-6 p-6">
          <PageStatsRow stats={kpiStats} />
          <Card>
            <CardHeader><CardTitle>Record Movement</CardTitle></CardHeader>
            <CardContent>
              <RecordMovementForm products={products} locations={locations} inline />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Movement History</CardTitle>
              <span className="text-[12px] font-medium" style={{ color: "var(--muted-raw)" }}>Last 50</span>
            </CardHeader>
            <CardContent className="p-0">
              <MovementsTable movements={filtered} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === "command") {
    return (
      <div>
        <Topbar title="Stock Movements" actions={topbarActions} />
        <div className="mx-auto max-w-[1180px] p-6">
          <div className="flex gap-4 items-start">
            <div className="flex-[1.7] min-w-0 space-y-4">
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle>Movement History</CardTitle>
                  <div className="flex items-center gap-1.5">
                    <FilterChip active={typeFilter === "all"} onClick={() => setTypeFilter("all")}>All</FilterChip>
                    <FilterChip active={typeFilter === "in"}  onClick={() => setTypeFilter("in")}>IN</FilterChip>
                    <FilterChip active={typeFilter === "out"} onClick={() => setTypeFilter("out")}>OUT</FilterChip>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <MovementsTable movements={filtered} />
                </CardContent>
              </Card>
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="rounded-2xl p-[18px]" style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "4px solid #0ea5e9", boxShadow: "var(--shadow-card)" }}>
                <p className="text-[12.5px] font-semibold" style={{ color: "#64748b" }}>Total Movements</p>
                <p className="mt-3 text-[36px] font-bold leading-none" style={{ color: "#0ea5e9", letterSpacing: "-1.5px" }}>{movements.length}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "4px solid #22c55e", boxShadow: "var(--shadow-card)" }}>
                  <p className="text-[11.5px] font-semibold" style={{ color: "#64748b" }}>In</p>
                  <p className="mt-2 text-[24px] font-bold leading-none" style={{ color: "#22c55e", letterSpacing: "-0.5px" }}>{inCount}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "4px solid #f43f5e", boxShadow: "var(--shadow-card)" }}>
                  <p className="text-[11.5px] font-semibold" style={{ color: "#64748b" }}>Out</p>
                  <p className="mt-2 text-[24px] font-bold leading-none" style={{ color: "#f43f5e", letterSpacing: "-0.5px" }}>{outCount}</p>
                </div>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-[14px]">Quick Record</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  <RecordMovementForm products={products} locations={locations} />
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
      <Topbar title="Stock Movements" actions={topbarActions} />
      <div className="mx-auto max-w-[1180px] space-y-4 p-6">
        <Card>
          <CardHeader><CardTitle>Record Movement</CardTitle></CardHeader>
          <CardContent>
            <RecordMovementForm products={products} locations={locations} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-around gap-4">
              {[
                { value: String(movements.length), label: "Total" },
                { value: String(inCount),          label: "In",    color: "#22c55e" },
                { value: String(outCount),          label: "Out",   color: "#f43f5e" },
                { value: String(todayCount),        label: "Today" },
              ].map(({ value, label, color }, i, arr) => (
                <div key={label} className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[24px] font-bold leading-none" style={{ color: color || "var(--ink)", letterSpacing: "-0.5px" }}>{value}</p>
                    <p className="mt-1 text-[12.5px]" style={{ color: "var(--muted-raw)" }}>{label}</p>
                  </div>
                  {i < arr.length - 1 && <div className="h-8 w-[1.5px]" style={{ backgroundColor: "#e9edf3" }} />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Recent History</CardTitle>
            <span className="text-[12px]" style={{ color: "var(--muted-raw)" }}>Last 10</span>
          </CardHeader>
          <CardContent className="p-0">
            <MovementsTable movements={movements.slice(0, 10)} compact />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
