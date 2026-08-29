import type { AnalyzeErrorCode } from "@/types/analyze";

export const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB
export const JOB_DESCRIPTION_MIN_LENGTH = 100;
export const JOB_DESCRIPTION_MAX_LENGTH = 20_000;

/** The only file type we accept for resumes. */
export const RESUME_MIME_TYPE = "application/pdf";
export const RESUME_EXTENSION = ".pdf";

export type FieldError = {
  code: AnalyzeErrorCode;
  message: string;
};

/** Structural subset of `File` — keeps this module usable on client and server. */
export type FileLike = {
  name: string;
  type: string;
  size: number;
};

/**
 * Validates an uploaded resume file. Checks presence, type (MIME + extension)
 * and size. The byte-level `%PDF` signature is checked separately during
 * extraction so we never trust the client-reported MIME type alone.
 */
export function validateResumeFile(file: FileLike | null | undefined): FieldError | null {
  if (!file || file.size === 0) {
    return {
      code: "MISSING_RESUME",
      message: "Please attach your resume as a PDF file.",
    };
  }

  const hasPdfExtension = file.name.toLowerCase().endsWith(RESUME_EXTENSION);
  // Some browsers/proxies send an empty type; the signature check backs this up.
  const hasPdfMime = file.type === RESUME_MIME_TYPE || file.type === "";

  if (!hasPdfExtension || !hasPdfMime) {
    return {
      code: "INVALID_FILE",
      message: "Please upload a valid PDF resume.",
    };
  }

  if (file.size > MAX_RESUME_BYTES) {
    return {
      code: "FILE_TOO_LARGE",
      message: "Resume file must be smaller than 5 MB.",
    };
  }

  return null;
}

/**
 * Validates the job description text. Required, and between
 * {@link JOB_DESCRIPTION_MIN_LENGTH} and {@link JOB_DESCRIPTION_MAX_LENGTH}
 * characters after trimming.
 */
export function validateJobDescription(value: string | null | undefined): FieldError | null {
  const text = (value ?? "").trim();

  if (text.length === 0) {
    return {
      code: "MISSING_JOB_DESCRIPTION",
      message: "Please paste the job description you're targeting.",
    };
  }

  if (text.length < JOB_DESCRIPTION_MIN_LENGTH) {
    return {
      code: "JOB_DESCRIPTION_TOO_SHORT",
      message: `Job description must be at least ${JOB_DESCRIPTION_MIN_LENGTH} characters.`,
    };
  }

  if (text.length > JOB_DESCRIPTION_MAX_LENGTH) {
    return {
      code: "JOB_DESCRIPTION_TOO_LONG",
      message: `Job description must be under ${JOB_DESCRIPTION_MAX_LENGTH.toLocaleString()} characters.`,
    };
  }

  return null;
}
