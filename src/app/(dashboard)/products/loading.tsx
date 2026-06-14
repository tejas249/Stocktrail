import { SkeletonStatsRow, SkeletonTable } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="p-6 space-y-6">
      <SkeletonStatsRow count={4} />
      <SkeletonTable rows={8} cols={6} />
    </div>
  );
}
