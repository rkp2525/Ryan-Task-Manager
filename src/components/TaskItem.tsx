"use client";

import { useState } from "react";
import { toggleTaskStatus, updateTask } from "@/lib/hooks";
import { PRIORITY_COLORS, PRIORITY_LABELS, type Task, type Priority } from "@/lib/types";

export default function TaskItem({ task }: { task: Task }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const isDone = task.status === "done";

  const handleToggle = () => toggleTaskStatus(task.id, task.status);

  const handleSave = async () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title) {
      await updateTask(task.id, { title: trimmed });
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditTitle(task.title);
      setEditing(false);
    }
  };

  const cyclePriority = async () => {
    const next = ((task.priority + 1) % 4) as Priority;
    await updateTask(task.id, { priority: next });
  };

  const formatDueDate = (date: string) => {
    const d = new Date(date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = d.getTime() - today.getTime();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { label: "Overdue", className: "text-red-600 dark:text-red-400" };
    if (days === 0) return { label: "Today", className: "text-amber-600 dark:text-amber-400" };
    if (days === 1) return { label: "Tomorrow", className: "text-blue-600 dark:text-blue-400" };
    return {
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      className: "text-gray-500 dark:text-gray-400",
    };
  };

  return (
    <div
      className={`group flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
        isDone
          ? "border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50"
          : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          isDone
            ? "border-green-500 bg-green-500 text-white"
            : "border-gray-300 hover:border-indigo-500 dark:border-gray-600"
        }`}
      >
        {isDone && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full bg-transparent text-gray-900 outline-none dark:text-white"
          />
        ) : (
          <p
            onDoubleClick={() => {
              if (!isDone) {
                setEditTitle(task.title);
                setEditing(true);
              }
            }}
            className={`cursor-default text-sm ${
              isDone
                ? "text-gray-400 line-through dark:text-gray-500"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {task.title}
          </p>
        )}
        {task.description && !editing && (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {task.description}
          </p>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2">
        {task.dueDate && !isDone && (
          <span className={`text-xs font-medium ${formatDueDate(task.dueDate).className}`}>
            {formatDueDate(task.dueDate).label}
          </span>
        )}

        {task.priority > 0 && !isDone && (
          <button
            onClick={cyclePriority}
            className={`text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}
            title={`Priority: ${PRIORITY_LABELS[task.priority]} (click to cycle)`}
          >
            {"!".repeat(task.priority)}
          </button>
        )}

      </div>
    </div>
  );
}
