import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-[10px] border px-3 py-2 text-sm transition-all duration-150 placeholder:text-[var(--muted-raw)] hover:border-[var(--muted-2)] focus-visible:outline-none focus-visible:border-[var(--primary-hex)] focus-visible:shadow-[0_0_0_3px_var(--primary-soft)] disabled:opacity-50 disabled:cursor-not-allowed",
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
    backgroundColor: "rgba(100,116,139,.08)",
    color: "var(--muted-raw)",
    border: "1px solid var(--line)",
  },
  success: {
    backgroundColor: "rgba(34,197,94,.08)",
    color: "#16a34a",
    border: "1px solid #22c55e",
  },
  warning: {
    backgroundColor: "rgba(245,158,11,.08)",
    color: "#b45309",
    border: "1px solid #f59e0b",
  },
  destructive: {
    backgroundColor: "rgba(244,63,94,.08)",
    color: "#e11d48",
    border: "1px solid #f43f5e",
  },
  "movement-in": {
    backgroundColor: "rgba(34,197,94,.08)",
    color: "#16a34a",
    border: "1px solid #22c55e",
  },
  "movement-transfer-in": {
    backgroundColor: "rgba(14,165,233,.08)",
    color: "#0284c7",
    border: "1px solid #0ea5e9",
  },
  "movement-out": {
    backgroundColor: "rgba(245,158,11,.08)",
    color: "#b45309",
    border: "1px solid #f59e0b",
  },
  "movement-transfer-out": {
    backgroundColor: "rgba(139,92,246,.08)",
    color: "#7c3aed",
    border: "1px solid #8b5cf6",
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
        "inline-flex items-center rounded-full px-[9px] py-[3px] text-[11px] font-bold whitespace-nowrap",
        className
      )}
      style={badgeStyles[variant]}
      {...props}
    />
  );
}

export { Input, Label, Badge };
