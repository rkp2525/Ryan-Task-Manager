export type Mode = "personal" | "professional";

export type TaskStatus = "todo" | "in_progress" | "done";

export type Priority = 0 | 1 | 2 | 3; // 0=none, 1=low, 2=medium, 3=high

export interface Task {
  id: string;
  title: string;
  description?: string;
  mode: Mode;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string; // ISO date string
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  pendingSync?: boolean;
  isSticky?: boolean;
  stickyX?: number;
  stickyY?: number;
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  0: "None",
  1: "Low",
  2: "Medium",
  3: "High",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  0: "text-gray-400",
  1: "text-blue-500",
  2: "text-yellow-500",
  3: "text-red-500",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};
