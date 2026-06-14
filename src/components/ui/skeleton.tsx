import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton", className)} {...props} />;
}

export function SkeletonTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--line)", backgroundColor: "var(--surface)" }}>
      {/* Header */}
      <div className="flex gap-4 px-4 py-3" style={{ borderBottom: "1px solid var(--line)", backgroundColor: "var(--bg)" }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3" style={{ width: `${60 + (i % 3) * 30}px`, flexShrink: 0 }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, ri) => (
        <div
          key={ri}
          className="flex items-center gap-4 px-4 py-[13px]"
          style={{ borderBottom: ri < rows - 1 ? "1px dashed var(--line-2)" : "none" }}
        >
          {Array.from({ length: cols }).map((_, ci) => (
            <Skeleton
              key={ci}
              className="h-4"
              style={{
                width: ci === 0 ? "120px" : ci === cols - 1 ? "60px" : `${80 + ((ri + ci) % 4) * 20}px`,
                flexShrink: 0,
                opacity: 0.7 + (ri % 3) * 0.1,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: "var(--line)", backgroundColor: "var(--surface)" }}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function SkeletonStatsRow({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
