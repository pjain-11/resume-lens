"use client";

import { useId, useRef, useState } from "react";
import { CheckCircle2, FileText, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/format";

interface ResumeUploaderProps {
  file: File | null;
  onSelect: (file: File | null) => void;
  disabled?: boolean;
  error?: string;
}

/**
 * Controlled resume file picker. Supports click-to-browse and drag & drop.
 * The file is held in memory by the parent and sent to the API on submit —
 * nothing is uploaded on selection.
 */
export function ResumeUploader({
  file,
  onSelect,
  disabled = false,
  error,
}: ResumeUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const [dragging, setDragging] = useState(false);

  function openPicker() {
    if (!disabled) inputRef.current?.click();
  }

  if (file) {
    return (
      <div>
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border p-4",
            "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {file.name}
            </p>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span>{formatBytes(file.size)}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                PDF
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            disabled={disabled}
            className="shrink-0 rounded-md px-2 py-1 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <X className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
            Remove
          </button>
        </div>
        {error ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-label="Upload resume. Drag and drop a PDF here, or activate to browse files."
        aria-describedby={error ? errorId : undefined}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled) return;
          onSelect(e.dataTransfer.files?.[0] ?? null);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",
          disabled && "cursor-not-allowed opacity-60",
          !disabled && "cursor-pointer",
          dragging
            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/40"
            : "border-zinc-300 bg-zinc-50 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/40 dark:hover:border-zinc-600",
        )}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm dark:bg-zinc-800">
          <UploadCloud
            className="h-6 w-6 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
        </div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Drag &amp; drop your resume here
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          or{" "}
          <span className="font-medium text-blue-600 dark:text-blue-400">
            browse files
          </span>
        </p>
        <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
          PDF up to 4 MB
        </p>
      </div>

      {error ? (
        <p id={errorId} className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
