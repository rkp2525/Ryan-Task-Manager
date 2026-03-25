"use client";

import { useRef, useState, useCallback } from "react";
import { setStickyPosition, removeSticky, toggleTaskStatus, updateTask } from "@/lib/hooks";
import { PRIORITY_COLORS } from "@/lib/types";
import type { Task } from "@/lib/types";

const STICKY_COLORS = [
  "bg-yellow-200 border-yellow-300",
  "bg-blue-200 border-blue-300",
  "bg-green-200 border-green-300",
  "bg-pink-200 border-pink-300",
  "bg-purple-200 border-purple-300",
];

function getColorForTask(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return STICKY_COLORS[Math.abs(hash) % STICKY_COLORS.length];
}

export default function StickyNote({ task }: { task: Task }) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const isDone = task.status === "done";
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title);
  const [descValue, setDescValue] = useState(task.description ?? "");

  const saveTitle = async () => {
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== task.title) {
      await updateTask(task.id, { title: trimmed });
    } else {
      setTitleValue(task.title);
    }
    setEditingTitle(false);
  };

  const saveDesc = async () => {
    const trimmed = descValue.trim();
    if (trimmed !== (task.description ?? "")) {
      await updateTask(task.id, { description: trimmed || undefined });
    } else {
      setDescValue(task.description ?? "");
    }
    setEditingDesc(false);
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button, input, textarea")) return;
      e.preventDefault();
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: task.stickyX ?? 100,
        origY: task.stickyY ?? 100,
      };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current || !noteRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        const newX = Math.max(0, dragRef.current.origX + dx);
        const newY = Math.max(0, dragRef.current.origY + dy);
        noteRef.current.style.left = `${newX}px`;
        noteRef.current.style.top = `${newY}px`;
      };

      const handleMouseUp = (ev: MouseEvent) => {
        if (dragRef.current) {
          const dx = ev.clientX - dragRef.current.startX;
          const dy = ev.clientY - dragRef.current.startY;
          const newX = Math.max(0, dragRef.current.origX + dx);
          const newY = Math.max(0, dragRef.current.origY + dy);
          setStickyPosition(task.id, newX, newY);
        }
        dragRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [task.id, task.stickyX, task.stickyY]
  );

  const colorClass = getColorForTask(task.id);

  return (
    <div
      ref={noteRef}
      onMouseDown={handleMouseDown}
      className={`fixed z-50 w-56 cursor-grab rounded-lg border-2 p-3 shadow-lg active:cursor-grabbing ${colorClass}`}
      style={{ left: task.stickyX ?? 100, top: task.stickyY ?? 100 }}
    >
      {/* Close button */}
      <button
        onClick={() => removeSticky(task.id)}
        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-600 text-xs text-white shadow hover:bg-gray-800"
        title="Remove sticky"
      >
        x
      </button>

      {/* Done toggle */}
      <button
        onClick={() => toggleTaskStatus(task.id, task.status)}
        className={`absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full border-2 shadow ${
          isDone
            ? "border-green-500 bg-green-500 text-white"
            : "border-gray-400 bg-white"
        }`}
        title={isDone ? "Mark as todo" : "Mark as done"}
      >
        {isDone && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Title — double-click to edit */}
      {editingTitle ? (
        <input
          type="text"
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") { setTitleValue(task.title); setEditingTitle(false); } }}
          autoFocus
          className="w-full rounded bg-white/50 px-1 text-sm font-medium text-gray-800 outline-none"
        />
      ) : (
        <p
          onDoubleClick={() => { if (!isDone) { setTitleValue(task.title); setEditingTitle(true); } }}
          className={`text-sm font-medium text-gray-800 ${isDone ? "line-through opacity-60" : "cursor-text"}`}
        >
          {task.title}
        </p>
      )}

      {/* Description — double-click to edit, click to add if empty */}
      {editingDesc ? (
        <textarea
          value={descValue}
          onChange={(e) => setDescValue(e.target.value)}
          onBlur={saveDesc}
          onKeyDown={(e) => { if (e.key === "Escape") { setDescValue(task.description ?? ""); setEditingDesc(false); } }}
          autoFocus
          rows={3}
          className="mt-1 w-full resize-none rounded bg-white/50 px-1 text-xs text-gray-700 outline-none"
          placeholder="Add a description..."
        />
      ) : (
        <p
          onDoubleClick={() => { if (!isDone) { setDescValue(task.description ?? ""); setEditingDesc(true); } }}
          onClick={() => { if (!isDone && !task.description) { setDescValue(""); setEditingDesc(true); } }}
          className={`mt-1 text-xs ${task.description ? "text-gray-600" : "text-gray-400 italic cursor-text"} ${isDone ? "opacity-60" : "cursor-text"}`}
        >
          {task.description || (isDone ? "" : "Double-click to add note...")}
        </p>
      )}

      {/* Footer: due date + priority */}
      <div className="mt-2 flex items-center justify-between">
        {task.dueDate && (
          <span className="text-xs text-gray-600">
            {new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
        {task.priority > 0 && (
          <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
            {"!".repeat(task.priority)}
          </span>
        )}
      </div>
    </div>
  );
}
