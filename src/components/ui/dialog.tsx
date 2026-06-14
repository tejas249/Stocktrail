"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;

function DialogContent({ className, children, ...props }: DialogPrimitive.DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-[overlay-in_150ms_ease] data-[state=closed]:animate-[overlay-out_100ms_ease]" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6",
          "data-[state=open]:animate-[dialog-in_200ms_cubic-bezier(0.16,1,0.3,1)]",
          "data-[state=closed]:animate-[dialog-out_150ms_ease]",
          className
        )}
        style={{
          borderColor: "var(--line)",
          boxShadow: "0 24px 64px rgba(15,23,42,.18), 0 4px 16px rgba(15,23,42,.08)",
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--hover)]"
          style={{ color: "var(--muted-raw)" }}
        >
          <X size={15} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-5 flex flex-col space-y-1.5", className)} {...props} />;
}

function DialogTitle({ className, ...props }: DialogPrimitive.DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      className={cn("text-[17px] font-bold tracking-tight", className)}
      style={{ color: "var(--ink)" }}
      {...props}
    />
  );
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };
