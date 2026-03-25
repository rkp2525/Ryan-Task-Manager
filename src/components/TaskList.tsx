"use client";

import { useState } from "react";
import { useMode } from "@/providers/ModeProvider";
import { useTasks } from "@/lib/hooks";
import TaskItem from "./TaskItem";

export default function TaskList() {
  const { mode } = useMode();
  const { activeTasks, doneTasks } = useTasks(mode);
  const [showDone, setShowDone] = useState(false);

  return (
    <div>
      {/* Active tasks */}
      <div className="space-y-2">
        {activeTasks.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-400 dark:text-gray-500">
              No tasks yet. Add one above!
            </p>
          </div>
        )}
        {activeTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>

      {/* Completed tasks */}
      {doneTasks.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowDone(!showDone)}
            className="mb-2 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className={`h-3 w-3 transition-transform ${showDone ? "rotate-90" : ""}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
            Completed ({doneTasks.length})
          </button>
          {showDone && (
            <div className="space-y-2">
              {doneTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
