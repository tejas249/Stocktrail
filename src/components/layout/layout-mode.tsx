"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type LayoutMode = "classic" | "command" | "triage";

interface LayoutCtxType {
  mode: LayoutMode;
  setMode: (m: LayoutMode) => void;
  isGlass: boolean;
  toggleGlass: () => void;
}

const LayoutCtx = createContext<LayoutCtxType>({
  mode: "classic",
  setMode: () => {},
  isGlass: false,
  toggleGlass: () => {},
});

export function LayoutModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<LayoutMode>("classic");
  const [isGlass, setIsGlass] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("stocktrail-layout-mode") as LayoutMode | null;
    if (saved && ["classic", "command", "triage"].includes(saved)) setModeState(saved);
    setIsGlass(localStorage.getItem("stocktrail-glass") === "1");
  }, []);

  const setMode = (m: LayoutMode) => {
    setModeState(m);
    localStorage.setItem("stocktrail-layout-mode", m);
  };

  const toggleGlass = () => {
    setIsGlass((prev) => {
      const next = !prev;
      localStorage.setItem("stocktrail-glass", next ? "1" : "0");
      return next;
    });
  };

  return (
    <LayoutCtx.Provider value={{ mode, setMode, isGlass, toggleGlass }}>
      {children}
    </LayoutCtx.Provider>
  );
}

export const useLayoutMode = () => useContext(LayoutCtx);
