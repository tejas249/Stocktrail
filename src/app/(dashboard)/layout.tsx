import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div
        className="flex-1 md:ml-64 min-h-screen"
        style={{
          background: [
            "radial-gradient(900px 520px at 8% -8%, rgba(124,58,237,.11), transparent 58%)",
            "radial-gradient(820px 520px at 100% -6%, rgba(147,51,234,.11), transparent 55%)",
            "radial-gradient(760px 620px at 66% 114%, rgba(192,38,211,.06), transparent 60%)",
            "var(--bg)",
          ].join(", "),
        }}
      >
        {children}
      </div>
    </div>
  );
}
