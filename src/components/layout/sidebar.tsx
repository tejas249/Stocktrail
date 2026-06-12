"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Repeat,
  Truck,
  ClipboardList,
  ShoppingCart,
  BarChart3,
  AlertTriangle,
  ScanLine,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "STAFF", "VIEWER"] },
  { href: "/products", label: "Products", icon: Package, roles: ["ADMIN", "STAFF", "VIEWER"] },
  { href: "/movements", label: "Stock Movements", icon: ArrowLeftRight, roles: ["ADMIN", "STAFF"] },
  { href: "/transfers", label: "Transfers", icon: Repeat, roles: ["ADMIN", "STAFF"] },
  { href: "/suppliers", label: "Suppliers", icon: Truck, roles: ["ADMIN"] },
  { href: "/purchase-orders", label: "Purchase Orders", icon: ClipboardList, roles: ["ADMIN"] },
  { href: "/orders", label: "Orders", icon: ShoppingCart, roles: ["ADMIN", "STAFF", "VIEWER"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["ADMIN", "VIEWER"] },
  { href: "/alerts", label: "Low Stock Alerts", icon: AlertTriangle, roles: ["ADMIN", "STAFF"] },
  { href: "/scan", label: "Scan Barcode", icon: ScanLine, roles: ["ADMIN", "STAFF"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "VIEWER";
  const [open, setOpen] = useState(false);

  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card md:hidden"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-card transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            S
          </div>
          <span className="text-lg font-semibold">StockTrail</span>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-border p-3">
          <div className="mb-2 px-2 text-xs text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{session?.user?.name}</span>
            <br />
            Role: {role}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
