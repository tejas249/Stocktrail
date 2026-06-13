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
      <div className="mx-auto max-w-[1180px] space-y-6 p-6">

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Locations / Warehouses</CardTitle>
            <AddLocationDialog />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {toClient(locations).map((l: any) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{l.name}</TableCell>
                    <TableCell className="text-[13px]" style={{ color: "var(--muted-raw)" }}>{l.address || "—"}</TableCell>
                  </TableRow>
                ))}
                {locations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="py-8 text-center text-sm" style={{ color: "var(--muted-raw)" }}>
                      No locations yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {toClient(users).map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                          style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)" }}
                        >
                          {u.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                        <span className="font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{u.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px]" style={{ color: "var(--muted-raw)" }}>{u.email}</TableCell>
                    <TableCell>
                      <UserRoleSelect userId={u.id} currentRole={u.role} />
                    </TableCell>
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
