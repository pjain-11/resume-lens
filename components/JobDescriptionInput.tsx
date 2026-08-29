"use client";

import { useId, useState } from "react";

const MAX_CHARS = 10000;

/**
 * UI-only job description field with a live character counter. No validation
 * is enforced yet — that arrives in a later checkpoint.
 */
export function JobDescriptionInput() {
  const id = useId();
  const [value, setValue] = useState("");

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
        onChange={(e) => setValue(e.target.value)}
        rows={12}
        maxLength={MAX_CHARS}
        placeholder="Paste the job description here..."
        className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
      />
      <div className="mt-2 flex justify-end">
        <span
          className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400"
          aria-live="polite"
        >
          {value.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
        </span>
      </div>
    </div>
  );
}
