import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ResumeUploader } from "@/components/ResumeUploader";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";

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

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription>
              Upload your resume in PDF format.
            </CardDescription>
          </CardHeader>
          <ResumeUploader />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
            <CardDescription>
              Paste the job description you&apos;re targeting.
            </CardDescription>
          </CardHeader>
          <JobDescriptionInput />
        </Card>
      </div>

      <div className="mt-6 flex flex-col items-start gap-2">
        <Button size="lg" disabled aria-disabled="true">
          Analyze — coming in the next checkpoint
        </Button>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Analysis isn&apos;t wired up yet. This checkpoint builds the interface
          only.
        </p>
      </div>

      <section aria-labelledby="analysis-result" className="mt-12">
        <h2 id="analysis-result" className="sr-only">
          Analysis result
        </h2>
        <EmptyState
          icon={Sparkles}
          title="Your analysis will appear here"
          description="Upload your resume and add a job description to get started."
        />
      </section>
    </div>
  );
}
