import Dexie, { type EntityTable } from "dexie";
import type { Task } from "./types";

const db = new Dexie("RyanTaskManager") as Dexie & {
  tasks: EntityTable<Task, "id">;
};

db.version(1).stores({
  tasks: "id, mode, status, priority, dueDate, sortOrder, updatedAt, deletedAt, pendingSync",
});

export { db };
