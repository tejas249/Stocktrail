"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  icon: LucideIcon;
  color: string;
  className?: string;
  compact?: boolean;
}

export function StatCard({
  title,
  value,
  delta,
  deltaPositive,
  icon: Icon,
  color,
  className,
  compact = false,
}: StatCardProps) {
  const DeltaIcon =
    deltaPositive === undefined ? Minus : deltaPositive ? TrendingUp : TrendingDown;
  const deltaColor =
    deltaPositive === undefined ? "#94a3b8" : deltaPositive ? "#22c55e" : "#f43f5e";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl transition-all duration-200 ease-out cursor-default",
        "hover:-translate-y-1",
        compact ? "p-4" : "p-[18px]",
        className
      )}
      style={{
        background: "#ffffff",
        border: "1px solid #e9edf3",
        borderLeft: `4px solid ${color}`,
        boxShadow: "0 1px 2px rgba(16,24,40,.04), 0 4px 16px rgba(16,24,40,.05)",
      }}
      onMouseOver={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "0 6px 16px rgba(16,24,40,.09), 0 14px 36px rgba(16,24,40,.08)";
        el.style.borderLeftWidth = "5px";
      }}
      onMouseOut={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "0 1px 2px rgba(16,24,40,.04), 0 4px 16px rgba(16,24,40,.05)";
        el.style.borderLeftWidth = "4px";
      }}
    >
      {/* Ambient radial glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120% 80% at 0% 0%, ${color}12, transparent 60%)`,
        }}
      />

      {/* Top row: label + icon */}
      <div className={cn("flex items-center justify-between gap-3", compact ? "mb-2" : "mb-3.5")}>
        <p className="text-[12.5px] font-semibold leading-snug" style={{ color: "#64748b", letterSpacing: "0.1px" }}>
          {title}
        </p>
        <div
          className="flex flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
          style={{
            width: compact ? 36 : 40,
            height: compact ? 36 : 40,
            background: `linear-gradient(140deg, ${color}33, ${color}14)`,
            boxShadow: `inset 0 0 0 1px ${color}2e`,
          }}
        >
          <Icon size={compact ? 17 : 20} style={{ color, strokeWidth: 2.1 }} />
        </div>
      </div>

      {/* Value */}
      <p
        className="leading-none"
        style={{
          fontSize: compact ? 24 : 30,
          fontWeight: 750,
          letterSpacing: "-1px",
          color: "var(--ink)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {value}
      </p>

      {/* Delta */}
      {delta && (
        <div className="mt-2.5 flex items-center gap-1.5">
          <DeltaIcon size={13} style={{ color: deltaColor }} strokeWidth={2.5} />
          <p className="text-[12px] font-semibold" style={{ color: deltaColor }}>
            {delta}
          </p>
        </div>
      )}
    </div>
  );
}
