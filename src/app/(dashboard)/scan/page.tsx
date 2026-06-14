import { connectDB, toClient } from "@/lib/mongodb";
import { Location } from "@/lib/models/Location";
import { ScanPageClient } from "@/components/pages/scan-client";

export default async function ScanPage() {
  await connectDB();
  const locations = await Location.find().lean();

  return <ScanPageClient locations={toClient(locations)} />;
}
