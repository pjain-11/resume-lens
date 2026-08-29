import Link from "next/link";
import { FileText, Trash2 } from "lucide-react";
import { buttonClasses } from "./Button";
import { Card } from "./Card";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { AnalysisHistoryItem } from "@/types/analysis";

function scoreTone(score: number): string {
  if (score >= 75) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

interface HistoryCardProps {
  item: AnalysisHistoryItem;
  onDelete: (id: string) => void;
}

export function HistoryCard({ item, onDelete }: HistoryCardProps) {
  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {item.jobTitle}
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="truncate">{item.resumeName}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>{formatDate(item.createdAt)}</span>
        </p>
        <p
          className={cn(
            "mt-2 text-sm font-semibold tabular-nums",
            scoreTone(item.analysis.overallScore),
          )}
        >
          {item.analysis.overallScore}% Match
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={`/history/${item.id}`}
          className={buttonClasses("secondary", "sm")}
        >
          View Analysis
        </Link>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:text-red-400 dark:hover:bg-red-950/40"
          aria-label={`Delete analysis for ${item.jobTitle}`}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Delete
        </button>
      </div>
    </Card>
  );
}
