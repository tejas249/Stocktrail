"use client";

import {
  Package,
  AlertTriangle,
  DollarSign,
  Layers,
  ShoppingCart,
  CheckCircle,
  Clock,
  ArrowLeftRight,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  Truck,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { useLayoutMode } from "@/components/layout/layout-mode";

const ICON_MAP: Record<string, LucideIcon> = {
  Package,
  AlertTriangle,
  DollarSign,
  Layers,
  ShoppingCart,
  CheckCircle,
  Clock,
  ArrowLeftRight,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  Truck,
  ClipboardList,
};

export interface StatConfig {
  title: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  color: string;
  icon: string;
  warn?: boolean;
}

function StatIcon({ name, size, color }: { name: string; size: number; color: string }) {
  const Icon = ICON_MAP[name] ?? Package;
  return <Icon size={size} style={{ color }} />;
}

export function PageStatsRow({ stats }: { stats: StatConfig[] }) {
  const { isGlass } = useLayoutMode();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) =>
        isGlass ? (
          /* Glass variant */
          <div
            key={stat.title}
            style={{
              background: stat.warn
                ? "rgba(245,158,11,0.12)"
                : "rgba(255,255,255,0.07)",
              border: `1px solid ${stat.warn ? "rgba(245,158,11,0.30)" : "rgba(255,255,255,0.13)"}`,
              borderRadius: 14,
              padding: "20px 22px",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.10)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.60)", lineHeight: 1.3 }}>
                {stat.title}
              </p>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                backgroundColor: stat.warn ? "rgba(245,158,11,0.20)" : `${stat.color}25`,
                border: `1px solid ${stat.warn ? "rgba(245,158,11,0.35)" : `${stat.color}40`}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <StatIcon name={stat.icon} size={15} color={stat.warn ? "#fbbf24" : stat.color} />
              </div>
            </div>
            <p className="font-display" style={{
              fontSize: 30, fontWeight: 700, letterSpacing: "-1.2px", lineHeight: 1,
              color: stat.warn ? "#fbbf24" : "#f1f5f9",
            }}>
              {stat.value}
            </p>
            {stat.delta && (
              <p style={{ fontSize: 11.5, marginTop: 6, color: stat.deltaPositive ? "#4ade80" : "rgba(255,255,255,0.45)" }}>
                {stat.delta}
              </p>
            )}
          </div>
        ) : (
          /* Default light variant */
          <div
            key={stat.title}
            data-stat-card=""
            data-warn={stat.warn ? "" : undefined}
            style={{
              background: stat.warn ? "#fffbeb" : "#ffffff",
              border: `1px solid ${stat.warn ? "#fde68a" : "var(--line)"}`,
              borderRadius: 14,
              padding: "20px 22px",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--muted-raw)", lineHeight: 1.3 }}>{stat.title}</p>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                backgroundColor: stat.warn ? "rgba(245,158,11,.12)" : `${stat.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <StatIcon name={stat.icon} size={15} color={stat.warn ? "#d97706" : stat.color} />
              </div>
            </div>
            <p className="font-display" style={{
              fontSize: 30, fontWeight: 700, letterSpacing: "-1.2px", lineHeight: 1,
              color: stat.warn ? "#c2620a" : "var(--ink)",
            }}>
              {stat.value}
            </p>
            {stat.delta && (
              <p style={{ fontSize: 11.5, marginTop: 6, color: stat.deltaPositive ? "var(--green)" : "var(--muted-raw)" }}>
                {stat.delta}
              </p>
            )}
          </div>
        )
      )}
    </div>
  );
}
