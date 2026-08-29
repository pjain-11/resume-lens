import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { buttonClasses } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";

export const metadata: Metadata = {
  title: "History",
  description: "Your previous resume analyses will appear here.",
};

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          Analysis History
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Your previous resume analyses will appear here.
        </p>
      </header>

      <div className="mt-10">
        <EmptyState
          icon={Clock}
          title="No analyses yet"
          description="Your previous resume analyses will appear here once you run one."
          action={
            <Link href="/analyze" className={buttonClasses("primary", "md")}>
              Analyze Resume
            </Link>
          }
        />
      </div>
    </div>
  );
}
