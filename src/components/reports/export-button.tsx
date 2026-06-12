"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportButton() {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" asChild>
        <a href="/api/export?type=products" download>
          <Download size={14} /> Export Products CSV
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a href="/api/export?type=movements" download>
          <Download size={14} /> Export Movements CSV
        </a>
      </Button>
    </div>
  );
}
