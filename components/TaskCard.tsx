"use client";

import { useState } from "react";
import type { Task, TaskStatus } from "@/lib/types";

type TaskCardProps = {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onReschedule: (id: string, dueDate: string, dueTime: string) => void;
};

export function TaskCard({ task, onStatusChange, onDelete, onReschedule }: TaskCardProps) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(task.dueDate || "");
  const [newTime, setNewTime] = useState(task.dueTime || "");

  function handleSaveReschedule() {
    onReschedule(task.id, newDate, newTime);
    setIsRescheduling(false);
  }

  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm transition dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-50">{task.title}</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${
          task.priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400" :
          task.priority === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" :
          "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
        }`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{task.description}</p>
      )}

      {/* Due Date & Time Display */}
      {(task.dueDate || task.dueTime) && (
        <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          Due: {task.dueDate || "No date"} {task.dueTime ? `at ${task.dueTime}` : ""}
        </div>
      )}

      {/* Reschedule View */}
      {isRescheduling ? (
        <div className="mt-3 flex flex-col gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <div className="flex gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsRescheduling(false)}
              className="rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveReschedule}
              className="rounded bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-500"
            >
              Save Time
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-900">
          <div className="flex gap-1.5">
            {task.status !== "pending" && (
              <button
                onClick={() => onStatusChange(task.id, "pending")}
                className="rounded px-2 py-1 text-xs font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Pending
              </button>
            )}
            {task.status !== "in-progress" && (
              <button
                onClick={() => onStatusChange(task.id, "in-progress")}
                className="rounded px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400"
              >
                In Progress
              </button>
            )}
            {task.status !== "completed" && (
              <button
                onClick={() => onStatusChange(task.id, "completed")}
                className="rounded px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                Complete
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsRescheduling(true)}
              className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Reschedule
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="text-xs text-red-500 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}