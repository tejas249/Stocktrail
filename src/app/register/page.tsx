"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Registration failed");
      return;
    }

    toast.success("Account created! Please sign in.");
    router.push("/login");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900 overflow-hidden">
      {/* Subtle dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(221 83% 53% / 0.15) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <Card className="relative w-full max-w-sm border-0 shadow-[0_8px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06] dark:ring-white/[0.08] hover:shadow-[0_12px_48px_rgba(0,0,0,0.16)] hover:-translate-y-0.5">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xl font-bold shadow-lg ring-4 ring-blue-500/20">
            S
          </div>
          <CardTitle className="text-xl font-semibold text-foreground">Create your account</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Start managing your inventory</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
