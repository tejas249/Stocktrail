"use client";

import { useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { useLayoutMode } from "@/components/layout/layout-mode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageStatsRow } from "@/components/ui/page-stats-row";
import { StatCard } from "@/components/ui/stat-card";
import { ProductsTable } from "@/components/products/products-table";
import { AddProductDialog } from "@/components/products/add-product-dialog";
import { ImportProductsDialog } from "@/components/products/import-products-dialog";
import { Badge } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { Search, AlertTriangle, Package, ClipboardList } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  price: number;
  costPrice: number;
  reorderThreshold: number;
  stocks: { quantity: number; location: { name: string } }[];
  supplier: { name: string } | null;
}

interface Props {
  products: Product[];
  suppliers: { id: string; name: string }[];
  lowStockCount: number;
  totalStockValue: number;
  totalStockQty: number;
  canEdit: boolean;
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3 py-1 text-[12px] font-semibold transition-all duration-150"
      style={active
        ? { backgroundColor: "var(--primary-hex)", color: "#fff" }
        : { backgroundColor: "var(--line-2)", color: "var(--muted-raw)" }
      }
    >
      {children}
    </button>
  );
}

export function ProductsPageClient({ products, suppliers, lowStockCount, totalStockValue, totalStockQty, canEdit }: Props) {
  const { mode } = useLayoutMode();
  const [filter, setFilter] = useState<"all" | "low">("all");
  const [search, setSearch] = useState("");

  const kpiStats = [
    { title: "Total Products",    value: String(products.length),         icon: "Package",       color: "#4f46e5" },
    { title: "Low Stock Items",   value: String(lowStockCount),           icon: "AlertTriangle", color: "#ef4444", warn: true,
      delta: lowStockCount > 0 ? `${lowStockCount} need restocking` : "All levels healthy", deltaPositive: lowStockCount === 0 },
    { title: "Total Stock Value", value: formatCurrency(totalStockValue), icon: "DollarSign",   color: "#10b981" },
    { title: "Units in Stock",    value: totalStockQty.toLocaleString(),  icon: "Layers",        color: "#0ea5e9" },
  ];

  const filteredProducts = products.filter((p) => {
    const qty = p.stocks.reduce((s, st) => s + st.quantity, 0);
    if (filter === "low" && qty > p.reorderThreshold) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const topbarActions = canEdit ? (
    <>
      <ImportProductsDialog />
      <AddProductDialog suppliers={suppliers} />
    </>
  ) : undefined;

  const triageActions = canEdit ? (
    <>
      <ImportProductsDialog />
      <AddProductDialog suppliers={suppliers} />
    </>
  ) : undefined;

  /* ── Shared search + filter bar ── */
  const SearchBar = ({ full = false }) => (
    <div className={`flex items-center gap-2 ${full ? "flex-col sm:flex-row" : ""}`}>
      <label
        className="flex items-center gap-2 h-9 rounded-[9px] border px-3 cursor-text flex-1"
        style={{ borderColor: "var(--line)", backgroundColor: "#fff", minWidth: 180 }}
      >
        <Search size={14} style={{ color: "var(--muted-2)", flexShrink: 0 }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="bg-transparent outline-none flex-1 text-[13px] placeholder:text-[var(--muted-2)]"
          style={{ color: "var(--ink)" }}
        />
      </label>
      <div className="flex items-center gap-1.5">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All</FilterChip>
        <FilterChip active={filter === "low"} onClick={() => setFilter("low")}>Low Stock</FilterChip>
      </div>
    </div>
  );

  /* Low-stock alert panel (for command center) */
  const lowStockProducts = products
    .map((p) => ({ ...p, qty: p.stocks.reduce((s, st) => s + st.quantity, 0) }))
    .filter((p) => p.qty <= p.reorderThreshold)
    .sort((a, b) => a.qty - b.qty)
    .slice(0, 3);

  if (mode === "classic") {
    return (
      <div>
        <Topbar title="Products" actions={topbarActions} />
        <div className="mx-auto max-w-[1180px] space-y-6 p-6">
          <PageStatsRow stats={kpiStats} />
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>All Products</CardTitle>
              <SearchBar />
            </CardHeader>
            <CardContent className="p-0">
              <ProductsTable products={filteredProducts} canEdit={canEdit} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === "command") {
    return (
      <div>
        <Topbar title="Products" actions={topbarActions} />
        <div className="mx-auto max-w-[1180px] p-6">
          <div className="flex gap-4 items-start">
            {/* Main col */}
            <div className="flex-[1.8] min-w-0 space-y-4">
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle>Products</CardTitle>
                  <SearchBar />
                </CardHeader>
                <CardContent className="p-0">
                  <ProductsTable products={filteredProducts} canEdit={canEdit} />
                </CardContent>
              </Card>
            </div>

            {/* Right rail */}
            <div className="flex-1 min-w-0 space-y-3">
              <div
                className="rounded-2xl p-[18px]"
                style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "4px solid #4f46e5", boxShadow: "var(--shadow-card)" }}
              >
                <p className="text-[12.5px] font-semibold" style={{ color: "#64748b" }}>Total Products</p>
                <p className="mt-3 text-[36px] font-bold leading-none" style={{ color: "#4f46e5", letterSpacing: "-1.5px" }}>
                  {products.length}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-2xl p-4"
                  style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "4px solid #ef4444", boxShadow: "var(--shadow-card)" }}
                >
                  <p className="text-[11.5px] font-semibold" style={{ color: "#64748b" }}>Low Stock</p>
                  <p className="mt-2 text-[22px] font-bold leading-none" style={{ color: "#ef4444", letterSpacing: "-0.5px" }}>{lowStockCount}</p>
                </div>
                <div
                  className="rounded-2xl p-4"
                  style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "4px solid #10b981", boxShadow: "var(--shadow-card)" }}
                >
                  <p className="text-[11.5px] font-semibold" style={{ color: "#64748b" }}>Stock Value</p>
                  <p className="mt-2 text-[16px] font-bold leading-none" style={{ color: "#10b981", letterSpacing: "-0.3px" }}>{formatCurrency(totalStockValue)}</p>
                </div>
              </div>

              {/* Low stock alert panel */}
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e9edf3", boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-center justify-between px-[18px] py-[14px]" style={{ backgroundColor: "#fffbeb", borderBottom: "1px solid #fde68a" }}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} style={{ color: "#92400e" }} />
                    <span className="text-[14px] font-bold" style={{ color: "#1e1b17" }}>Low Stock Alert</span>
                  </div>
                  <Link href="/alerts" className="text-[12px] font-semibold hover:underline" style={{ color: "#92400e" }}>View all →</Link>
                </div>
                <div style={{ background: "#fffdf7" }}>
                  {lowStockProducts.length === 0 ? (
                    <p className="px-5 py-6 text-center text-[13px]" style={{ color: "#64748b" }}>All levels healthy</p>
                  ) : (
                    <>
                      {lowStockProducts.map((p, i) => (
                        <div key={p.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < lowStockProducts.length - 1 ? "1px dashed #e9e3d8" : "none" }}>
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(245,158,11,.12)" }}>
                            <Package size={13} style={{ color: "#92400e" }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold" style={{ color: "#1e1b17" }}>{p.name}</p>
                            <p className="text-[11.5px]" style={{ color: "#8a7355" }}>{p.qty} left · reorder at {p.reorderThreshold}</p>
                          </div>
                          <span className="flex-shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold" style={{ background: "#fef4e0", borderColor: "#d97706", color: "#92400e" }}>LOW</span>
                        </div>
                      ))}
                      <div className="p-3">
                        <Link
                          href="/purchase-orders"
                          className="flex w-full items-center justify-center rounded-[9px] py-2 text-[13px] font-semibold transition-all"
                          style={{ backgroundColor: "var(--primary-hex)", color: "#fff" }}
                        >
                          Create PO
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Triage */
  return (
    <div data-layout="triage">
      <Topbar title="Products" actions={triageActions} />
      <div className="mx-auto max-w-[1180px] space-y-4 p-6">
        {/* KPI strip */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-around gap-4">
              {[
                { value: String(products.length), label: "Products" },
                { value: String(lowStockCount),   label: "Low Stock", warn: lowStockCount > 0 },
                { value: formatCurrency(totalStockValue), label: "Stock Value" },
                { value: totalStockQty.toLocaleString(), label: "Units" },
              ].map(({ value, label, warn }, i, arr) => (
                <div key={label} className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[24px] font-bold leading-none" style={{ color: warn ? "#d97706" : "var(--ink)", letterSpacing: "-0.5px" }}>{value}</p>
                    <p className="mt-1 text-[12.5px]" style={{ color: "var(--muted-raw)" }}>{label}</p>
                  </div>
                  {i < arr.length - 1 && <div className="h-8 w-[1.5px]" style={{ backgroundColor: "#e9edf3" }} />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <SearchBar />
        </div>

        <Card>
          <CardContent className="p-0">
            <ProductsTable products={filteredProducts} canEdit={canEdit} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
