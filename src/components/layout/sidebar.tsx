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

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Core",
    items: [
      { href: "/dashboard",  label: "Dashboard",       icon: LayoutDashboard },
      { href: "/products",   label: "Products",        icon: Package },
      { href: "/movements",  label: "Stock Movements", icon: ArrowLeftRight },
      { href: "/transfers",  label: "Transfers",       icon: Repeat },
      { href: "/orders",     label: "Orders",          icon: ShoppingCart },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/alerts", label: "Low Stock Alerts", icon: AlertTriangle, roles: ["ADMIN", "STAFF"] },
      { href: "/scan",   label: "Scan Barcode",     icon: ScanLine,      roles: ["ADMIN", "STAFF"] },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/suppliers",       label: "Suppliers",       icon: Truck,         roles: ["ADMIN"] },
      { href: "/purchase-orders", label: "Purchase Orders", icon: ClipboardList, roles: ["ADMIN"] },
      { href: "/reports",         label: "Reports",         icon: BarChart3,     roles: ["ADMIN"] },
      { href: "/settings",        label: "Settings",        icon: Settings,      roles: ["ADMIN"] },
    ],
  },
];

export function Sidebar({ iconOnly = false, alertCount = 0 }: { iconOnly?: boolean; alertCount?: number }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "VIEWER";
  const [open, setOpen] = useState(false);

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <>
      {/* Mobile toggle */}
      <button
        data-mobile-menu=""
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-all duration-150 active:scale-[0.95] md:hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        {open
          ? <X size={17} style={{ color: "var(--ink)" }} />
          : <Menu size={17} style={{ color: "var(--ink)" }} />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 transform transition-all duration-200 md:translate-x-0 flex flex-col",
          iconOnly ? "w-14" : "w-64",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: "var(--surface)",
          borderRight: "1px solid var(--line)",
        }}
      >
        {/* Brand */}
        <div
          data-sidebar-brand=""
          className={cn(
            "flex h-16 flex-shrink-0 items-center gap-3",
            iconOnly ? "px-[11px] justify-center" : "px-5"
          )}
          style={{ borderBottom: "1px solid var(--line)" }}
        >
          <div
            className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-[10px]"
            style={{ background: "#049fd9" }}
          >
            <svg width="19" height="15" viewBox="0 0 19 15" fill="none" aria-hidden="true">
              <rect width="19" height="3.2" rx="1.6" fill="white"/>
              <rect y="5.9" width="13" height="3.2" rx="1.6" fill="white" opacity="0.78"/>
              <rect y="11.8" width="7.5" height="3.2" rx="1.6" fill="white" opacity="0.55"/>
            </svg>
          </div>
          {!iconOnly && (
            <div>
              <p className="font-display text-[15px] font-bold" style={{ color: "var(--ink)", letterSpacing: "-0.4px", lineHeight: "1.15" }}>
                StockTrail
              </p>
              <p className="label-caps" style={{ marginTop: 2 }}>
                Inventory
              </p>
            </div>
          )}
        </div>

        {/* Nav groups */}
        <nav
          className={cn("flex-1 overflow-y-auto", iconOnly ? "px-[7px] py-2" : "px-3 py-2")}
          style={{ scrollbarWidth: "none" }}
        >
          {NAV_GROUPS.map((group, gi) => {
            const visible = group.items.filter(item => !item.roles || item.roles.includes(role));
            if (visible.length === 0) return null;

            return (
              <div key={group.label} style={{ marginBottom: iconOnly ? 4 : 0 }}>
                {/* Section header — hidden in icon-only mode */}
                {!iconOnly && (
                  <p
                    className="label-caps select-none"
                    style={{ padding: gi === 0 ? "8px 10px 4px" : "16px 10px 4px" }}
                  >
                    {group.label}
                  </p>
                )}

                {iconOnly && gi > 0 && (
                  <div style={{ height: 1, background: "var(--line)", margin: "6px 4px" }} />
                )}

                <div className="space-y-[2px]">
                  {visible.map((item) => {
                    const Icon = item.icon;
                    const active = pathname?.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        data-nav-link=""
                        data-tooltip={iconOnly ? item.label : undefined}
                        className={cn(
                          "flex items-center rounded-[8px] text-[13px] transition-all duration-150 active:scale-[0.98]",
                          iconOnly ? "justify-center px-2 py-[9px]" : "gap-[9px] px-[9px] py-[7px]"
                        )}
                        style={
                          active
                            ? {
                                backgroundColor: "rgba(4,159,217,0.09)",
                                color: "var(--primary-hex)",
                                fontWeight: 600,
                              }
                            : { color: "var(--ink-2)" }
                        }
                        onMouseEnter={(e) => {
                          if (!active) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--hover)";
                            (e.currentTarget as HTMLElement).style.color = "var(--ink)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "var(--ink-2)";
                          }
                        }}
                      >
                        <span data-nav-icon="" className="flex flex-shrink-0 items-center">
                          <Icon
                            size={16}
                            strokeWidth={active ? 2.2 : 1.9}
                            style={{ color: active ? "var(--primary-hex)" : "var(--muted-raw)" }}
                          />
                        </span>
                        <span
                          className={cn(
                            "truncate transition-all duration-200",
                            iconOnly ? "w-0 max-w-0 opacity-0 overflow-hidden" : "flex-1 opacity-100"
                          )}
                          style={{ transitionDelay: iconOnly ? "0ms" : "100ms" }}
                          aria-hidden={iconOnly}
                        >
                          {item.label}
                        </span>
                        {!iconOnly && item.href === "/alerts" && alertCount > 0 && (
                          <span
                            className="badge-pulse flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                            style={{ backgroundColor: "#ef4444", flexShrink: 0 }}
                          >
                            {alertCount > 99 ? "99+" : alertCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          data-sidebar-footer=""
          className={cn("flex-shrink-0 space-y-0.5", iconOnly ? "p-2" : "p-3")}
          style={{ borderTop: "1px solid var(--line)" }}
        >
          {/* User row */}
          <div
            className={cn(
              "flex items-center rounded-[8px] py-2 cursor-pointer transition-colors duration-100",
              iconOnly ? "justify-center px-2" : "px-2 gap-[10px]"
            )}
            title={iconOnly ? (session?.user?.name ?? "") : undefined}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--hover)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
          >
            <div
              className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-full text-[11.5px] font-bold text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              {initials}
            </div>
            {!iconOnly && (
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold truncate" style={{ color: "var(--ink)", lineHeight: "1.25" }}>
                  {session?.user?.name}
                </p>
                <span
                  className="inline-block text-[9px] font-bold tracking-[0.7px] uppercase px-[6px] py-[1px] rounded-[4px] mt-[2px]"
                  style={{ backgroundColor: "rgba(4,159,217,.10)", color: "var(--primary-hex)" }}
                >
                  {role}
                </span>
              </div>
            )}
          </div>

          {/* Sign out */}
          {!iconOnly && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-[9px] rounded-[8px] px-2 py-[7px] text-[12.5px] font-medium transition-all duration-100"
              style={{ color: "var(--muted-raw)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--hover)";
                (e.currentTarget as HTMLElement).style.color = "var(--ink)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                (e.currentTarget as HTMLElement).style.color = "var(--muted-raw)";
              }}
            >
              <LogOut size={15} />
              Sign out
            </button>
          )}
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-150",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
    </>
  );
}
