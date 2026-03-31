"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type View = "list" | "kanban";

interface ViewContextValue {
  view: View;
  setView: (view: View) => void;
}

const ViewContext = createContext<ViewContextValue | null>(null);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [view, setViewState] = useState<View>("list");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("taskManagerView") as View | null;
    if (saved === "list" || saved === "kanban") {
      setViewState(saved);
    }
    setLoaded(true);
  }, []);

  const setView = (newView: View) => {
    setViewState(newView);
    localStorage.setItem("taskManagerView", newView);
  };

  if (!loaded) return null;

  return (
    <ViewContext.Provider value={{ view, setView }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const ctx = useContext(ViewContext);
  if (!ctx) throw new Error("useView must be used within ViewProvider");
  return ctx;
}
