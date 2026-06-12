"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";

const TEMPLATE_HEADERS = "name,sku,category,barcode,price,costPrice,reorderThreshold";

export function ImportProductsDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setRows(result.data as any[]);
      },
    });
  }

  async function handleImport() {
    if (rows.length === 0) { toast.error("No rows to import"); return; }
    setLoading(true);

    const res = await fetch("/api/products/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });

    setLoading(false);

    if (!res.ok) { toast.error("Import failed"); return; }
    const data = await res.json();
    toast.success(`Imported ${data.created} products (${data.skipped} skipped — duplicate SKU)`);
    setOpen(false);
    setRows([]);
    router.refresh();
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_HEADERS + "\n"], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Upload size={16} /> Import CSV</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Import Products from CSV</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              CSV columns: name, sku, category, barcode, price, costPrice, reorderThreshold
            </p>
            <Button variant="ghost" size="sm" onClick={downloadTemplate}>Download Template</Button>
          </div>
          <input type="file" accept=".csv" onChange={handleFile} className="text-sm" />

          {rows.length > 0 && (
            <div className="max-h-64 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Name</TableHead><TableHead>SKU</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 20).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.sku}</TableCell>
                      <TableCell>{r.category}</TableCell>
                      <TableCell>{r.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {rows.length > 20 && <p className="mt-2 text-xs text-muted-foreground">+ {rows.length - 20} more rows</p>}
            </div>
          )}

          <Button onClick={handleImport} disabled={loading || rows.length === 0} className="w-full">
            {loading ? "Importing..." : `Import ${rows.length} Products`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
