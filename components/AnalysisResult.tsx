import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "./Card";
import { cn } from "@/lib/cn";
import type { ResumeAnalysis } from "@/types/analysis";

function matchLabel(score: number): string {
  if (score >= 90) return "Excellent Match";
  if (score >= 75) return "Strong Match";
  if (score >= 60) return "Moderate Match";
  return "Low Match";
}

function scoreTone(score: number): string {
  if (score >= 75) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function barTone(score: number): string {
  if (score >= 75) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
          {score}%
        </span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn("h-full rounded-full", barTone(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function AnalysisResult({ analysis }: { analysis: ResumeAnalysis }) {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
          <div className="text-center sm:text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Overall Match
            </p>
            <p
              className={cn(
                "mt-1 text-5xl font-bold tabular-nums",
                scoreTone(analysis.overallScore),
              )}
            >
              {analysis.overallScore}%
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {matchLabel(analysis.overallScore)}
            </p>
          </div>

          <div className="flex-1 space-y-3">
            <ScoreBar label="Skills Match" score={analysis.skillsMatchScore} />
            <ScoreBar label="Experience Match" score={analysis.experienceMatchScore} />
            <ScoreBar label="Education Match" score={analysis.educationMatchScore} />
          </div>
        </div>
      </Card>

      <Card>
        <Section title="Summary">
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {analysis.summary}
          </p>
        </Section>

        <Section title="Matching Skills">
          {analysis.matchingSkills.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {analysis.matchingSkills.map((skill, index) => (
                <li
                  key={`${index}-${skill}`}
                  className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No clearly matching skills were identified.
            </p>
          )}
        </Section>

        <Section title="Missing Skills">
          {analysis.missingSkills.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((skill, index) => (
                <li
                  key={`${index}-${skill}`}
                  className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                >
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No significant skill gaps were identified.
            </p>
          )}
        </Section>

        <Section title="Experience Analysis">
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {analysis.experienceAnalysis}
          </p>
        </Section>

        <Section title="Resume Suggestions">
          {analysis.resumeSuggestions.length > 0 ? (
            <ol className="space-y-2">
              {analysis.resumeSuggestions.map((suggestion, index) => (
                <li key={`${index}-${suggestion}`} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="shrink-0 font-semibold text-blue-600 tabular-nums dark:text-blue-400">
                    {index + 1}.
                  </span>
                  <span className="leading-relaxed">{suggestion}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No suggestions were returned.
            </p>
          )}
        </Section>

        <Section title="Interview Questions">
          <ol className="space-y-2">
            {analysis.interviewQuestions.map((question, index) => (
              <li key={`${index}-${question}`} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                <span className="shrink-0 font-semibold text-blue-600 tabular-nums dark:text-blue-400">
                  {index + 1}.
                </span>
                <span className="leading-relaxed">{question}</span>
              </li>
            ))}
          </ol>
        </Section>
      </Card>
    </div>
  );
}
