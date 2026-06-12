"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }

    toast.success("Welcome back!");
    router.push("/dashboard");
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
          <CardTitle className="text-xl font-semibold text-foreground">Sign in to StockTrail</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Manage your inventory with confidence</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline underline-offset-4">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
