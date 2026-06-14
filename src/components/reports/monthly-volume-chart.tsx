"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  TooltipProps,
} from "recharts";

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border px-3 py-2.5 text-[12px] shadow-xl"
      style={{ backgroundColor: "#ffffff", borderColor: "var(--line)", color: "var(--ink)" }}
    >
      <p className="mb-1.5 font-semibold" style={{ color: "var(--muted-raw)" }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color as string }} />
          <span style={{ color: "var(--ink-2)" }}>{entry.name}:</span>
          <span className="font-bold ml-auto pl-3" style={{ color: entry.color as string }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function MonthlyVolumeChart({ data }: { data: { month: string; in: number; out: number }[] }) {
  if (data.length === 0) {
    return <p className="py-12 text-center text-sm" style={{ color: "var(--muted-raw)" }}>No movement data yet.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--line)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-2)" }} axisLine={false} tickLine={false} tickMargin={8} />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted-2)" }} axisLine={false} tickLine={false} tickMargin={8} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(4,159,217,.05)" }} />
        <Legend
          wrapperStyle={{ fontSize: "12px", color: "var(--muted-raw)", paddingTop: "12px" }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="in" fill="#049fd9" name="Stock In" radius={[4, 4, 0, 0]} />
        <Bar dataKey="out" fill="#f43f5e" name="Stock Out" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
