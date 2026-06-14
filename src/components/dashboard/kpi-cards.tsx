"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Package, AlertTriangle, DollarSign, ClipboardList } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface KpiCardsProps {
  totalProducts: number;
  lowStockCount: number;
  totalStockValue: number;
  pendingPOs: number;
}

export function KpiCards({ totalProducts, lowStockCount, totalStockValue, pendingPOs }: KpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Products"
        value={String(totalProducts)}
        icon={Package}
        color="#049fd9"
      />
      <StatCard
        title="Low Stock Items"
        value={String(lowStockCount)}
        delta={lowStockCount > 0 ? `${lowStockCount} items need restocking` : "All levels healthy"}
        deltaPositive={lowStockCount === 0}
        icon={AlertTriangle}
        color="#f43f5e"
      />
      <StatCard
        title="Total Stock Value"
        value={formatCurrency(totalStockValue)}
        icon={DollarSign}
        color="#10b981"
      />
      <StatCard
        title="Pending Orders"
        value={String(pendingPOs)}
        delta={pendingPOs > 0 ? `${pendingPOs} awaiting action` : "No pending orders"}
        deltaPositive={pendingPOs === 0}
        icon={ClipboardList}
        color="#f59e0b"
      />
    </div>
  );
}
