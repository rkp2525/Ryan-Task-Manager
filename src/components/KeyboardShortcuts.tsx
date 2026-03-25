"use client";

import { useEffect } from "react";
import { useMode } from "@/providers/ModeProvider";

export default function KeyboardShortcuts() {
  const { toggleMode } = useMode();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't fire shortcuts when typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key) {
        case "n": {
          e.preventDefault();
          // Focus the task input
          const input = document.querySelector<HTMLInputElement>('input[placeholder="Add a task..."]');
          input?.focus();
          break;
        }
        case "m": {
          e.preventDefault();
          toggleMode();
          break;
        }
        case "?": {
          e.preventDefault();
          const dialog = document.getElementById("shortcuts-dialog");
          if (dialog instanceof HTMLDialogElement) {
            if (dialog.open) dialog.close();
            else dialog.showModal();
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleMode]);

  return (
    <dialog
      id="shortcuts-dialog"
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-xl backdrop:bg-black/50 dark:border-gray-700 dark:bg-gray-800"
    >
      <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
      <div className="space-y-2 text-sm">
        {[
          ["n", "New task"],
          ["m", "Toggle mode (Professional / Personal)"],
          ["?", "Show / hide this help"],
        ].map(([key, desc]) => (
          <div key={key} className="flex items-center gap-3">
            <kbd className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              {key}
            </kbd>
            <span className="text-gray-600 dark:text-gray-400">{desc}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => (document.getElementById("shortcuts-dialog") as HTMLDialogElement)?.close()}
        className="mt-4 w-full rounded-lg bg-gray-100 py-2 text-sm text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
      >
        Close
      </button>
    </dialog>
  );
}
