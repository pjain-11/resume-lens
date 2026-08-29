"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * UI-only resume uploader. Drag/drop and file selection are visually wired up
 * but no file is read or processed — that arrives in a later checkpoint.
 */
export function ResumeUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload resume. Drag and drop a PDF file here or press Enter to browse files."
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",
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
          PDF up to 5 MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={() => {
          /* File handling arrives in a later checkpoint. */
        }}
      />
    </div>
  );
}
