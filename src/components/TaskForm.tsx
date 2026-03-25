"use client";

import { useState, useRef, useEffect } from "react";
import { useMode } from "@/providers/ModeProvider";
import { addTask } from "@/lib/hooks";
import type { Priority } from "@/lib/types";

export default function TaskForm() {
  const { mode } = useMode();
  const [title, setTitle] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(0);
  const [dueDate, setDueDate] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    await addTask(trimmed, mode, {
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
    });

    setTitle("");
    setDescription("");
    setPriority(0);
    setDueDate("");
    setExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setExpanded(false);
      setTitle("");
      setDescription("");
      setPriority(0);
      setDueDate("");
    }
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="mb-6">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-xl text-indigo-500">+</span>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="Add a task..."
            className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 outline-none dark:text-white dark:placeholder-gray-500"
          />
          {title.trim() && (
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Add
            </button>
          )}
        </div>

        {expanded && (
          <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-700">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="mb-3 w-full resize-none bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none dark:text-gray-300"
            />
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                Priority:
                <select
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value) as Priority)}
                  className="rounded border border-gray-200 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                >
                  <option value={0}>None</option>
                  <option value={1}>Low</option>
                  <option value={2}>Medium</option>
                  <option value={3}>High</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                Due:
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded border border-gray-200 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
