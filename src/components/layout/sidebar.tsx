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

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card shadow-card md:hidden transition-all duration-150 hover:shadow-card-hover"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-card transition-transform duration-200 md:translate-x-0 shadow-[2px_0_20px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_20px_rgba(0,0,0,0.25)]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-base shadow-md ring-2 ring-blue-400/30 flex-shrink-0">
            S
          </div>
          <div>
            <span className="text-[15px] font-semibold tracking-tight">StockTrail</span>
            <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Inventory</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:translate-x-0.5"
                )}
              >
                <Icon size={17} className={active ? "text-primary" : ""} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="absolute bottom-0 w-full border-t border-border p-3 space-y-1">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold ring-1 ring-primary/20">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{session?.user?.name}</p>
              <span className="inline-block text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {role}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all duration-150"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
