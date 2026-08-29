"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { AnalysisResult } from "./AnalysisResult";
import { buttonClasses } from "./Button";
import { EmptyState } from "./EmptyState";
import {
  getHistoryServerSnapshot,
  getHistorySnapshot,
  subscribeHistory,
} from "@/lib/storage";
import { formatDate } from "@/lib/format";
import { useHydrated } from "@/lib/useHydrated";

export function SavedAnalysisView({ id }: { id: string }) {
  const hydrated = useHydrated();
  const items = useSyncExternalStore(
    subscribeHistory,
    getHistorySnapshot,
    getHistoryServerSnapshot,
  );
  const item = items.find((entry) => entry.id === id);

  if (!hydrated) {
    return (
      <div
        className="h-64 animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        aria-busy="true"
        aria-label="Loading analysis"
      />
    );
  }

  if (!item) {
    return (
      <EmptyState
        icon={FileText}
        title="Analysis not found"
        description="This analysis isn't in your history. It may have been deleted or saved in another browser."
        action={
          <Link href="/history" className={buttonClasses("primary", "md")}>
            Back to History
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <Link
        href="/history"
        className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to History
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            {item.jobTitle}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {item.resumeName} · {formatDate(item.createdAt)}
          </p>
        </div>
        <Link
          href="/analyze"
          className={buttonClasses("secondary", "sm", "shrink-0")}
        >
          Analyze Another
        </Link>
      </div>

      <div className="mt-8">
        <AnalysisResult analysis={item.analysis} />
      </div>
    </div>
  );
}
