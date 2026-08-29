import { describe, expect, it } from "vitest";
import {
  JOB_DESCRIPTION_MAX_LENGTH,
  JOB_DESCRIPTION_MIN_LENGTH,
  MAX_RESUME_BYTES,
  validateJobDescription,
  validateResumeFile,
} from "./validation";

const pdf = (over: Partial<{ name: string; type: string; size: number }> = {}) => ({
  name: "resume.pdf",
  type: "application/pdf",
  size: 120_000,
  ...over,
});

describe("validateResumeFile", () => {
  it("rejects a missing file", () => {
    expect(validateResumeFile(null)?.code).toBe("MISSING_RESUME");
  });

  it("rejects an empty file", () => {
    expect(validateResumeFile(pdf({ size: 0 }))?.code).toBe("MISSING_RESUME");
  });

  it("rejects a non-PDF file", () => {
    expect(
      validateResumeFile({ name: "resume.docx", type: "application/msword", size: 5_000 })?.code,
    ).toBe("INVALID_FILE");
  });

  it("rejects a PDF extension with a mismatched MIME type", () => {
    expect(validateResumeFile(pdf({ type: "image/png" }))?.code).toBe("INVALID_FILE");
  });

  it("rejects a file larger than 4 MB", () => {
    expect(validateResumeFile(pdf({ size: MAX_RESUME_BYTES + 1 }))?.code).toBe(
      "FILE_TOO_LARGE",
    );
  });

  it("accepts a valid PDF", () => {
    expect(validateResumeFile(pdf())).toBeNull();
  });

  it("accepts a PDF with an empty browser-reported MIME type", () => {
    expect(validateResumeFile(pdf({ type: "" }))).toBeNull();
  });
});

describe("validateJobDescription", () => {
  it("rejects an empty value", () => {
    expect(validateJobDescription("")?.code).toBe("MISSING_JOB_DESCRIPTION");
    expect(validateJobDescription("   ")?.code).toBe("MISSING_JOB_DESCRIPTION");
  });

  it("rejects text below the minimum length", () => {
    expect(validateJobDescription("a".repeat(JOB_DESCRIPTION_MIN_LENGTH - 1))?.code).toBe(
      "JOB_DESCRIPTION_TOO_SHORT",
    );
  });

  it("rejects text above the maximum length", () => {
    expect(validateJobDescription("a".repeat(JOB_DESCRIPTION_MAX_LENGTH + 1))?.code).toBe(
      "JOB_DESCRIPTION_TOO_LONG",
    );
  });

  it("accepts text within range", () => {
    expect(validateJobDescription("a".repeat(JOB_DESCRIPTION_MIN_LENGTH))).toBeNull();
    expect(validateJobDescription("a".repeat(JOB_DESCRIPTION_MAX_LENGTH))).toBeNull();
  });
});
