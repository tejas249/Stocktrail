"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span style={{ color: "var(--ink-2)" }}>{entry.name}:</span>
          <span className="font-bold ml-auto pl-3" style={{ color: entry.color }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

type Range = 7 | 30 | 90;

export function MovementsChart({ data }: { data: { date: string; in: number; out: number }[] }) {
  const [range, setRange] = useState<Range>(30);

  const filtered = useMemo(() => {
    if (!data.length) return data;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    const cut = cutoff.toISOString().slice(0, 10);
    const result = data.filter((d) => d.date >= cut);
    return result.length ? result : data.slice(-range);
  }, [data, range]);

  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm" style={{ color: "var(--muted-raw)" }}>
        No movement data yet.
      </p>
    );
  }

  return (
    <div>
      {/* Segmented range control */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-5">
          {[
            { color: "#049fd9", label: "Stock In" },
            { color: "#f43f5e", label: "Stock Out" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "var(--muted-raw)" }}>
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
        <div
          className="flex items-center gap-0.5 rounded-[9px] border p-[3px]"
          style={{ borderColor: "var(--line)", backgroundColor: "var(--bg)" }}
        >
          {([7, 30, 90] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="rounded-[6px] px-3 py-[5px] text-[12px] font-semibold transition-all duration-150"
              style={
                range === r
                  ? { background: "#fff", color: "var(--ink)", border: "1px solid var(--line)" }
                  : { color: "var(--muted-raw)", background: "transparent" }
              }
            >
              {r}D
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={filtered} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#049fd9" stopOpacity={0.34} />
              <stop offset="95%" stopColor="#049fd9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10.5, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
          />
          <YAxis
            tick={{ fontSize: 10.5, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--line)", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="out"
            stroke="#f43f5e"
            strokeWidth={2.4}
            fill="url(#gradOut)"
            name="Stock Out"
            dot={false}
            activeDot={{ r: 4.5, fill: "#f43f5e", stroke: "#fff", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="in"
            stroke="#049fd9"
            strokeWidth={2.6}
            fill="url(#gradIn)"
            name="Stock In"
            dot={false}
            activeDot={{ r: 4.5, fill: "#049fd9", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
