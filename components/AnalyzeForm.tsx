"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "./Button";
import { Card, CardDescription, CardHeader, CardTitle } from "./Card";
import { EmptyState } from "./EmptyState";
import { JobDescriptionInput } from "./JobDescriptionInput";
import { ResumeUploader } from "./ResumeUploader";
import { validateJobDescription, validateResumeFile } from "@/lib/validation";
import type { AnalyzeResponse, ResumeExtractionResult } from "@/types/analyze";

type Status = "idle" | "submitting" | "success" | "error";

export function AnalyzeForm() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ResumeExtractionResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | undefined>();
  const [jobDescriptionError, setJobDescriptionError] = useState<string | undefined>();

  const submitting = status === "submitting";

  function handleResumeSelect(file: File | null) {
    setResume(file);
    setResumeError(undefined);
    if (status === "error") setStatus("idle");
  }

  function handleJobDescriptionChange(value: string) {
    setJobDescription(value);
    setJobDescriptionError(undefined);
    if (status === "error") setStatus("idle");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return; // guard against duplicate submissions

    const resumeIssue = validateResumeFile(resume);
    const jobDescriptionIssue = validateJobDescription(jobDescription);
    setResumeError(resumeIssue?.message);
    setJobDescriptionError(jobDescriptionIssue?.message);
    setFormError(null);
    if (resumeIssue || jobDescriptionIssue) return;

    setStatus("submitting");
    setResult(null);

    try {
      const body = new FormData();
      body.append("resume", resume as File);
      body.append("jobDescription", jobDescription);

      const response = await fetch("/api/analyze", { method: "POST", body });
      const payload = (await response.json()) as AnalyzeResponse;

      if (!payload.success) {
        setFormError(payload.error.message);
        setStatus("error");
        return;
      }

      setResult(payload.data);
      setStatus("success");
    } catch {
      setFormError(
        "We couldn't reach the server. Check your connection and try again.",
      );
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription>Upload your resume in PDF format.</CardDescription>
          </CardHeader>
          <ResumeUploader
            file={resume}
            onSelect={handleResumeSelect}
            disabled={submitting}
            error={resumeError}
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
            <CardDescription>
              Paste the job description you&apos;re targeting.
            </CardDescription>
          </CardHeader>
          <JobDescriptionInput
            value={jobDescription}
            onChange={handleJobDescriptionChange}
            disabled={submitting}
            error={jobDescriptionError}
          />
        </Card>
      </div>

      <div className="mt-6 flex flex-col items-start gap-3">
        <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Reading resume...
            </>
          ) : (
            "Analyze resume"
          )}
        </Button>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          AI analysis arrives in the next checkpoint. For now this extracts the
          text from your PDF so we can verify it.
        </p>
      </div>

      {formError ? (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{formError}</p>
        </div>
      ) : null}

      <section aria-labelledby="analysis-result" className="mt-12">
        <h2 id="analysis-result" className="sr-only">
          Analysis result
        </h2>
        {status === "success" && result ? (
          <ExtractionResult result={result} />
        ) : (
          <EmptyState
            icon={Sparkles}
            title="Your analysis will appear here"
            description="Upload your resume and add a job description to get started."
          />
        )}
      </section>
    </form>
  );
}

function ExtractionResult({ result }: { result: ResumeExtractionResult }) {
  return (
    <Card className="border-green-200 dark:border-green-900">
      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        <p className="font-semibold">Resume processed successfully.</p>
      </div>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Resume
          </dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
            {result.resumeName}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Extracted characters
          </dt>
          <dd className="mt-1 text-sm tabular-nums text-zinc-900 dark:text-zinc-100">
            {result.resumeCharacterCount.toLocaleString()}
          </dd>
        </div>
      </dl>

      <details className="mt-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <summary className="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:text-zinc-300 dark:hover:bg-zinc-800/50">
          View extracted text
        </summary>
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          {result.resumeText ? (
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-zinc-700 dark:text-zinc-300">
              {result.resumeText}
            </pre>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              The extracted text preview is disabled in production.
            </p>
          )}
        </div>
      </details>

      <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
        This is a temporary view for verifying PDF extraction. AI analysis
        replaces it in the next checkpoint.
      </p>
    </Card>
  );
}
