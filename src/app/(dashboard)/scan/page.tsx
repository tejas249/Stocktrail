import { Topbar } from "@/components/layout/topbar";
import { connectDB, toClient } from "@/lib/mongodb";
import { Location } from "@/lib/models/Location";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarcodeScanner } from "@/components/scan/barcode-scanner";

export default async function ScanPage() {
  await connectDB();
  const locations = await Location.find().lean();

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
            <BarcodeScanner locations={toClient(locations)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
