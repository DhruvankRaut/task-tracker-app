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
  
  // Alarm Popup Modal & 12-Hour Reschedule States
  const [ringingTask, setRingingTask] = useState<Task | null>(null);
  const [newDueDate, setNewDueDate] = useState("");
  const [rescheduleHour, setRescheduleHour] = useState("12");
  const [rescheduleMinute, setRescheduleMinute] = useState("00");
  const [rescheduleAmpm, setRescheduleAmpm] = useState("AM");

  useEffect(() => {
    setTasks(parseStoredTasks(localStorage.getItem(STORAGE_KEY)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, hydrated]);

  // Alarm checker effect
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM

      tasks.forEach((task) => {
        if (
          task.dueDate === currentDate &&
          task.dueTime === currentTime &&
          task.status !== "completed" &&
          (!ringingTask || ringingTask.id !== task.id)
        ) {
          playAlarmSound(task.id, tasks);
          setRingingTask(task);
          setNewDueDate(task.dueDate || "");
          
          if (task.dueTime) {
            const [hStr, mStr] = task.dueTime.split(":");
            let h = parseInt(hStr, 10);
            const ampmVal = h >= 12 ? "PM" : "AM";
            h = h % 12;
            h = h ? h : 12;
            setRescheduleHour(String(h).padStart(2, "0"));
            setRescheduleMinute(mStr || "00");
            setRescheduleAmpm(ampmVal);
          }
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [tasks, ringingTask]);

  const playAlarmSound = (taskId: string, currentTasks: Task[]) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      let count = 0;
      const ringInterval = setInterval(() => {
        const latestTask = currentTasks.find((t) => t.id === taskId);
        if (!latestTask || latestTask.status === "completed" || count >= 10) {
          clearInterval(ringInterval);
          audioCtx.close();
          return;
        }

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);

        count++;
      }, 1000);
    } catch (e) {
      console.error("Audio context not supported or blocked", e);
    }
  };

  const visibleTasks = useMemo(
    () => filterTasks(tasks, filter),
    [tasks, filter],
  );

  // Find all active/pending/in-progress tasks that have a due date/time to display as persistent notifications
  const persistentNotifications = useMemo(
    () => tasks.filter((task) => task.status !== "completed" && (task.dueDate || task.dueTime)),
    [tasks],
  );

  const counts = useMemo(
    () => ({
      all: tasks.length,
      active: tasks.filter((task) => task.status !== "completed").length,
      completed: tasks.filter((task) => task.status === "completed").length,
    }),
    [tasks],
  );

  function addTask(
    title: string,
    description: string,
    priority: Priority,
    dueDate?: string,
    dueTime?: string,
  ) {
    setTasks((current) => [
      {
        ...createTask(title, description, priority),
        dueDate,
        dueTime,
      },
      ...current,
    ]);
  }

  function updateStatus(id: string, status: TaskStatus) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, status } : task)),
    );
    if (ringingTask?.id === id && status === "completed") {
      setRingingTask(null);
    }
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
    if (ringingTask?.id === id) {
      setRingingTask(null);
    }
  }

  function updateTaskSchedule(id: string, dueDate: string, dueTime: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, dueDate, dueTime, status: "in-progress" } : task
      )
    );
    setRingingTask(null);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 relative">
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

      {/* Permanent Persistent Notifications Banner for Active Scheduled Tasks */}
      {persistentNotifications.length > 0 && (
        <section className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
              Active Scheduled Task Notifications ({persistentNotifications.length})
            </h2>
            <span className="text-xs text-indigo-600/80 dark:text-indigo-400/80">
              Stays until completed or deleted
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {persistentNotifications.map((task) => {
              // Convert 24-hour time to 12-hour format for nice notification display
              let displayTime = task.dueTime;
              if (displayTime) {
                const [hStr, mStr] = displayTime.split(":");
                let h = parseInt(hStr, 10);
                const ampm = h >= 12 ? "PM" : "AM";
                h = h % 12;
                h = h ? h : 12;
                displayTime = `${h}:${mStr} ${ampm}`;
              }

              return (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white p-3.5 shadow-xs border border-indigo-100 dark:bg-zinc-900 dark:border-indigo-950"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-indigo-100 p-1.5 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {task.title}
                      </h3>
                      <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                        Due: {task.dueDate || "No date"} {displayTime ? `at ${displayTime}` : ""} 
                        <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] uppercase bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {task.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => updateStatus(task.id, "completed")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 transition"
                    >
                      Mark Complete
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
                        onReschedule={updateTaskSchedule}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Alarm Popup Modal with 12-Hour Reschedule */}
      {ringingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm uppercase tracking-wider mb-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              Alarm: Task Due!
            </div>
            
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">
              {ringingTask.title}
            </h2>
            {ringingTask.description && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {ringingTask.description}
              </p>
            )}

            <div className="mt-6 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Reschedule for later (Sets task to In-Progress):
              </p>
              
              <div className="flex flex-col gap-2">
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                />

                {/* 12-Hour Dropdown Selectors */}
                <div className="flex gap-2">
                  <select
                    value={rescheduleHour}
                    onChange={(e) => setRescheduleHour(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <option key={h} value={String(h).padStart(2, "0")}>
                        {h}
                      </option>
                    ))}
                  </select>

                  <select
                    value={rescheduleMinute}
                    onChange={(e) => setRescheduleMinute(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                  >
                    {["00","01","02","03","04","05","06","07","08","09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <select
                    value={rescheduleAmpm}
                    onChange={(e) => setRescheduleAmpm(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  let convertedHour = parseInt(rescheduleHour, 10);
                  if (rescheduleAmpm === "PM" && convertedHour < 12) convertedHour += 12;
                  if (rescheduleAmpm === "AM" && convertedHour === 12) convertedHour = 0;
                  const finalDueTime = `${String(convertedHour).padStart(2, "0")}:${rescheduleMinute}`;

                  updateTaskSchedule(ringingTask.id, newDueDate, finalDueTime);
                }}
                className="mt-3 w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition"
              >
                Save & Reschedule New Time
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => updateStatus(ringingTask.id, "completed")}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition"
              >
                Mark Complete
              </button>
              <button
                onClick={() => setRingingTask(null)}
                className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
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