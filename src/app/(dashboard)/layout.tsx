import { LayoutModeProvider } from "@/components/layout/layout-mode";
import { DashboardLayoutInner } from "@/components/layout/dashboard-layout-inner";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Stock } from "@/lib/models/Stock";

async function getLowStockCount() {
  try {
    await connectDB();
    const [products, stocks] = await Promise.all([
      Product.find({}, "_id reorderThreshold").lean(),
      Stock.find({}, "product quantity").lean(),
    ]);
    const totals = new Map<string, number>();
    for (const s of stocks as any[]) {
      const k = s.product.toString();
      totals.set(k, (totals.get(k) ?? 0) + s.quantity);
    }
    return (products as any[]).filter((p) => (totals.get(p._id.toString()) ?? 0) <= p.reorderThreshold).length;
  } catch {
    return 0;
  }
}

export default async function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const alertCount = await getLowStockCount();
  return (
    <LayoutModeProvider>
      <DashboardLayoutInner alertCount={alertCount}>{children}</DashboardLayoutInner>
    </LayoutModeProvider>
  );
}
