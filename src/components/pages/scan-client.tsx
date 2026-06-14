"use client";

import { Topbar } from "@/components/layout/topbar";
import { useLayoutMode } from "@/components/layout/layout-mode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarcodeScanner } from "@/components/scan/barcode-scanner";

interface Props {
  locations: { id: string; name: string }[];
}

export function ScanPageClient({ locations }: Props) {
  const { mode } = useLayoutMode();

  if (mode === "classic") {
    return (
      <div>
        <Topbar title="Scan Barcode" />
        <div className="mx-auto max-w-[1180px] space-y-5 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Scan a product barcode</CardTitle>
              <p className="text-[13px] mt-1" style={{ color: "var(--muted-raw)" }}>
                Use your device camera to scan a product&apos;s barcode. We&apos;ll look it up and let you quickly record a stock movement.
              </p>
            </CardHeader>
            <CardContent>
              <BarcodeScanner locations={locations} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === "command") {
    return (
      <div>
        <Topbar title="Scan Barcode" />
        <div className="mx-auto max-w-[1180px] p-6">
          <div className="flex gap-4 items-start">
            <div className="flex-[1.4] min-w-0">
              <Card>
                <CardHeader>
                  <CardTitle>Scan a product barcode</CardTitle>
                  <p className="text-[13px] mt-1" style={{ color: "var(--muted-raw)" }}>
                    Point your camera at a barcode to look up the product instantly.
                  </p>
                </CardHeader>
                <CardContent>
                  <BarcodeScanner locations={locations} />
                </CardContent>
              </Card>
            </div>
            <div className="flex-1 min-w-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[14px]">Quick Record</CardTitle>
                  <p className="text-[12px] mt-0.5" style={{ color: "var(--muted-raw)" }}>Scan a product to record a movement</p>
                </CardHeader>
                <CardContent>
                  <p className="text-[13px] text-center py-6" style={{ color: "var(--muted-raw)" }}>Scan a barcode to load product info here</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Triage */
  return (
    <div data-layout="triage">
      <Topbar title="Scan Barcode" />
      <div className="mx-auto max-w-[1180px] space-y-4 p-6">
        <div className="flex gap-4 items-start">
          <div className="flex-[1.6] min-w-0">
            <Card>
              <CardHeader>
                <CardTitle>Scan Barcode</CardTitle>
                <p className="text-[13px] mt-1" style={{ color: "var(--muted-raw)" }}>
                  Scan a product barcode with your camera.
                </p>
              </CardHeader>
              <CardContent>
                <BarcodeScanner locations={locations} />
              </CardContent>
            </Card>
          </div>
          <div className="flex-1 min-w-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-[14px]">Quick Record</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[13px] text-center py-6" style={{ color: "var(--muted-raw)" }}>Scan a barcode to load product here</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
