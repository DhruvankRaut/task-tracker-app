"use client";

import { useEffect, useMemo, useState } from "react";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import {
  STORAGE_KEY,
  STATUS_LABELS,
  STATUSES,
  createTask,
  filterTasks,
  parseStoredTasks,
} from "@/lib/tasks";
import type { Priority, StatusFilter, Task, TaskStatus } from "@/lib/types";

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

export function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTasks(parseStoredTasks(localStorage.getItem(STORAGE_KEY)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, hydrated]);

  const visibleTasks = useMemo(
    () => filterTasks(tasks, filter),
    [tasks, filter],
  );

  const counts = useMemo(
    () => ({
      all: tasks.length,
      active: tasks.filter((task) => task.status !== "completed").length,
      completed: tasks.filter((task) => task.status === "completed").length,
    }),
    [tasks],
  );

  function addTask(title: string, description: string, priority: Priority) {
    setTasks((current) => [createTask(title, description, priority), ...current]);
  }

  function updateStatus(id: string, status: TaskStatus) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, status } : task)),
    );
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Task Tracker
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Create tasks, set priority, and move work from pending to done.
            Everything stays in this browser.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Stat label="Total" value={counts.all} />
          <Stat label="Active" value={counts.active} />
          <Stat label="Done" value={counts.completed} />
        </div>
      </header>

      <TaskForm onAdd={addTask} />

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => {
          const selected = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                selected
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-300 dark:ring-zinc-800 dark:hover:bg-zinc-900"
              }`}
            >
              {item.label}
              <span className="ml-1.5 text-xs opacity-70">{counts[item.id]}</span>
            </button>
          );
        })}
      </div>

      {!hydrated ? (
        <p className="text-sm text-zinc-500">Loading tasks…</p>
      ) : visibleTasks.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {STATUSES.map((status) => {
            const columnTasks = visibleTasks.filter(
              (task) => task.status === status,
            );

            if (filter !== "all" && columnTasks.length === 0) {
              return null;
            }

            return (
              <section
                key={status}
                className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {STATUS_LABELS[status]}
                  </h2>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-400 dark:ring-zinc-800">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {columnTasks.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-zinc-200 px-3 py-6 text-center text-sm text-zinc-400 dark:border-zinc-800">
                      No tasks here
                    </p>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={updateStatus}
                        onDelete={deleteTask}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
    </div>
  );
}

function EmptyState({ filter }: { filter: StatusFilter }) {
  const message =
    filter === "completed"
      ? "No completed tasks yet."
      : filter === "active"
        ? "No active tasks. Add one above to get started."
        : "Your board is empty. Add a task to begin.";

  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
        {message}
      </p>
    </div>
  );
}
