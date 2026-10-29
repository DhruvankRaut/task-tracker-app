import type { Priority, StatusFilter, Task, TaskStatus } from "./types";

export const STORAGE_KEY = "tasktracker.tasks";

export const STATUSES: TaskStatus[] = ["pending", "in-progress", "completed"];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function createTask(
  title: string,
  description: string,
  priority: Priority,
): Task {
  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    description: description.trim(),
    priority,
    status: "pending",
    createdAt: Date.now(),
  };
}

export function parseStoredTasks(raw: string | null): Task[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isTask);
  } catch {
    return [];
  }
}

export function filterTasks(tasks: Task[], filter: StatusFilter): Task[] {
  if (filter === "active") {
    return tasks.filter((task) => task.status !== "completed");
  }

  if (filter === "completed") {
    return tasks.filter((task) => task.status === "completed");
  }

  return tasks;
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== "object") return false;

  const task = value as Record<string, unknown>;
  const priorities: Priority[] = ["low", "medium", "high"];
  const statuses: TaskStatus[] = ["pending", "in-progress", "completed"];

  return (
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.description === "string" &&
    typeof task.createdAt === "number" &&
    priorities.includes(task.priority as Priority) &&
    statuses.includes(task.status as TaskStatus)
  );
}
