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
  { href: "/dashboard",       label: "Dashboard",          icon: LayoutDashboard, color: "#7c3aed" },
  { href: "/products",        label: "Products",           icon: Package,         color: "#9333ea" },
  { href: "/movements",       label: "Stock Movements",    icon: ArrowLeftRight,  color: "#0ea5e9" },
  { href: "/transfers",       label: "Transfers",          icon: Repeat,          color: "#0d9488" },
  { href: "/suppliers",       label: "Suppliers",          icon: Truck,           color: "#f97316" },
  { href: "/purchase-orders", label: "Purchase Orders",    icon: ClipboardList,   color: "#f59e0b" },
  { href: "/orders",          label: "Orders",             icon: ShoppingCart,    color: "#22c55e" },
  { href: "/reports",         label: "Reports",            icon: BarChart3,       color: "#ec4899" },
  { href: "/alerts",          label: "Low Stock Alerts",   icon: AlertTriangle,   color: "#ef4444", roles: ["ADMIN", "STAFF"] },
  { href: "/scan",            label: "Scan Barcode",       icon: ScanLine,        color: "#64748b", roles: ["ADMIN", "STAFF"] },
  { href: "/settings",        label: "Settings",           icon: Settings,        color: "#94a3b8", roles: ["ADMIN"] },
];

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "VIEWER";
  const [open, setOpen] = useState(false);

  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 inline-flex h-9 w-9 items-center justify-center rounded-xl border md:hidden transition-colors duration-150"
        style={{ borderColor: "var(--line)", backgroundColor: "var(--bg)" }}
      >
        {open ? <X size={17} style={{ color: "var(--ink)" }} /> : <Menu size={17} style={{ color: "var(--ink)" }} />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 md:translate-x-0 flex flex-col",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: "linear-gradient(185deg, #fafbfc 0%, #f5f7fa 100%)",
          boxShadow: "4px 0 16px rgba(15,23,42,0.08)",
        }}
      >
        {/* Logo */}
        <div
          className="flex h-16 flex-shrink-0 items-center gap-3 px-5"
          style={{ borderBottom: "1px solid var(--line)" }}
        >
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl font-bold text-[15px] text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)", boxShadow: "0 2px 8px rgba(124,58,237,.3)" }}
          >
            S
          </div>
          <div>
            <p className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--ink)" }}>StockTrail</p>
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "var(--muted-raw)" }}>Inventory</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150"
                style={
                  active
                    ? {
                        backgroundColor: hexToRgba(item.color, 0.12),
                        color: item.color,
                        borderLeft: `2.5px solid ${item.color}`,
                        paddingLeft: "10px",
                      }
                    : {
                        color: "var(--muted-raw)",
                        borderLeft: "2.5px solid transparent",
                      }
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--hover)";
                    (e.currentTarget as HTMLElement).style.color = "var(--ink-2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--muted-raw)";
                  }
                }}
              >
                <Icon
                  size={17}
                  style={{ color: active ? item.color : "var(--muted-raw)", flexShrink: 0 }}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {item.href === "/alerts" && (
                  <span
                    className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                    style={{ backgroundColor: "#ef4444" }}
                  >
                    !
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="flex-shrink-0 p-3 space-y-1"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)" }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: "var(--ink)" }}>{session?.user?.name}</p>
              <span
                className="inline-block text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(124,58,237,.1)", color: "var(--primary-hex)" }}
              >
                {role}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150 hover:bg-[var(--hover)]"
            style={{ color: "var(--muted-raw)" }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
