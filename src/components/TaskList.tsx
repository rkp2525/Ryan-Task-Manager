"use client";

import { useState, useRef, useCallback } from "react";
import { useMode } from "@/providers/ModeProvider";
import { useTasks, reorderTasks } from "@/lib/hooks";
import TaskItem from "./TaskItem";

interface DragState {
  taskId: string;
  startIndex: number;
}

export default function TaskList() {
  const { mode } = useMode();
  const { activeTasks, doneTasks } = useTasks(mode);
  const [showDone, setShowDone] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((taskId: string, index: number) => {
    setDragState({ taskId, startIndex: index });
    setDropIndex(index);
  }, []);

  const handleDragMove = useCallback((clientY: number) => {
    if (!listRef.current || !dragState) return;

    const taskElements = listRef.current.querySelectorAll("[data-task-item]");
    
    let newDropIndex = activeTasks.length;
    
    for (let i = 0; i < taskElements.length; i++) {
      const rect = taskElements[i].getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      
      if (clientY < midpoint) {
        newDropIndex = i;
        break;
      }
    }
    
    setDropIndex(newDropIndex);
  }, [dragState, activeTasks.length]);

  const handleDragEnd = useCallback(async () => {
    if (dragState && dropIndex !== null && dropIndex !== dragState.startIndex) {
      // Adjust target index if moving down (since the dragged item will be removed first)
      const targetIndex = dropIndex > dragState.startIndex ? dropIndex - 1 : dropIndex;
      await reorderTasks(mode, dragState.taskId, targetIndex);
    }
    setDragState(null);
    setDropIndex(null);
  }, [dragState, dropIndex, mode]);

  const handleDragCancel = useCallback(() => {
    setDragState(null);
    setDropIndex(null);
  }, []);

  return (
    <div>
      {/* Active tasks */}
      <div ref={listRef} className="space-y-2">
        {activeTasks.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-400 dark:text-gray-500">
              No tasks yet. Add one above!
            </p>
          </div>
        )}
        {activeTasks.map((task, index) => (
          <div key={task.id} data-task-item>
            {/* Drop indicator before this task */}
            {dragState && dropIndex === index && dropIndex !== dragState.startIndex && (
              <div className="mb-2 h-1 rounded bg-indigo-500 transition-all" />
            )}
            <TaskItem
              task={task}
              index={index}
              isDragging={dragState?.taskId === task.id}
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            />
          </div>
        ))}
        {/* Drop indicator at end of list */}
        {dragState && dropIndex === activeTasks.length && dropIndex !== dragState.startIndex && (
          <div className="mt-2 h-1 rounded bg-indigo-500 transition-all" />
        )}
      </div>

      {/* Completed tasks */}
      {doneTasks.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowDone(!showDone)}
            className="mb-2 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className={`h-3 w-3 transition-transform ${showDone ? "rotate-90" : ""}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
            Completed ({doneTasks.length})
          </button>
          {showDone && (
            <div className="space-y-2">
              {doneTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
