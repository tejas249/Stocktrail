"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/input";
import { PageStatsRow } from "@/components/ui/page-stats-row";
import { MovementsChart } from "@/components/dashboard/movements-chart";
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, Repeat, ScanLine, Package } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useLayoutMode } from "@/components/layout/layout-mode";

interface Movement {
  id: string;
  type: string;
  quantity: number;
  createdAt: string;
  product?: { name: string; sku?: string };
  location?: { name: string };
  user?: { name: string };
}

interface ChartPoint { date: string; in: number; out: number; }
interface LowStockProduct { name: string; qty: number; threshold: number; }

interface Props {
  totalProducts: number;
  lowStockCount: number;
  totalStockValue: number;
  pendingPOs: number;
  openTransfers: number;
  chartData: ChartPoint[];
  recentMovements: Movement[];
  lowStockProducts: LowStockProduct[];
}

function movementBadge(type: string) {
  if (type === "IN")          return "movement-in"           as const;
  if (type === "TRANSFER_IN") return "movement-transfer-in"  as const;
  if (type === "OUT")         return "movement-out"          as const;
  return                             "movement-transfer-out" as const;
}

function isInbound(type: string) {
  return type === "IN" || type === "TRANSFER_IN";
}

function LocationPill({ name }: { name?: string }) {
  return (
    <span
      className="inline-block rounded-[7px] border px-[9px] py-[3px] text-[12px] font-medium"
      style={{ backgroundColor: "var(--bg)", borderColor: "var(--line)", color: "var(--ink-2)" }}
    >
      {name}
    </span>
  );
}

function UserAvatar({ name }: { name?: string }) {
  return (
    <div className="flex items-center gap-[9px]">
      <div
        className="flex h-[27px] w-[27px] flex-shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold text-white"
        style={{ background: "var(--gradient-primary)" }}
      >
        {name?.charAt(0)?.toUpperCase() ?? "?"}
      </div>
      <span className="text-[13.5px]" style={{ color: "var(--ink-2)" }}>{name}</span>
    </div>
  );
}

