"use client";

import { useView } from "@/providers/ViewProvider";

export default function ViewToggle() {
  const { view, setView } = useView();

  return (
    <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setView("list")}
        className={`flex items-center gap-1 rounded-l-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
          view === "list"
            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
        title="List view"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        List
      </button>
      <button
        onClick={() => setView("kanban")}
        className={`flex items-center gap-1 rounded-r-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
          view === "kanban"
            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
        title="Kanban board view"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
        </svg>
        Board
      </button>
    </div>
  );
}
