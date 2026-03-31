"use client";

import { useState, useRef, useCallback } from "react";
import { useMode } from "@/providers/ModeProvider";
import { useTasksByStatus, moveTaskToStatus, updateTask } from "@/lib/hooks";
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  type Task,
  type TaskStatus,
  type Priority,
} from "@/lib/types";

const COLUMNS: { status: TaskStatus; label: string; color: string; bgColor: string; borderColor: string }[] = [
  {
    status: "todo",
    label: "To Do",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    status: "in_progress",
    label: "In Progress",
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  {
    status: "done",
    label: "Done",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
  },
];

interface DragState {
  taskId: string;
  sourceStatus: TaskStatus;
}

function KanbanCard({
  task,
  onDragStart,
}: {
  task: Task;
  onDragStart: (taskId: string, status: TaskStatus) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const isDone = task.status === "done";

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
      draggable={!editing}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart(task.id, task.status);
      }}
      className={`cursor-grab rounded-lg border bg-white p-3 shadow-sm transition-all active:cursor-grabbing dark:bg-gray-800 ${
        isDone
          ? "border-gray-100 dark:border-gray-700"
          : "border-gray-200 hover:border-gray-300 hover:shadow dark:border-gray-700 dark:hover:border-gray-600"
      }`}
    >
      {editing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full bg-transparent text-sm text-gray-900 outline-none dark:text-white"
        />
      ) : (
        <p
          onDoubleClick={() => {
            if (!isDone) {
              setEditTitle(task.title);
              setEditing(true);
            }
          }}
          className={`text-sm ${
            isDone
              ? "text-gray-400 line-through dark:text-gray-500"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {task.title}
        </p>
      )}

      {task.description && !editing && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {task.description}
        </p>
      )}

      {(task.dueDate || task.priority > 0) && (
        <div className="mt-2 flex items-center gap-2">
          {task.dueDate && (
            <span
              className={`text-xs font-medium ${
                isDone ? "text-gray-400 dark:text-gray-500" : formatDueDate(task.dueDate).className
              }`}
            >
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
      )}
    </div>
  );
}

function KanbanColumn({
  status,
  label,
  color,
  bgColor,
  borderColor,
  tasks,
  dragOverStatus,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  status: TaskStatus;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  tasks: Task[];
  dragOverStatus: TaskStatus | null;
  onDragStart: (taskId: string, status: TaskStatus) => void;
  onDragOver: (e: React.DragEvent, status: TaskStatus) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, status: TaskStatus) => void;
}) {
  const isOver = dragOverStatus === status;

  return (
    <div
      className={`flex min-h-[200px] flex-1 flex-col rounded-xl border ${borderColor} ${bgColor} transition-all ${
        isOver ? "ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-gray-900" : ""
      }`}
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className={`text-sm font-semibold ${color}`}>{label}</h3>
        <span
          className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-medium ${color} ${borderColor} border`}
        >
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3 pb-3">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} onDragStart={onDragStart} />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-8 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {isOver ? "Drop here" : "No tasks"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const { mode } = useMode();
  const { todoTasks, inProgressTasks, doneTasks } = useTasksByStatus(mode);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

  const tasksByStatus: Record<TaskStatus, Task[]> = {
    todo: todoTasks,
    in_progress: inProgressTasks,
    done: doneTasks,
  };

  const handleDragStart = useCallback((taskId: string, sourceStatus: TaskStatus) => {
    setDragState({ taskId, sourceStatus });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStatus(status);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverStatus(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetStatus: TaskStatus) => {
      e.preventDefault();
      setDragOverStatus(null);

      if (dragState && dragState.sourceStatus !== targetStatus) {
        await moveTaskToStatus(dragState.taskId, targetStatus);
      }

      setDragState(null);
    },
    [dragState]
  );

  return (
    <div className="flex gap-4">
      {COLUMNS.map((col) => (
        <KanbanColumn
          key={col.status}
          {...col}
          tasks={tasksByStatus[col.status]}
          dragOverStatus={dragOverStatus}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
