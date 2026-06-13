import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-[10px] border px-3 py-2 text-sm transition-shadow duration-150 placeholder:text-[var(--muted-raw)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(124,58,237,.2)] disabled:opacity-50",
        className
      )}
      style={{ borderColor: "var(--line)", backgroundColor: "white", color: "var(--ink)" }}
      {...props}
    />
  )
);
Input.displayName = "Input";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-semibold leading-none", className)}
      style={{ color: "var(--ink-2)" }}
      {...props}
    />
  )
);
Label.displayName = "Label";

/* ── Badge ──────────────────────────────────────────────────────────────── */

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  /* movement-type variants */
  | "movement-in"
  | "movement-transfer-in"
  | "movement-out"
  | "movement-transfer-out";

const badgeStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
  },
  success: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    border: "1px solid #bbf7d0",
  },
  warning: {
    backgroundColor: "#fef9c3",
    color: "#a16207",
    border: "1px solid #fde68a",
  },
  destructive: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
  },
  /* filled green */
  "movement-in": {
    backgroundColor: "#22c55e",
    color: "#fff",
    border: "none",
  },
  /* filled sky */
  "movement-transfer-in": {
    backgroundColor: "#0ea5e9",
    color: "#fff",
    border: "none",
  },
  /* outline rose */
  "movement-out": {
    backgroundColor: "transparent",
    color: "#f43f5e",
    border: "1px solid #f43f5e",
  },
  /* outline amber */
  "movement-transfer-out": {
    backgroundColor: "transparent",
    color: "#f59e0b",
    border: "1px solid #f59e0b",
  },
};

function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        className
      )}
      style={badgeStyles[variant]}
      {...props}
    />
  );
}

export { Input, Label, Badge };
