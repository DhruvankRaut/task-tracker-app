import { Suspense } from "react";
import { TaskDashboard } from "@/components/TaskDashboard";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-100 font-sans dark:bg-zinc-950">
      <main className="flex flex-1 flex-col px-4 py-8 sm:px-8 sm:py-12">
        <Suspense fallback={<DashboardFallback />}>
          <TaskDashboard />
        </Suspense>
      </main>
    </div>
  );
}

function DashboardFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl text-sm text-zinc-500">
      Loading dashboard…
    </div>
  );
}