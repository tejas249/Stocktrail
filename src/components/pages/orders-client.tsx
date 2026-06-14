"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { useLayoutMode } from "@/components/layout/layout-mode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageStatsRow } from "@/components/ui/page-stats-row";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/input";
import { CreateOrderDialog } from "@/components/orders/create-order-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search } from "lucide-react";

type BadgeVariant = "default" | "success" | "warning" | "destructive";

const orderStatusVariant = (status: string): BadgeVariant => {
  if (status === "COMPLETED") return "success";
  if (status === "CANCELLED") return "destructive";
  return "warning";
};

interface OrderItem { id: string; product?: { name: string }; quantity: number; }
interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  customer?: { name: string };
  items: OrderItem[];
}

interface Props {
  orders: Order[];
  products: { id: string; name: string; sku: string; price: number }[];
  locations: { id: string; name: string }[];
  completedCount: number;
  pendingCount: number;
  totalRevenue: number;
  canCreate: boolean;
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

export function OrdersPageClient({ orders, products, locations, completedCount, pendingCount, totalRevenue, canCreate }: Props) {
  const { mode } = useLayoutMode();
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [search, setSearch] = useState("");

  const kpiStats = [
    { title: "Total Orders",     value: String(orders.length),       icon: "ShoppingCart", color: "#22c55e" },
    { title: "Pending / Active", value: String(pendingCount),         icon: "Clock",        color: "#f59e0b", warn: pendingCount > 0,
      delta: pendingCount > 0 ? `${pendingCount} awaiting action` : "All resolved", deltaPositive: pendingCount === 0 },
    { title: "Completed",        value: String(completedCount),       icon: "CheckCircle",  color: "#10b981" },
    { title: "Total Revenue",    value: formatCurrency(totalRevenue), icon: "DollarSign",   color: "#049fd9" },
  ];

  const topbarActions = canCreate ? <CreateOrderDialog products={products} locations={locations} /> : undefined;

  const filtered = orders.filter((o) => {
    if (statusFilter === "pending")   return o.status !== "COMPLETED" && o.status !== "CANCELLED";
    if (statusFilter === "completed") return o.status === "COMPLETED";
    if (search) {
      const q = search.toLowerCase();
      return o.id.includes(q) || o.customer?.name?.toLowerCase().includes(q);
    }
    return true;
  });

  const OrdersTable = ({ rows }: { rows: Order[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((o) => (
          <TableRow key={o.id}>
            <TableCell className="font-mono font-semibold text-[12px]" style={{ color: "var(--primary-hex)" }}>
              #{o.id.slice(-8)}
            </TableCell>
            <TableCell className="font-medium text-[13px]" style={{ color: "var(--ink)" }}>
              {o.customer?.name || "Walk-in"}
            </TableCell>
            <TableCell className="text-[12px]" style={{ color: "var(--muted-raw)" }}>
              {o.items.map((i) => `${i.product?.name} ×${i.quantity}`).join(", ")}
            </TableCell>
            <TableCell className="text-right font-mono font-bold text-[13px]" style={{ color: "var(--ink)" }}>
              {formatCurrency(o.totalAmount)}
            </TableCell>
            <TableCell><Badge variant={orderStatusVariant(o.status)}>{o.status}</Badge></TableCell>
            <TableCell className="text-[12px]" style={{ color: "var(--muted-raw)" }}>{formatDate(o.createdAt)}</TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="py-10 text-center text-sm" style={{ color: "var(--muted-raw)" }}>No orders yet.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  if (mode === "classic") {
    return (
      <div>
        <Topbar title="Orders" actions={topbarActions} />
        <div className="mx-auto max-w-[1180px] space-y-6 p-6">
          <PageStatsRow stats={kpiStats} />
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>All Orders</CardTitle>
              <div className="flex items-center gap-2">
                <FilterChip active={statusFilter === "all"}       onClick={() => setStatusFilter("all")}>All</FilterChip>
                <FilterChip active={statusFilter === "pending"}   onClick={() => setStatusFilter("pending")}>Pending</FilterChip>
                <FilterChip active={statusFilter === "completed"} onClick={() => setStatusFilter("completed")}>Completed</FilterChip>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <OrdersTable rows={filtered} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === "command") {
    return (
      <div>
        <Topbar title="Orders" actions={topbarActions} />
        <div className="mx-auto max-w-[1180px] p-6">
          <div className="flex gap-4 items-start">
            <div className="flex-[1.7] min-w-0 space-y-4">
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle>Orders</CardTitle>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 h-9 rounded-[9px] border px-3 cursor-text" style={{ borderColor: "var(--line)", backgroundColor: "#fff" }}>
                      <Search size={14} style={{ color: "var(--muted-2)" }} />
                      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders…" className="bg-transparent outline-none text-[13px] placeholder:text-[var(--muted-2)] w-32" style={{ color: "var(--ink)" }} />
                    </label>
                    <FilterChip active={statusFilter === "all"}       onClick={() => setStatusFilter("all")}>All</FilterChip>
                    <FilterChip active={statusFilter === "pending"}   onClick={() => setStatusFilter("pending")}>Pending</FilterChip>
                    <FilterChip active={statusFilter === "completed"} onClick={() => setStatusFilter("completed")}>Completed</FilterChip>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <OrdersTable rows={filtered} />
                </CardContent>
              </Card>
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="rounded-2xl p-[18px]" style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "3px solid #049fd9", boxShadow: "var(--shadow-card)" }}>
                <p className="text-[12.5px] font-semibold" style={{ color: "#64748b" }}>Total Revenue</p>
                <p className="mt-3 text-[28px] font-bold leading-none" style={{ color: "#049fd9", letterSpacing: "-1px" }}>{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "4px solid #f59e0b", boxShadow: "var(--shadow-card)" }}>
                  <p className="text-[11.5px] font-semibold" style={{ color: "#64748b" }}>Pending</p>
                  <p className="mt-2 text-[24px] font-bold leading-none" style={{ color: "#f59e0b", letterSpacing: "-0.5px" }}>{pendingCount}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "4px solid #10b981", boxShadow: "var(--shadow-card)" }}>
                  <p className="text-[11.5px] font-semibold" style={{ color: "#64748b" }}>Done</p>
                  <p className="mt-2 text-[24px] font-bold leading-none" style={{ color: "#10b981", letterSpacing: "-0.5px" }}>{completedCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Triage */
  const cancelledCount = orders.filter((o) => o.status === "CANCELLED").length;

  return (
    <div data-layout="triage">
      <Topbar title="Orders" actions={topbarActions} />
      <div className="mx-auto max-w-[1180px] space-y-4 p-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-around gap-4">
              {[
                { value: String(orders.length),       label: "Total" },
                { value: String(pendingCount),         label: "Pending",   color: "#f59e0b" },
                { value: String(completedCount),       label: "Completed", color: "#10b981" },
                { value: formatCurrency(totalRevenue), label: "Revenue",   color: "#049fd9" },
              ].map(({ value, label, color }, i, arr) => (
                <div key={label} className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[22px] font-bold leading-none" style={{ color: color || "var(--ink)", letterSpacing: "-0.5px" }}>{value}</p>
                    <p className="mt-1 text-[12.5px]" style={{ color: "var(--muted-raw)" }}>{label}</p>
                  </div>
                  {i < arr.length - 1 && <div className="h-8 w-[1.5px]" style={{ backgroundColor: "#e9edf3" }} />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pending",   count: pendingCount,   color: "#f59e0b", bg: "#fffbeb" },
            { label: "Completed", count: completedCount,  color: "#15803d", bg: "#f0fdf4" },
            { label: "Cancelled", count: cancelledCount, color: "#b91c1c", bg: "#fef2f2" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl py-6 text-center" style={{ backgroundColor: s.bg, border: `1px solid ${s.color}30` }}>
              <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: s.color }}>{s.label}</p>
              <p className="mt-2 text-[40px] font-bold leading-none" style={{ color: s.color, letterSpacing: "-1px" }}>{s.count}</p>
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            <OrdersTable rows={orders} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
