"use client";

import { useRef, useEffect } from "react";
import { Search, Bell, Layers, LayoutGrid, Zap, Gem, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLayoutMode, type LayoutMode } from "./layout-mode";

const MODES: { id: LayoutMode; icon: React.ElementType; label: string }[] = [
  { id: "classic", icon: Layers,      label: "Classic Stack"   },
  { id: "command", icon: LayoutGrid,  label: "Command Center"  },
  { id: "triage",  icon: Zap,         label: "Action-First"    },
];

export function Topbar({ title, actions }: { title: string; actions?: React.ReactNode }) {
  const { data: session } = useSession();
  const { mode, setMode, isGlass, toggleGlass } = useLayoutMode();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key === "k")) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div
      className="sticky top-0 z-30 flex h-[62px] items-center gap-4 px-6 transition-all duration-300"
      style={
        isGlass
          ? {
              borderBottom: "1px solid rgba(255,255,255,0.10)",
              backgroundColor: "rgba(10,6,25,0.60)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }
          : {
              borderBottom: "1px solid var(--line)",
              backgroundColor: "rgba(254,252,248,0.96)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }
      }
    >
      {/* Left: accent bar + breadcrumb + title */}
      <div className="flex items-center gap-3 pl-10 md:pl-0 flex-1 min-w-0">
        {/* Vertical accent bar */}
        <div
          className="hidden md:block flex-shrink-0 rounded-full"
          style={{ width: 3, height: 32, background: "var(--primary-hex)", opacity: 0.85 }}
        />

        <div className="min-w-0">
          {/* Breadcrumb row */}
          <div className="hidden sm:flex items-center gap-1" style={{ marginBottom: 2 }}>
            <span className="text-[10.5px] font-medium" style={{ color: "var(--muted-2)" }}>
              StockTrail
            </span>
            <ChevronRight size={10} style={{ color: "var(--muted-2)", opacity: 0.45, flexShrink: 0 }} />
            <span className="text-[10.5px] font-semibold" style={{ color: "var(--primary-hex)" }}>
              {title}
            </span>
          </div>

          {/* Page title */}
          <h1
            className="font-display text-[20px] font-bold leading-none truncate"
            style={{ color: "var(--ink)", letterSpacing: "-0.5px" }}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* Right: action slots + controls */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Page-level action buttons */}
        {actions && (
          <>
            <div className="flex items-center gap-2">{actions}</div>
            <div className="w-px h-5 mx-1" style={{ background: "var(--line)" }} />
          </>
        )}

        {/* View controls: mode switcher + glass toggle */}
        <div className="hidden md:flex items-center gap-1.5">
          <div
            className="flex items-center rounded-[7px] border p-[3px] gap-[2px] transition-all duration-300"
            style={
              isGlass
                ? { borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)" }
                : { borderColor: "var(--line)", backgroundColor: "var(--bg)" }
            }
          >
            {MODES.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                aria-label={label}
                data-tooltip-below={label}
                className="flex items-center justify-center rounded-[5px] w-7 h-[22px] transition-all duration-150 active:scale-[0.90] cursor-pointer"
                style={
                  mode === id
                    ? { backgroundColor: "var(--primary-hex)", color: "#fff" }
                    : { color: "var(--muted-2)" }
                }
              >
                <Icon size={12} />
              </button>
            ))}
          </div>

          <button
            onClick={toggleGlass}
            aria-label="Toggle Glassmorphism"
            data-tooltip-below={isGlass ? "Disable Glass" : "Enable Glass"}
            className="flex items-center justify-center rounded-[7px] w-[30px] h-[30px] border transition-all duration-300 active:scale-[0.90] cursor-pointer"
            style={
              isGlass
                ? { backgroundColor: "rgba(139,92,246,0.15)", borderColor: "rgba(139,92,246,0.40)", color: "#c4b5fd" }
                : { backgroundColor: "transparent", borderColor: "var(--line)", color: "var(--muted-2)" }
            }
          >
            <Gem size={13} />
          </button>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-5" style={{ background: "var(--line)" }} />

        {/* Search */}
        <label
          className="hidden lg:flex items-center gap-2 h-[30px] w-[172px] rounded-[7px] border px-2.5 cursor-text transition-all duration-200 focus-within:w-[210px] focus-within:border-[var(--primary-hex)]"
          style={
            isGlass
              ? { borderColor: "rgba(255,255,255,0.14)", backgroundColor: "rgba(255,255,255,0.07)" }
              : { borderColor: "var(--line)", backgroundColor: "var(--bg)" }
          }
        >
          <Search size={12} style={{ color: "var(--muted-2)", flexShrink: 0 }} />
          <input
            ref={searchRef}
            placeholder="Search…"
            className="bg-transparent outline-none flex-1 text-[12px] placeholder:text-[var(--muted-2)]"
            style={{ color: "var(--ink)" }}
          />
        </label>

        {/* Bell */}
        <button
          className="relative flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] border transition-all duration-150 hover:bg-[var(--hover)] active:scale-[0.90]"
          style={
            isGlass
              ? { borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)" }
              : { borderColor: "var(--line)", backgroundColor: "transparent" }
          }
          aria-label="Notifications"
          data-tooltip-below="Notifications"
        >
          <Bell size={14} style={{ color: "var(--muted-raw)" }} />
          <span
            className="absolute right-[7px] top-[6px] h-[6px] w-[6px] rounded-full"
            style={{ backgroundColor: "#ef4444" }}
          />
        </button>

        {/* Avatar */}
        <div
          className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white select-none cursor-default hover:opacity-85 transition-opacity"
          style={{ background: "var(--gradient-primary)" }}
          title={session?.user?.name ?? ""}
        >
          {initials}
        </div>
      </div>
    </div>
  );
}
