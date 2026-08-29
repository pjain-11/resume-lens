import type { Metadata } from "next";
import { AnalyzeForm } from "@/components/AnalyzeForm";

export const metadata: Metadata = {
  title: "Analyze",
  description: "Compare your resume with a job description using AI.",
};

export default function AnalyzePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          Analyze Your Resume
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Compare your resume with a job description using AI.
        </p>
      </header>

      <div className="mt-10">
        <AnalyzeForm />
      </div>
    </div>
  );
}
