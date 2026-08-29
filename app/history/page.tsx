import type { Metadata } from "next";
import { AnalysisHistory } from "@/components/AnalysisHistory";

export const metadata: Metadata = {
  title: "History",
  description: "Your saved resume analyses, stored locally in your browser.",
};

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          Analysis History
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Your saved resume analyses. These are stored only in this browser.
        </p>
      </header>

      <div className="mt-10">
        <AnalysisHistory />
      </div>
    </div>
  );
}
