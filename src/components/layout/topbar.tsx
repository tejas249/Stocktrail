"use client";

import { Search, Bell } from "lucide-react";
import { useSession } from "next-auth/react";

export function Topbar({ title }: { title: string }) {
  const { data: session } = useSession();
  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div
      className="sticky top-0 z-30 flex h-16 items-center justify-between px-6"
      style={{
        borderBottom: "1px solid var(--line)",
        backgroundColor: "rgba(247,247,251,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Left: breadcrumb + title */}
      <div className="pl-10 md:pl-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>
          StockTrail /&nbsp;
          <span style={{ color: "var(--primary-hex)" }}>{title}</span>
        </p>
        <h1 className="text-[17px] font-bold leading-tight tracking-tight" style={{ color: "var(--ink)" }}>
          {title}
        </h1>
      </div>

      {/* Right: search + bell + avatar */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <label
          className="hidden sm:flex items-center gap-2 h-9 rounded-[10px] border px-3 cursor-text transition-shadow duration-150 focus-within:ring-2 focus-within:ring-[rgba(124,58,237,.18)]"
          style={{ borderColor: "var(--line)", backgroundColor: "var(--bg)" }}
        >
          <Search size={14} style={{ color: "var(--muted-raw)", flexShrink: 0 }} />
          <input
            placeholder="Search…"
            className="bg-transparent outline-none w-32 text-[13px] placeholder:text-[var(--muted-raw)]"
            style={{ color: "var(--ink-2)" }}
          />
        </label>

        {/* Notification bell */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border transition-colors duration-150 hover:bg-[var(--hover)]"
          style={{ borderColor: "var(--line)", backgroundColor: "var(--bg)" }}
          aria-label="Notifications"
        >
          <Bell size={16} style={{ color: "var(--muted-raw)" }} />
          <span
            className="absolute right-2 top-2 h-2 w-2 rounded-full ring-2 ring-[var(--bg)]"
            style={{ backgroundColor: "var(--rose)" }}
          />
        </button>

        {/* User avatar */}
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white select-none"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #9333ea)",
            boxShadow: "0 2px 8px rgba(124,58,237,.35)",
          }}
          title={session?.user?.name ?? ""}
        >
          {initials}
        </div>
      </div>
    </div>
  );
}
