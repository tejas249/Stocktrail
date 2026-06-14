import { connectDB, toClient } from "@/lib/mongodb";
import { Location } from "@/lib/models/Location";
import { User } from "@/lib/models/User";
import { SettingsPageClient } from "@/components/pages/settings-client";

export default async function SettingsPage() {
  await connectDB();

  const [locations, users] = await Promise.all([
    Location.find().sort({ name: 1 }).lean(),
    User.find().sort({ createdAt: 1 }).lean(),
  ]);

  return (
    <SettingsPageClient
      locations={toClient(locations)}
      users={toClient(users)}
    />
  );
}
