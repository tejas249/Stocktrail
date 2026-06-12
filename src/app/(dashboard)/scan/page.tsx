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
      <div className="space-y-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground text-base font-semibold">Scan a product barcode</CardTitle>
            <p className="text-sm text-muted-foreground">
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
