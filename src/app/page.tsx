"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useView } from "@/providers/ViewProvider";
import Header from "@/components/Header";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import KanbanBoard from "@/components/KanbanBoard";
import InstallButton from "@/components/InstallButton";
import SyncStatus from "@/components/SyncStatus";
import StickyNotesLayer from "@/components/StickyNotesLayer";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";

export default function Home() {
  const { user, loading } = useAuth();
  const { view } = useView();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className={`mx-auto px-4 py-8 ${view === "kanban" ? "max-w-5xl" : "max-w-3xl"}`}>
        <SyncStatus />
        <TaskForm />
        {view === "kanban" ? <KanbanBoard /> : <TaskList />}
      </main>
      <StickyNotesLayer />
      <InstallButton />
      <KeyboardShortcuts />
    </div>
  );
}
