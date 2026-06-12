import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { connectDB, toClient } from "@/lib/mongodb";
import { Location } from "@/lib/models/Location";
import { User } from "@/lib/models/User";
import { AddLocationDialog } from "@/components/settings/add-location-dialog";
import { UserRoleSelect } from "@/components/settings/user-role-select";

export default async function SettingsPage() {
  await connectDB();

  const [locations, users] = await Promise.all([
    Location.find().sort({ name: 1 }).lean(),
    User.find().sort({ createdAt: 1 }).lean(),
  ]);

  return (
    <div>
      <Topbar title="Settings" />
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-foreground text-base font-semibold">Locations / Warehouses</CardTitle>
            <AddLocationDialog />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Name</TableHead><TableHead>Address</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {toClient(locations).map((l: any) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell className="text-muted-foreground">{l.address || "—"}</TableCell>
                  </TableRow>
                ))}
                {locations.length === 0 && (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-6">No locations yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-foreground text-base font-semibold">Team Members</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {toClient(users).map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell><UserRoleSelect userId={u.id} currentRole={u.role} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
