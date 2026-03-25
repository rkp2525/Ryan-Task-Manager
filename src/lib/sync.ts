import { db } from "./db";
import { supabase } from "./supabase";
import type { Task } from "./types";

interface SupabaseTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  mode: "personal" | "professional";
  status: "todo" | "in_progress" | "done";
  priority: number;
  due_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function toLocal(row: SupabaseTask): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    mode: row.mode,
    status: row.status,
    priority: row.priority as Task["priority"],
    dueDate: row.due_date ?? undefined,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? undefined,
    pendingSync: false,
  };
}

function toRemote(task: Task, userId: string): SupabaseTask {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    description: task.description ?? null,
    mode: task.mode,
    status: task.status,
    priority: task.priority,
    due_date: task.dueDate ?? null,
    sort_order: task.sortOrder,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    deleted_at: task.deletedAt ?? null,
  };
}

let lastSyncAt: string | null = null;

export async function pushChanges(userId: string) {
  const pending = await db.tasks.where("pendingSync").equals(1).toArray();
  if (pending.length === 0) return;

  const rows = pending.map((t) => toRemote(t, userId));

  const { error } = await supabase.from("tasks").upsert(rows, { onConflict: "id" });

  if (!error) {
    await db.tasks.bulkUpdate(
      pending.map((t) => ({ key: t.id, changes: { pendingSync: false } }))
    );
  } else {
    console.error("Push failed:", error.message);
  }
}

export async function pullChanges(userId: string) {
  let query = supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId);

  if (lastSyncAt) {
    query = query.gt("updated_at", lastSyncAt);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Pull failed:", error.message);
    return;
  }

  if (!data || data.length === 0) return;

  for (const row of data as SupabaseTask[]) {
    const local = await db.tasks.get(row.id);
    // Only update local if remote is newer or local doesn't exist
    if (!local || new Date(row.updated_at) > new Date(local.updatedAt)) {
      await db.tasks.put(toLocal(row));
    }
  }

  lastSyncAt = new Date().toISOString();
}

export async function fullSync(userId: string) {
  await pushChanges(userId);
  await pullChanges(userId);
}

let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

export function subscribeToRealtime(userId: string) {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }

  realtimeChannel = supabase
    .channel("tasks-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "tasks",
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        const row = payload.new as SupabaseTask;
        if (!row?.id) return;

        const local = await db.tasks.get(row.id);
        if (!local || (new Date(row.updated_at) > new Date(local.updatedAt) && !local.pendingSync)) {
          await db.tasks.put(toLocal(row));
        }
      }
    )
    .subscribe();
}

export function unsubscribeFromRealtime() {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}
