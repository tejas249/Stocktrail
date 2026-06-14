"use client";

import { Topbar } from "@/components/layout/topbar";
import { useLayoutMode } from "@/components/layout/layout-mode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageStatsRow } from "@/components/ui/page-stats-row";
import { TopProductsChart } from "@/components/reports/top-products-chart";
import { MonthlyVolumeChart } from "@/components/reports/monthly-volume-chart";
import { ExportButton } from "@/components/reports/export-button";
import { formatCurrency } from "@/lib/utils";

interface Props {
  fastest: { name: string; out: number }[];
  slowest: { name: string; out: number }[];
  monthlyData: { month: string; in: number; out: number }[];
  topSuppliers: { name: string; orders: number; totalQty: number }[];
  totalStockValue: number;
  movementsCount: number;
  purchaseOrdersCount: number;
}

function SuppliersTable({ suppliers }: { suppliers: { name: string; orders: number; totalQty: number }[] }) {
  if (suppliers.length === 0) {
    return <p className="px-6 py-8 text-center text-sm" style={{ color: "var(--muted-raw)" }}>No purchase order data yet.</p>;
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr style={{ borderBottom: "1px solid var(--line-2)", backgroundColor: "var(--bg)" }}>
          <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>Supplier</th>
          <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>Orders</th>
          <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>Total Units</th>
        </tr>
      </thead>
      <tbody>
        {suppliers.map((s, i) => (
          <tr key={s.name} style={{ borderBottom: i < suppliers.length - 1 ? "1px solid var(--line-2)" : undefined }}>
            <td className="px-6 py-3 font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{s.name}</td>
            <td className="px-6 py-3 text-right font-mono text-[13px]" style={{ color: "var(--ink-2)" }}>{s.orders}</td>
            <td className="px-6 py-3 text-right font-mono font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{s.totalQty}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ReportsPageClient({ fastest, slowest, monthlyData, topSuppliers, totalStockValue, movementsCount, purchaseOrdersCount }: Props) {
  const { mode } = useLayoutMode();

  const kpiStats = [
    { title: "Current Stock Value",      value: formatCurrency(totalStockValue), icon: "DollarSign",    color: "#22c55e" },
    { title: "Total Movements Recorded", value: String(movementsCount),          icon: "ArrowLeftRight", color: "#049fd9" },
    { title: "Total Purchase Orders",    value: String(purchaseOrdersCount),     icon: "ClipboardList",  color: "#049fd9" },
  ];

  const exportAction = <ExportButton />;

  if (mode === "classic") {
    return (
      <div>
        <Topbar title="Reports" actions={exportAction} />
        <div className="mx-auto max-w-[1180px] space-y-6 p-6">
          <PageStatsRow stats={kpiStats} />

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fastest Moving Products</CardTitle>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--muted-raw)" }}>By units out</p>
              </CardHeader>
              <CardContent className="pt-0"><TopProductsChart data={fastest} color="#049fd9" /></CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Slowest Moving Products</CardTitle>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--muted-raw)" }}>Lowest outbound volume</p>
              </CardHeader>
              <CardContent className="pt-0"><TopProductsChart data={slowest} color="#f43f5e" /></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Monthly Stock In / Out Volume</CardTitle></CardHeader>
            <CardContent className="pt-0"><MonthlyVolumeChart data={monthlyData} /></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Top Suppliers by PO Volume</CardTitle></CardHeader>
            <CardContent className="p-0"><SuppliersTable suppliers={topSuppliers} /></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === "command") {
    return (
      <div>
        <Topbar title="Reports" actions={exportAction} />
        <div className="mx-auto max-w-[1180px] p-6">
          <div className="flex gap-4 items-start">
            <div className="flex-[1.7] min-w-0 space-y-4">
              <Card>
                <CardHeader><CardTitle>Monthly Stock In / Out Volume</CardTitle></CardHeader>
                <CardContent className="pt-0"><MonthlyVolumeChart data={monthlyData} /></CardContent>
              </Card>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[14px]">Fastest Moving</CardTitle>
                    <p className="text-[12px]" style={{ color: "var(--muted-raw)" }}>By units out</p>
                  </CardHeader>
                  <CardContent className="pt-0"><TopProductsChart data={fastest} color="#049fd9" /></CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[14px]">Slowest Moving</CardTitle>
                    <p className="text-[12px]" style={{ color: "var(--muted-raw)" }}>Lowest outbound volume</p>
                  </CardHeader>
                  <CardContent className="pt-0"><TopProductsChart data={slowest} color="#f43f5e" /></CardContent>
                </Card>
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="rounded-2xl p-[18px]" style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "4px solid #22c55e", boxShadow: "var(--shadow-card)" }}>
                <p className="text-[12.5px] font-semibold" style={{ color: "#64748b" }}>Stock Value</p>
                <p className="mt-3 text-[28px] font-bold leading-none" style={{ color: "#22c55e", letterSpacing: "-1px" }}>{formatCurrency(totalStockValue)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "3px solid #049fd9", boxShadow: "var(--shadow-card)" }}>
                  <p className="text-[11.5px] font-semibold" style={{ color: "#64748b" }}>Movements</p>
                  <p className="mt-2 text-[22px] font-bold leading-none" style={{ color: "#049fd9", letterSpacing: "-0.5px" }}>{movementsCount}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #e9edf3", borderLeft: "3px solid #049fd9", boxShadow: "var(--shadow-card)" }}>
                  <p className="text-[11.5px] font-semibold" style={{ color: "#64748b" }}>POs</p>
                  <p className="mt-2 text-[22px] font-bold leading-none" style={{ color: "#049fd9", letterSpacing: "-0.5px" }}>{purchaseOrdersCount}</p>
                </div>
              </div>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-[14px]">Top Suppliers</CardTitle></CardHeader>
                <CardContent className="p-0"><SuppliersTable suppliers={topSuppliers.slice(0, 5)} /></CardContent>
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
      <Topbar title="Reports" actions={<ExportButton />} />
      <div className="mx-auto max-w-[1180px] space-y-4 p-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-around gap-4">
              {[
                { value: formatCurrency(totalStockValue), label: "Stock Value", color: "#22c55e" },
                { value: String(movementsCount),           label: "Movements",  color: "#049fd9" },
                { value: String(purchaseOrdersCount),      label: "POs",        color: "#049fd9" },
              ].map(({ value, label, color }, i, arr) => (
                <div key={label} className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[22px] font-bold leading-none" style={{ color, letterSpacing: "-0.5px" }}>{value}</p>
                    <p className="mt-1 text-[12.5px]" style={{ color: "var(--muted-raw)" }}>{label}</p>
                  </div>
                  {i < arr.length - 1 && <div className="h-8 w-[1.5px]" style={{ backgroundColor: "#e9edf3" }} />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 items-start">
          <div className="flex-[1.4] min-w-0">
            <Card>
              <CardHeader><CardTitle>Monthly Volume</CardTitle></CardHeader>
              <CardContent className="pt-0"><MonthlyVolumeChart data={monthlyData} /></CardContent>
            </Card>
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-[14px]">Fastest Moving</CardTitle>
                <p className="text-[12px]" style={{ color: "var(--muted-raw)" }}>By units out</p>
              </CardHeader>
              <CardContent className="pt-0"><TopProductsChart data={fastest.slice(0, 5)} color="#049fd9" /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-[14px]">Top Suppliers</CardTitle></CardHeader>
              <CardContent className="p-0"><SuppliersTable suppliers={topSuppliers.slice(0, 5)} /></CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
