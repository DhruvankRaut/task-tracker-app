"use client";

import { PRIORITY_LABELS, STATUS_LABELS, STATUSES } from "@/lib/tasks";
import type { Task, TaskStatus } from "@/lib/types";

type TaskCardProps = {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
};

const priorityStyles: Record<Task["priority"], string> = {
  low: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  medium:
    "bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  high: "bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20",
};

export function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const completed = task.status === "completed";

  return (
    <article className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={`text-sm font-semibold text-zinc-900 dark:text-zinc-50 ${
              completed ? "line-through opacity-60" : ""
            }`}
          >
            {task.title}
          </h3>
          {task.description ? (
            <p
              className={`mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400 ${
                completed ? "line-through opacity-60" : ""
              }`}
            >
              {task.description}
            </p>
          ) : null}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${priorityStyles[task.priority]}`}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={`status-${task.id}`}>
          Status
        </label>
        <select
          id={`status-${task.id}`}
          value={task.status}
          onChange={(event) =>
            onStatusChange(task.id, event.target.value as TaskStatus)
          }
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-700 outline-none ring-indigo-500/20 focus:border-indigo-400 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() =>
            onStatusChange(
              task.id,
              completed ? "pending" : "completed",
            )
          }
          className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          {completed ? "Mark pending" : "Mark complete"}
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="ml-auto rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
