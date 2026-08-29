"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import {
  JOB_DESCRIPTION_MAX_LENGTH,
  JOB_DESCRIPTION_MIN_LENGTH,
} from "@/lib/validation";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

/** Controlled job description textarea with a live character counter. */
export function JobDescriptionInput({
  value,
  onChange,
  disabled = false,
  error,
}: JobDescriptionInputProps) {
  const id = useId();
  const errorId = useId();
  const trimmedLength = value.trim().length;
  const belowMin = trimmedLength > 0 && trimmedLength < JOB_DESCRIPTION_MIN_LENGTH;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100"
      >
        Job description
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={12}
        maxLength={JOB_DESCRIPTION_MAX_LENGTH}
        placeholder="Paste the job description here..."
        aria-describedby={cn(`${id}-hint`, error ? errorId : undefined)}
        aria-invalid={error ? true : undefined}
        className={cn(
          "w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500",
          error
            ? "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/30"
            : "border-zinc-300 focus-visible:border-blue-500 focus-visible:ring-blue-600/30 dark:border-zinc-700",
        )}
      />
      <div className="mt-2 flex items-start justify-between gap-4">
        <p id={`${id}-hint`} className="text-xs text-zinc-500 dark:text-zinc-400">
          Minimum {JOB_DESCRIPTION_MIN_LENGTH} characters.
        </p>
        <span
          className={cn(
            "shrink-0 text-xs tabular-nums",
            belowMin
              ? "text-amber-600 dark:text-amber-400"
              : "text-zinc-500 dark:text-zinc-400",
          )}
          aria-live="polite"
        >
          {value.length.toLocaleString()} /{" "}
          {JOB_DESCRIPTION_MAX_LENGTH.toLocaleString()}
        </span>
      </div>
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
