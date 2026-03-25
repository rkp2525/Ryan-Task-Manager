"use client";

import ModeToggle from "./ModeToggle";
import { useMode } from "@/providers/ModeProvider";

export default function Header() {
  const { mode } = useMode();

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Task Manager
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {mode === "personal" ? "Personal Tasks" : "Work Tasks"}
          </p>
        </div>
        <ModeToggle />
      </div>
    </header>
  );
}
