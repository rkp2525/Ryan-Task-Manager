"use client";

import ModeToggle from "./ModeToggle";
import DarkModeToggle from "./DarkModeToggle";
import { useMode } from "@/providers/ModeProvider";
import { useAuth } from "@/providers/AuthProvider";

export default function Header() {
  const { mode } = useMode();
  const { user, signOut } = useAuth();

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
        <div className="flex items-center gap-3">
          <ModeToggle />
          <DarkModeToggle />
          {user && (
            <button
              onClick={signOut}
              className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              title={user.email}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
