"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, TooltipProps } from "recharts";

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border px-3 py-2 text-[12px] shadow-xl"
      style={{ backgroundColor: "#ffffff", borderColor: "var(--line)", color: "var(--ink)" }}
    >
      <p className="font-semibold mb-1" style={{ color: "var(--muted-raw)" }}>{label}</p>
      <p style={{ color: payload[0].color as string }}>{payload[0].value} units</p>
    </div>
  );
}

export function TopProductsChart({ data, color }: { data: { name: string; out: number }[]; color: string }) {
  if (data.length === 0) {
    return <p className="py-12 text-center text-sm" style={{ color: "var(--muted-raw)" }}>No movement data yet.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--line)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-2)" }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: "var(--muted-raw)" }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(4,159,217,.05)" }} />
        <Bar dataKey="out" fill={color} radius={[0, 5, 5, 0]} name="Units Moved" />
      </BarChart>
    </ResponsiveContainer>
  );
}
