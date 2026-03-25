"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Mode } from "@/lib/types";

interface ModeContextValue {
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
}

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("professional");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("taskManagerMode") as Mode | null;
    if (saved === "personal" || saved === "professional") {
      setModeState(saved);
    }
    setLoaded(true);
  }, []);

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem("taskManagerMode", newMode);
  };

  const toggleMode = () => {
    setMode(mode === "personal" ? "professional" : "personal");
  };

  if (!loaded) return null;

  return (
    <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used within ModeProvider");
  return ctx;
}
