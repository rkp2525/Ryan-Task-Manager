"use client";

import { useMode } from "@/providers/ModeProvider";
import { useStickyTasks } from "@/lib/hooks";
import StickyNote from "./StickyNote";

export default function StickyNotesLayer() {
  const { mode } = useMode();
  const stickyTasks = useStickyTasks(mode);

  if (stickyTasks.length === 0) return null;

  return (
    <>
      {stickyTasks.map((task) => (
        <StickyNote key={task.id} task={task} />
      ))}
    </>
  );
}
