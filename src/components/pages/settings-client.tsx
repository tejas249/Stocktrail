"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { useLayoutMode } from "@/components/layout/layout-mode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AddLocationDialog } from "@/components/settings/add-location-dialog";
import { UserRoleSelect } from "@/components/settings/user-role-select";
import { MapPin, Users } from "lucide-react";

interface Location { id: string; name: string; address?: string; }
interface User { id: string; name: string; email: string; role: string; }

interface Props {
  locations: Location[];
  users: User[];
}

function LocationsTable({ locations }: { locations: Location[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Address</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {locations.map((l) => (
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
  );
}

function UsersTable({ users }: { users: User[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: "var(--gradient-primary)" }}>
                  {u.name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <span className="font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{u.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-[13px]" style={{ color: "var(--muted-raw)" }}>{u.email}</TableCell>
            <TableCell><UserRoleSelect userId={u.id} currentRole={u.role} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function SettingsPageClient({ locations, users }: Props) {
  const { mode } = useLayoutMode();
  const [activeTab, setActiveTab] = useState<"locations" | "team">("locations");

  const LocationsCard = () => (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Locations / Warehouses</CardTitle>
        <AddLocationDialog />
      </CardHeader>
      <CardContent className="p-0">
        <LocationsTable locations={locations} />
      </CardContent>
    </Card>
  );

  const TeamCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <UsersTable users={users} />
      </CardContent>
    </Card>
  );

  if (mode === "classic") {
    return (
      <div>
        <Topbar title="Settings" />
        <div className="mx-auto max-w-[1180px] space-y-6 p-6">
          <LocationsCard />
          <TeamCard />
        </div>
      </div>
    );
  }

  if (mode === "command") {
    return (
      <div>
        <Topbar title="Settings" />
        <div className="mx-auto max-w-[1180px] p-6">
          <div className="grid grid-cols-2 gap-4">
            <LocationsCard />
            <TeamCard />
          </div>
        </div>
      </div>
    );
  }

  /* Triage */
  return (
    <div data-layout="triage">
      <Topbar title="Settings" />
      <div className="mx-auto max-w-[1180px] space-y-4 p-6">
        {/* Tab bar */}
        <div className="flex items-center gap-1 rounded-[12px] border p-1 w-fit" style={{ borderColor: "var(--line)", backgroundColor: "#fff" }}>
          {([
            { key: "locations", label: "Locations", icon: MapPin },
            { key: "team",      label: "Team Members", icon: Users },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-2 rounded-[9px] px-4 py-2 text-[13px] font-semibold transition-all"
              style={activeTab === key
                ? { backgroundColor: "var(--primary-hex)", color: "#fff" }
                : { color: "var(--muted-raw)" }
              }
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <LocationsCard />
          <TeamCard />
        </div>
      </div>
    </div>
  );
}
