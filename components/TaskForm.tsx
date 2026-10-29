"use client";

import { FormEvent, useState } from "react";
import type { Priority } from "@/lib/types";

type TaskFormProps = {
  onAdd: (title: string, description: string, priority: Priority) => void;
};

export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextTitle = String(data.get("title") ?? title).trim();
    const nextDescription = String(data.get("description") ?? description);
    const nextPriority = (data.get("priority") as Priority | null) ?? priority;

    if (!nextTitle) return;

    onAdd(nextTitle, nextDescription, nextPriority);
    setTitle("");
    setDescription("");
    setPriority("medium");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        New task
      </h2>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="sr-only">Title</span>
          <input
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Task title"
            required
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none ring-indigo-500/30 transition placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white focus:ring-4 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500 dark:focus:bg-zinc-950"
          />
        </label>
        <label className="block">
          <span className="sr-only">Priority</span>
          <select
            name="priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
            className="h-[42px] w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none ring-indigo-500/30 transition focus:border-indigo-400 focus:ring-4 md:w-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-indigo-500"
          >
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
        </label>
      </div>
      <label className="mt-3 block">
        <span className="sr-only">Description</span>
        <textarea
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description (optional)"
          rows={3}
          className="w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none ring-indigo-500/30 transition placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white focus:ring-4 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500 dark:focus:bg-zinc-950"/>
      </label>
      <button
        type="submit"
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30">
        Add task
      </button>
    </form>
  );
}
