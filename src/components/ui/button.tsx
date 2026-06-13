import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(124,58,237,.25)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#7c3aed] text-white shadow-[0_1px_2px_rgba(16,24,40,.1)] hover:bg-[#6d28d9] active:bg-[#5b21b6]",
        outline:
          "border border-[var(--line)] bg-white text-[var(--ink-2)] hover:border-[#7c3aed] hover:text-[#7c3aed] hover:bg-[rgba(124,58,237,.05)]",
        ghost:
          "bg-transparent text-[var(--ink-2)] hover:bg-[var(--hover)] hover:text-[var(--ink)]",
        destructive:
          "bg-[#ef4444] text-white shadow-[0_1px_2px_rgba(16,24,40,.1)] hover:bg-[#dc2626] active:bg-[#b91c1c]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
