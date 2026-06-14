"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { useLayoutMode } from "@/components/layout/layout-mode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageStatsRow } from "@/components/ui/page-stats-row";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AddSupplierDialog } from "@/components/suppliers/add-supplier-dialog";
import { Search } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  contactEmail?: string;
  phone?: string;
  _count: { products: number; purchaseOrders: number };
}

interface Props {
  suppliers: Supplier[];
  totalProducts: number;
  totalPOs: number;
  activeSuppliers: number;
  activePOs: number;
}

export function SuppliersPageClient({ suppliers, totalProducts, totalPOs, activeSuppliers, activePOs }: Props) {
  const { mode } = useLayoutMode();
  const [search, setSearch] = useState("");

  const kpiStats = [
    { title: "Total Suppliers",  value: String(suppliers.length), icon: "Truck",        color: "#f97316" },
    { title: "Active Suppliers", value: String(activeSuppliers),  icon: "CheckCircle",  color: "#22c55e",
      delta: `${activeSuppliers} with products`, deltaPositive: activeSuppliers > 0 },
    { title: "Linked Products",  value: String(totalProducts),    icon: "Package",      color: "#049fd9" },
    { title: "Purchase Orders",  value: String(totalPOs),         icon: "ClipboardList", color: "#f59e0b",
      delta: activePOs > 0 ? `${activePOs} active` : "None pending", deltaPositive: activePOs === 0 },
  ];

  const filtered = suppliers.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  const topbarActions = <AddSupplierDialog />;

  const SupplierAvatar = ({ name }: { name: string }) => (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white" style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)" }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );

  const SuppliersTable = ({ rows }: { rows: Supplier[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Supplier</TableHead>
          <TableHead>Contact Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead className="text-right">Products</TableHead>
          <TableHead className="text-right">Purchase Orders</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((s) => (
          <TableRow key={s.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <SupplierAvatar name={s.name} />
                <span className="font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{s.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-[13px]" style={{ color: "var(--muted-raw)" }}>{s.contactEmail || "—"}</TableCell>
            <TableCell className="text-[13px]" style={{ color: "var(--muted-raw)" }}>{s.phone || "—"}</TableCell>
            <TableCell className="text-right font-mono font-semibold text-[13px]" style={{ color: "var(--ink-2)" }}>{s._count.products}</TableCell>
            <TableCell className="text-right font-mono font-semibold text-[13px]" style={{ color: "var(--ink-2)" }}>{s._count.purchaseOrders}</TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="py-10 text-center text-sm" style={{ color: "var(--muted-raw)" }}>
              No suppliers yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const SearchInput = () => (
    <label className="flex items-center gap-2 h-9 rounded-[9px] border px-3 cursor-text" style={{ borderColor: "var(--line)", backgroundColor: "#fff" }}>
      <Search size={14} style={{ color: "var(--muted-2)", flexShrink: 0 }} />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search suppliers…"
        className="bg-transparent outline-none text-[13px] placeholder:text-[var(--muted-2)] w-44"
        style={{ color: "var(--ink)" }}
      />
    </label>
  );

  if (mode === "classic") {
    return (
      <div>
        <Topbar title="Suppliers" actions={topbarActions} />
        <div className="mx-auto max-w-[1180px] space-y-6 p-6">
          <PageStatsRow stats={kpiStats} />
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>All Suppliers</CardTitle>
              <span className="text-[13px]" style={{ color: "var(--muted-raw)" }}>{suppliers.length} registered</span>
            </CardHeader>
            <CardContent className="p-0">
              <SuppliersTable rows={filtered} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === "command") {
    const topThree = [...suppliers].sort((a, b) => b._count.products - a._count.products).slice(0, 3);

    return (
      <div>
        <Topbar title="Suppliers" actions={topbarActions} />
        <div className="mx-auto max-w-[1180px] p-6">
          <div className="flex gap-4 items-start">
            <div className="flex-[1.8] min-w-0 space-y-4">
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle>Suppliers</CardTitle>
                  <SearchInput />
                </CardHeader>
                <CardContent className="p-0">
                  <SuppliersTable rows={filtered} />
                </CardContent>
              </Card>
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="rounded-2xl p-[18px]" style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "4px solid #f97316", boxShadow: "var(--shadow-card)" }}>
                <p className="text-[12.5px] font-semibold" style={{ color: "#64748b" }}>Total Suppliers</p>
                <p className="mt-3 text-[36px] font-bold leading-none" style={{ color: "#f97316", letterSpacing: "-1.5px" }}>{suppliers.length}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "4px solid #22c55e", boxShadow: "var(--shadow-card)" }}>
                  <p className="text-[11.5px] font-semibold" style={{ color: "#64748b" }}>Active</p>
                  <p className="mt-2 text-[24px] font-bold leading-none" style={{ color: "#22c55e", letterSpacing: "-0.5px" }}>{activeSuppliers}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "3px solid #049fd9", boxShadow: "var(--shadow-card)" }}>
                  <p className="text-[11.5px] font-semibold" style={{ color: "#64748b" }}>Products</p>
                  <p className="mt-2 text-[24px] font-bold leading-none" style={{ color: "#049fd9", letterSpacing: "-0.5px" }}>{totalProducts}</p>
                </div>
              </div>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-[14px]">Top Suppliers</CardTitle></CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {topThree.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 py-1">
                      <SupplierAvatar name={s.name} />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[13px] font-semibold" style={{ color: "var(--ink)" }}>{s.name}</p>
                      </div>
                      <span className="text-[12px] font-mono font-bold" style={{ color: "var(--primary-hex)" }}>{s._count.products} products</span>
                    </div>
                  ))}
                  {topThree.length === 0 && <p className="text-[13px] text-center py-2" style={{ color: "var(--muted-raw)" }}>No suppliers yet</p>}
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
      <Topbar title="Suppliers" actions={topbarActions} />
      <div className="mx-auto max-w-[1180px] space-y-4 p-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-around gap-4">
              {[
                { value: String(suppliers.length), label: "Total" },
                { value: String(activeSuppliers),  label: "Active" },
                { value: String(totalProducts),    label: "Products" },
                { value: String(totalPOs),         label: "POs" },
              ].map(({ value, label }, i, arr) => (
                <div key={label} className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[24px] font-bold leading-none" style={{ color: "var(--ink)", letterSpacing: "-0.5px" }}>{value}</p>
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
            <CardTitle>Suppliers</CardTitle>
            <AddSupplierDialog />
          </CardHeader>
          <CardContent className="p-0">
            <SuppliersTable rows={filtered} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
