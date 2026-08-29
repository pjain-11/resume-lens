import Link from "next/link";
import {
  FileText,
  Gauge,
  ListChecks,
  MessageSquareQuote,
  Sparkles,
  Upload,
} from "lucide-react";
import { buttonClasses } from "@/components/Button";
import { FeatureCard } from "@/components/FeatureCard";

const steps = [
  {
    icon: Upload,
    title: "Upload Resume",
    description: "Upload your PDF resume.",
  },
  {
    icon: FileText,
    title: "Add Job Description",
    description: "Paste the job description you're targeting.",
  },
  {
    icon: Sparkles,
    title: "Get AI Insights",
    description: "Receive a detailed match analysis.",
  },
];

const features = [
  {
    icon: Gauge,
    title: "Match Score",
    description: "See how closely your resume aligns with the role at a glance.",
  },
  {
    icon: ListChecks,
    title: "Skills Analysis",
    description: "Spot the skills you have and the ones the job is asking for.",
  },
  {
    icon: FileText,
    title: "Resume Suggestions",
    description: "Get concrete edits to strengthen your resume for this job.",
  },
  {
    icon: MessageSquareQuote,
    title: "Interview Questions",
    description: "Practice with questions tailored to your resume and the role.",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl md:text-5xl dark:text-zinc-50">
            Know how well your resume matches the job.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
            Analyze your resume against any job description and get AI-powered
            insights, skill gaps, improvement suggestions, and interview
            questions.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/analyze"
              className={buttonClasses("primary", "lg", "w-full sm:w-auto")}
            >
              Analyze Resume
            </Link>
            <Link
              href="/history"
              className={buttonClasses("secondary", "lg", "w-full sm:w-auto")}
            >
              View History
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-it-works" className="py-12">
        <h2
          id="how-it-works"
          className="text-center text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          How it works
        </h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white dark:bg-blue-500">
                  {i + 1}
                </span>
                <step.icon
                  className="h-5 w-5 text-zinc-400 dark:text-zinc-500"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* What you'll get */}
      <section aria-labelledby="what-youll-get" className="py-12 pb-24">
        <h2
          id="what-youll-get"
          className="text-center text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          What you&apos;ll get
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>
    </div>
  );
}