function FullMovementsTable({ movements, compact }: { movements: Movement[]; compact?: boolean }) {
  const cols = compact
    ? ["Product", "Location", "Type", "Qty"]
    : ["Product", "Location", "Type", "Qty", "User", "Date"];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{compact ? "Recent Activity" : "Recent Stock Movements"}</CardTitle>
        <Link href="/movements" className="text-[12.5px] font-semibold hover:underline" style={{ color: "var(--primary-hex)" }}>
          View all →
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {movements.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm" style={{ color: "var(--muted-raw)" }}>
            No stock movements yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {cols.map((c) => (
                  <TableHead key={c} className={c === "Qty" ? "text-right" : ""}>{c}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => {
                const inbound = isInbound(m.type);
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <p className="font-semibold text-[13.5px]" style={{ color: "var(--ink)" }}>{m.product?.name}</p>
                      {m.product?.sku && (
                        <p className="font-mono text-[11.5px] mt-0.5" style={{ color: "var(--muted-2)" }}>{m.product.sku}</p>
                      )}
                    </TableCell>
                    <TableCell><LocationPill name={m.location?.name} /></TableCell>
                    <TableCell><Badge variant={movementBadge(m.type)}>{m.type}</Badge></TableCell>
                    <TableCell className="text-right font-mono font-semibold text-[13.5px]" style={{ color: inbound ? "#15803d" : "var(--rose)" }}>
                      {inbound ? "+" : "-"}{m.quantity}
                    </TableCell>
                    {!compact && (
                      <>
                        <TableCell><UserAvatar name={m.user?.name} /></TableCell>
                        <TableCell className="text-[12.5px] whitespace-nowrap" style={{ color: "var(--muted-raw)" }}>
                          {formatDate(m.createdAt)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ── Quick action button ────────────────────────────────────────────────────────
function QBtn({ icon: Icon, label, color, href }: { icon: React.ElementType; label: string; color?: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-[7px] rounded-[10px] border px-[14px] py-[9px] text-[13px] font-semibold transition-all duration-150 hover:-translate-y-0.5"
      style={{
        borderColor: "var(--line)",
        backgroundColor: "#fff",
        color: "var(--ink-2)",
        "--c": color || "var(--primary-hex)",
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.color = color || "var(--primary-hex)";
        el.style.borderColor = color ? `${color}66` : "rgba(4,159,217,.4)";
        el.style.background = color ? `${color}0d` : "rgba(4,159,217,.05)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.color = "var(--ink-2)";
        el.style.borderColor = "var(--line)";
        el.style.background = "#fff";
      }}
    >
      <Icon size={15} />
      {label}
    </Link>
  );
}

export function DashboardClient({
  totalProducts,
  lowStockCount,
  totalStockValue,
  pendingPOs,
  openTransfers,
  chartData,
  recentMovements,
  lowStockProducts,
}: Props) {
  const { mode } = useLayoutMode();

  return (
    <div className="mx-auto max-w-[1180px] space-y-5 p-6 pb-10">

      {/* ═══════════════════════════════════════════════
          A · CLASSIC STACK
          KPI row → chart → table (vertical)
         ═══════════════════════════════════════════════ */}
      {mode === "classic" && (
        <>
          <PageStatsRow stats={[
            { title: "Total Products",    value: String(totalProducts),          icon: "Package",       color: "#049fd9" },
            { title: "Low Stock Items",   value: String(lowStockCount),          icon: "AlertTriangle", color: "#f43f5e", warn: lowStockCount > 0,
              delta: lowStockCount > 0 ? `${lowStockCount} need restocking` : "All levels healthy", deltaPositive: lowStockCount === 0 },
            { title: "Total Stock Value", value: formatCurrency(totalStockValue), icon: "DollarSign",   color: "#10b981" },
            { title: "Pending POs",       value: String(pendingPOs),             icon: "ClipboardList", color: "#f59e0b",
              delta: pendingPOs > 0 ? `${pendingPOs} awaiting action` : "No pending orders", deltaPositive: pendingPOs === 0 },
          ]} />
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Stock Activity (90 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <MovementsChart data={chartData} />
            </CardContent>
          </Card>
          <FullMovementsTable movements={recentMovements} />
        </>
      )}

      {/* ═══════════════════════════════════════════════
          B · COMMAND CENTER
          Left: chart + activity table
          Right rail: featured metric + 2 compact + low-stock list
         ═══════════════════════════════════════════════ */}
      {mode === "command" && (
        <div className="flex gap-4 items-start">
          {/* Main column */}
          <div className="flex-[1.7] min-w-0 space-y-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Stock Movements — Last 30 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <MovementsChart data={chartData} />
              </CardContent>
            </Card>
            <FullMovementsTable movements={recentMovements} compact />
          </div>

          {/* Right rail */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Featured Total Products */}
            <div
              className="rounded-2xl p-[18px] transition-all duration-150 hover:-translate-y-0.5"
              style={{
                background: "#fff",
                border: "1px solid #e9edf3",
                borderLeft: "3px solid #049fd9",
                boxShadow: "0 1px 2px rgba(16,24,40,.04), 0 4px 16px rgba(16,24,40,.05)",
              }}
            >
              <p className="text-[12px] font-medium" style={{ color: "var(--muted-raw)" }}>Total Products</p>
              <p className="font-display mt-3 text-[38px] font-bold leading-none" style={{ color: "var(--primary-hex)", letterSpacing: "-1.8px" }}>
                {totalProducts}
              </p>
            </div>

            {/* 2-col: Stock Value + Pending POs */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Stock Value",  value: `$${Math.round(totalStockValue / 1000)}k`, color: "#10b981" },
                { label: "Pending POs", value: String(pendingPOs),                          color: "#f59e0b" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded-2xl p-4 hover:-translate-y-0.5 transition-transform duration-150"
                  style={{
                    background: "#fff",
                    border: "1px solid #e9edf3",
                    borderLeft: `4px solid ${color}`,
                    boxShadow: "0 1px 2px rgba(16,24,40,.04), 0 4px 16px rgba(16,24,40,.05)",
                  }}
                >
                  <p className="text-[11.5px] font-medium" style={{ color: "var(--muted-raw)" }}>{label}</p>
                  <p className="font-display mt-2 text-[24px] font-bold leading-none" style={{ color, letterSpacing: "-0.8px" }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Low Stock alerts */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid #e9edf3", boxShadow: "0 1px 2px rgba(16,24,40,.04), 0 4px 16px rgba(16,24,40,.05)" }}
            >
              <div
                className="flex items-center justify-between px-[18px] py-[14px]"
                style={{ backgroundColor: "#fbf4e6", borderBottom: "1px solid #f0e3c8" }}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} style={{ color: "#92400e" }} />
                  <span className="text-[15px] font-bold" style={{ color: "#1e1b17" }}>
                    Low Stock — {lowStockCount}
                  </span>
                </div>
                <Link
                  href="/alerts"
                  className="text-[12px] font-semibold hover:underline"
                  style={{ color: "#92400e" }}
                >
                  View all →
                </Link>
              </div>
              <div style={{ background: "#fffdf7" }}>
                {lowStockProducts.length === 0 ? (
                  <p className="px-5 py-6 text-center text-[13px]" style={{ color: "#64748b" }}>
                    All stock levels healthy
                  </p>
                ) : (
                  lowStockProducts.map((p, i) => (
                    <div
                      key={p.name}
                      className="flex items-center gap-3 px-[18px] py-[10px]"
                      style={{ borderBottom: i < lowStockProducts.length - 1 ? "1px dashed #e9e3d8" : "none" }}
                    >
                      <div
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: "rgba(245,158,11,.12)" }}
                      >
                        <Package size={13} style={{ color: "#92400e" }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold" style={{ color: "#1e1b17" }}>{p.name}</p>
                        <p className="text-[12px]" style={{ color: "#8a7355" }}>
                          {p.qty} left · reorder at {p.threshold}
                        </p>
                      </div>
                      <span
                        className="flex-shrink-0 rounded-full border px-[9px] py-[3px] text-[11px] font-bold"
                        style={{ background: "#fef4e0", borderColor: "#d97706", color: "#92400e" }}
                      >
                        LOW
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          C · ACTION-FIRST / TRIAGE
          KPI strip → Needs Attention + Quick Actions → Chart + Compact table
         ═══════════════════════════════════════════════ */}
      {mode === "triage" && (
        <>
          {/* KPI strip */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-around gap-4">
                {[
                  { value: String(totalProducts),          label: "Products" },
                  { value: String(lowStockCount),          label: "Low stock",   warn: true },
                  { value: formatCurrency(totalStockValue), label: "Stock value" },
                  { value: String(pendingPOs),             label: "Pending POs" },
                ].map(({ value, label, warn }, i, arr) => (
                  <div key={label} className="flex items-center gap-6">
                    <div className="text-center">
                      <p
                        className="text-[24px] font-bold leading-none"
                        style={{ color: warn && lowStockCount > 0 ? "#d97706" : "var(--ink)", letterSpacing: "-0.5px" }}
                      >
                        {value}
                      </p>
                      <p className="mt-1 text-[12.5px]" style={{ color: "var(--muted-raw)" }}>{label}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="h-8 w-[1.5px] self-stretch" style={{ backgroundColor: "#e9edf3" }} />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Needs Attention + Quick Actions */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
            {/* Needs Attention */}
            <div
              className="overflow-hidden rounded-2xl"
              style={{ border: "1px solid #e9edf3", boxShadow: "0 1px 2px rgba(16,24,40,.04), 0 4px 16px rgba(16,24,40,.05)" }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ backgroundColor: "#fbf4e6", borderBottom: "1px solid #f0e3c8" }}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} style={{ color: "#92400e" }} />
                  <span className="text-[15px] font-bold" style={{ color: "#1e1b17" }}>
                    Needs Attention
                  </span>
                </div>
                <span
                  className="rounded-full border px-[10px] py-[3px] text-[12px] font-bold"
                  style={{ background: "#fef4e0", borderColor: "#d97706", color: "#92400e" }}
                >
                  {lowStockCount + pendingPOs} items
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 p-4" style={{ backgroundColor: "#fffdf7" }}>
                {[
                  { label: "Reorder now",    value: String(lowStockCount),  href: "/alerts",         accent: true },
                  { label: "POs to approve", value: String(pendingPOs),     href: "/purchase-orders", accent: false },
                  { label: "Transfers open", value: String(openTransfers),  href: "/transfers",       accent: false },
                ].map(({ label, value, href, accent }) => (
                  <div
                    key={label}
                    className="rounded-xl border bg-white p-3"
                    style={{ borderColor: "var(--line)", boxShadow: "0 1px 3px rgba(16,24,40,.04)" }}
                  >
                    <p className="text-[13px]" style={{ color: "var(--muted-raw)" }}>{label}</p>
                    <p className="mt-1 text-[22px] font-bold leading-none" style={{ color: "var(--ink)", letterSpacing: "-0.5px" }}>
                      {value}
                    </p>
                    <Link
                      href={href}
                      className="mt-3 inline-flex items-center justify-center rounded-lg px-3 py-[7px] text-[13px] font-semibold transition-all duration-150 hover:-translate-y-0.5"
                      style={
                        accent
                          ? { backgroundColor: "var(--primary-hex)", color: "#fff" }
                          : { border: "1px solid var(--line)", backgroundColor: "#fff", color: "var(--ink-2)" }
                      }
                    >
                      {accent ? "Create PO" : label === "POs to approve" ? "Review" : "Open"}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <QBtn icon={ArrowDownCircle} label="Record IN"    color="#22c55e" href="/movements" />
                  <QBtn icon={ArrowUpCircle}   label="Record OUT"   color="#f43f5e" href="/movements" />
                  <QBtn icon={Repeat}          label="New transfer" color="#0ea5e9" href="/transfers" />
                  <QBtn icon={ScanLine}        label="Scan barcode" color="#049fd9" href="/scan"      />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart + Compact recent */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Movements — 30d</CardTitle>
              </CardHeader>
              <CardContent>
                <MovementsChart data={chartData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Recent</CardTitle>
                <Link href="/movements" className="text-[12.5px] font-semibold hover:underline" style={{ color: "var(--primary-hex)" }}>
                  View all →
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMovements.slice(0, 5).map((m) => {
                      const inbound = isInbound(m.type);
                      return (
                        <TableRow key={m.id}>
                          <TableCell className="text-[13.5px] font-semibold" style={{ color: "var(--ink)" }}>
                            {m.product?.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant={movementBadge(m.type)}>{m.type}</Badge>
                          </TableCell>
                          <TableCell
                            className="text-right font-mono font-semibold text-[13.5px]"
                            style={{ color: inbound ? "#15803d" : "var(--rose)" }}
                          >
                            {inbound ? "+" : "-"}{m.quantity}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {recentMovements.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center text-[13px]" style={{ color: "var(--muted-raw)" }}>
                          No movements yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
