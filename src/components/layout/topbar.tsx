"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar({ title }: { title: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border px-6 backdrop-blur-sm bg-background/90 shadow-[0_1px_0_hsl(var(--border)),0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_0_hsl(var(--border)),0_2px_12px_rgba(0,0,0,0.15)]">
      <h1 className="text-lg font-semibold tracking-tight pl-10 md:pl-0">{title}</h1>
      <div className="rounded-lg ring-1 ring-border hover:ring-primary/40 transition-all duration-150">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className="rounded-lg">
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </Button>
      </div>
    </div>
  );
}
