export type Priority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "in-progress" | "completed";
export type StatusFilter = "all" | "active" | "completed";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  createdAt: number;
};
