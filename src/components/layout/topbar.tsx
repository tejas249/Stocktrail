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
    <div className="flex h-16 items-center justify-between border-b border-border px-6">
      <h1 className="text-xl font-semibold pl-10 md:pl-0">{title}</h1>
      <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </Button>
    </div>
  );
}
