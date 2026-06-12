"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function UserRoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const router = useRouter();

  async function handleChange(role: string) {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) { toast.error("Failed to update role"); return; }
    toast.success("Role updated");
    router.refresh();
  }

  return (
    <select
      defaultValue={currentRole}
      onChange={(e) => handleChange(e.target.value)}
      className="h-8 rounded-md border border-border bg-background px-2 text-xs"
    >
      <option value="ADMIN">ADMIN</option>
      <option value="STAFF">STAFF</option>
      <option value="VIEWER">VIEWER</option>
    </select>
  );
}
