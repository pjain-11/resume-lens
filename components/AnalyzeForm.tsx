"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { AnalysisResult } from "./AnalysisResult";
import { Button } from "./Button";
import { Card, CardDescription, CardHeader, CardTitle } from "./Card";
import { EmptyState } from "./EmptyState";
import { JobDescriptionInput } from "./JobDescriptionInput";
import { ResumeUploader } from "./ResumeUploader";
import { validateJobDescription, validateResumeFile } from "@/lib/validation";
import type { ResumeAnalysis } from "@/types/analysis";
import type { AnalyzeResponse } from "@/types/analyze";

type Status = "idle" | "submitting" | "success" | "error";

const LOADING_MESSAGES = [
  "Reading your resume...",
  "Analyzing your skills...",
  "Comparing job requirements...",
  "Evaluating your experience...",
  "Generating recommendations...",
  "Preparing interview questions...",
];

export function AnalyzeForm() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | undefined>();
  const [jobDescriptionError, setJobDescriptionError] = useState<string | undefined>();
  const [loadingStep, setLoadingStep] = useState(0);

  const submitting = status === "submitting";
  const inFlight = useRef(false);

  useEffect(() => {
    if (!submitting) return;
    const id = setInterval(() => {
      setLoadingStep((step) => Math.min(step + 1, LOADING_MESSAGES.length - 1));
    }, 2500);
    return () => clearInterval(id);
  }, [submitting]);

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
    if (inFlight.current) return; // guard against duplicate submissions

    const resumeIssue = validateResumeFile(resume);
    const jobDescriptionIssue = validateJobDescription(jobDescription);
    setResumeError(resumeIssue?.message);
    setJobDescriptionError(jobDescriptionIssue?.message);
    setFormError(null);
    if (resumeIssue || jobDescriptionIssue) return;

    inFlight.current = true;
    setLoadingStep(0);
    setStatus("submitting");
    setAnalysis(null);

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

      setAnalysis(payload.data);
      setStatus("success");
    } catch {
      setFormError(
        "We couldn't reach the server. Check your connection and try again.",
      );
      setStatus("error");
    } finally {
      inFlight.current = false;
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
              {LOADING_MESSAGES[loadingStep]}
            </>
          ) : (
            "Analyze resume"
          )}
        </Button>
        {submitting ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">
            This can take up to a minute while the AI reviews your resume.
          </p>
        ) : null}
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
        {status === "success" && analysis ? (
          <AnalysisResult analysis={analysis} />
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
