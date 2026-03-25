"use client";

import { useMode } from "@/providers/ModeProvider";

export default function ModeToggle() {
  const { mode, setMode } = useMode();

  return (
    <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      <button
        onClick={() => setMode("professional")}
        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
          mode === "professional"
            ? "bg-white text-indigo-600 shadow-sm dark:bg-gray-700 dark:text-indigo-400"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        Professional
      </button>
      <button
        onClick={() => setMode("personal")}
        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
          mode === "personal"
            ? "bg-white text-indigo-600 shadow-sm dark:bg-gray-700 dark:text-indigo-400"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        Personal
      </button>
    </div>
  );
}
