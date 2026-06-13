import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  icon: LucideIcon;
  color: string;
  className?: string;
}

export function StatCard({ title, value, delta, deltaPositive, icon: Icon, color, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-1 shadow-card hover:shadow-card-hover",
        className
      )}
      style={{
        borderColor: "var(--line)",
        borderLeft: `4px solid ${color}`,
      }}
    >
      {/* Radial accent wash revealed on hover via CSS group */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: `radial-gradient(360px 200px at -10% 50%, ${color}0a, transparent 65%)` }}
      />

      <div className="relative p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <p className="text-[13px] font-semibold leading-snug" style={{ color: "var(--muted-raw)" }}>
            {title}
          </p>
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${color}22 0%, ${color}0d 100%)`,
              boxShadow: `inset 0 0 0 1px ${color}28`,
            }}
          >
            <Icon size={17} style={{ color }} />
          </div>
        </div>

        <p className="text-[26px] font-bold tracking-tight leading-none" style={{ color: "var(--ink)" }}>
          {value}
        </p>

        {delta && (
          <p className="mt-1.5 text-[12px] font-semibold" style={{ color: deltaPositive ? "var(--green)" : "var(--rose)" }}>
            {delta}
          </p>
        )}
      </div>
    </div>
  );
}
