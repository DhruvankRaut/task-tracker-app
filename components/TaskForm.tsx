"use client";

import { FormEvent, useState } from "react";
import type { Priority } from "@/lib/types";

type TaskFormProps = {
  onAdd: (title: string, description: string, priority: Priority, dueDate?: string, dueTime?: string) => void;
};

export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState("AM");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextTitle = String(data.get("title") ?? title).trim();
    const nextDescription = String(data.get("description") ?? description);
    const nextPriority = (data.get("priority") as Priority | null) ?? priority;
    const nextDueDate = String(data.get("dueDate") ?? dueDate);

    if (!nextTitle) return;

    // Convert 12-hour format to 24-hour format (HH:MM) for the backend/alarm checker
    let convertedHour = parseInt(hour, 10);
    if (ampm === "PM" && convertedHour < 12) convertedHour += 12;
    if (ampm === "AM" && convertedHour === 12) convertedHour = 0;
    const dueTime = nextDueDate ? `${String(convertedHour).padStart(2, "0")}:${minute}` : undefined;

    onAdd(nextTitle, nextDescription, nextPriority, nextDueDate || undefined, dueTime);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setHour("12");
    setMinute("00");
    setAmpm("AM");
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

      {/* Date and 12-Hour Time Inputs */}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Due Date</span>
          <input
            type="date"
            name="dueDate"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none ring-indigo-500/30 transition focus:border-indigo-400 focus:bg-white focus:ring-4 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-indigo-500 dark:focus:bg-zinc-950"
          />
        </label>
        
        <div className="block">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Due Time (12-Hour)</span>
          <div className="flex gap-2">
            {/* Hour Selector */}
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-2.5 text-sm text-zinc-900 outline-none ring-indigo-500/30 transition focus:border-indigo-400 focus:bg-white focus:ring-4 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-indigo-500 dark:focus:bg-zinc-950"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={String(h).padStart(2, "0")}>
                  {h}
                </option>
              ))}
            </select>

            {/* Minute Selector */}
            <select
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-2.5 text-sm text-zinc-900 outline-none ring-indigo-500/30 transition focus:border-indigo-400 focus:bg-white focus:ring-4 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-indigo-500 dark:focus:bg-zinc-950"
            >
              {["00","01","02","03","04","05","06","07","08","09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* AM/PM Selector */}
            <select
              value={ampm}
              onChange={(e) => setAmpm(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-2.5 text-sm text-zinc-900 outline-none ring-indigo-500/30 transition focus:border-indigo-400 focus:bg-white focus:ring-4 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-indigo-500 dark:focus:bg-zinc-950"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>

      <label className="mt-3 block">
        <span className="sr-only">Description</span>
        <textarea
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description (optional)"
          rows={3}
          className="w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none ring-indigo-500/30 transition placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white focus:ring-4 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500 dark:focus:bg-zinc-950"
        />
      </label>
      <button
        type="submit"
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30"
      >
        Add task
      </button>
    </form>
  );
}