"use client";

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
      style={{ backgroundColor: "#1e1533", borderColor: "rgba(255,255,255,.1)", color: "#f1f5f9" }}
    >
      <p className="mb-1.5 font-semibold" style={{ color: "#94a3b8" }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span style={{ color: "#c4cedd" }}>{entry.name}:</span>
          <span className="font-bold ml-auto pl-3" style={{ color: entry.color }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function MovementsChart({ data }: { data: { date: string; in: number; out: number }[] }) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm" style={{ color: "var(--muted-raw)" }}>
        No movement data for the last 30 days.
      </p>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.34} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--muted-2)" }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-2)" }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--line)", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="in"
            stroke="#7c3aed"
            strokeWidth={2}
            fill="url(#gradIn)"
            name="Stock In"
            dot={false}
            activeDot={{ r: 4, fill: "#7c3aed", strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="out"
            stroke="#f43f5e"
            strokeWidth={2}
            fill="url(#gradOut)"
            name="Stock Out"
            dot={false}
            activeDot={{ r: 4, fill: "#f43f5e", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 flex justify-center gap-5">
        {[{ color: "#7c3aed", label: "Stock In" }, { color: "#f43f5e", label: "Stock Out" }].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "var(--muted-raw)" }}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
