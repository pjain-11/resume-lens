"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { buttonClasses } from "./Button";
import { EmptyState } from "./EmptyState";
import { HistoryCard } from "./HistoryCard";
import {
  clearHistory,
  deleteAnalysis,
  getHistoryServerSnapshot,
  getHistorySnapshot,
  subscribeHistory,
} from "@/lib/storage";
import { useHydrated } from "@/lib/useHydrated";

export function AnalysisHistory() {
  const hydrated = useHydrated();
  const items = useSyncExternalStore(
    subscribeHistory,
    getHistorySnapshot,
    getHistoryServerSnapshot,
  );

  function handleClearAll() {
    if (!window.confirm("Are you sure you want to clear all analysis history?")) {
      return;
    }
    clearHistory();
  }

  if (!hydrated) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading history">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No analyses yet"
        description="Your saved resume analyses will appear here."
        action={
          <Link href="/analyze" className={buttonClasses("primary", "md")}>
            Analyze Resume
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {items.length} saved {items.length === 1 ? "analysis" : "analyses"}
        </p>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-sm font-medium text-red-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:text-red-400"
        >
          Clear All
        </button>
      </div>

      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id}>
            <HistoryCard item={item} onDelete={deleteAnalysis} />
          </li>
        ))}
      </ul>
    </div>
  );
}
