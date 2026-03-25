"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import type { Mode, Task, TaskStatus, Priority } from "./types";

export function useTasks(mode: Mode) {
  const activeTasks = useLiveQuery(
    () =>
      db.tasks
        .where("mode")
        .equals(mode)
        .filter((t) => !t.deletedAt && t.status !== "done")
        .sortBy("sortOrder"),
    [mode],
    []
  );

  const doneTasks = useLiveQuery(
    () =>
      db.tasks
        .where("mode")
        .equals(mode)
        .filter((t) => !t.deletedAt && t.status === "done")
        .sortBy("updatedAt"),
    [mode],
    []
  );

  return { activeTasks, doneTasks };
}

export async function addTask(
  title: string,
  mode: Mode,
  options?: {
    description?: string;
    priority?: Priority;
    dueDate?: string;
  }
) {
  const now = new Date().toISOString();
  const count = await db.tasks.where("mode").equals(mode).count();

  const task: Task = {
    id: crypto.randomUUID(),
    title,
    description: options?.description,
    mode,
    status: "todo",
    priority: options?.priority ?? 0,
    dueDate: options?.dueDate,
    sortOrder: count,
    createdAt: now,
    updatedAt: now,
    pendingSync: true,
  };

  await db.tasks.add(task);
  return task;
}

export async function updateTask(
  id: string,
  changes: Partial<Pick<Task, "title" | "description" | "status" | "priority" | "dueDate" | "sortOrder">>
) {
  await db.tasks.update(id, {
    ...changes,
    updatedAt: new Date().toISOString(),
    pendingSync: true,
  });
}

export async function deleteTask(id: string) {
  await db.tasks.update(id, {
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pendingSync: true,
  });
}

export async function toggleTaskStatus(id: string, currentStatus: TaskStatus) {
  const newStatus: TaskStatus = currentStatus === "done" ? "todo" : "done";
  await updateTask(id, { status: newStatus });
}
