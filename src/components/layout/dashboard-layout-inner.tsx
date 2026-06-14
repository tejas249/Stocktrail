"use client";

import { useLayoutMode } from "./layout-mode";
import { Sidebar } from "./sidebar";

export function DashboardLayoutInner({ children, alertCount = 0 }: { children: React.ReactNode; alertCount?: number }) {
  const { mode, isGlass } = useLayoutMode();
  const iconOnly = mode === "triage";

  return (
    <div
      className="flex min-h-screen"
      data-layout={mode}
      data-glass={isGlass ? "true" : undefined}
    >
      <Sidebar iconOnly={iconOnly} alertCount={alertCount} />
      <div
        className={`flex-1 min-h-screen transition-all duration-200 ${iconOnly ? "md:ml-14" : "md:ml-64"}`}
        style={
          isGlass
            ? { background: "transparent" }
            : {
                background: [
                  "radial-gradient(900px 520px at 8% -8%, rgba(220,38,38,.06), transparent 58%)",
                  "radial-gradient(820px 520px at 100% -6%, rgba(225,29,72,.05), transparent 55%)",
                  "radial-gradient(760px 620px at 66% 114%, rgba(220,38,38,.03), transparent 60%)",
                  "var(--bg)",
                ].join(", "),
              }
        }
      >
        {children}
      </div>
    </div>
  );
}
