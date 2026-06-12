"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function TopProductsChart({ data, color }: { data: { name: string; out: number }[]; color: string }) {
  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">No movement data yet.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
        />
        <Bar dataKey="out" fill={color} radius={[0, 4, 4, 0]} name="Units Moved" />
      </BarChart>
    </ResponsiveContainer>
  );
}
