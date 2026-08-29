/**
 * Shared contract for the `POST /api/analyze` route.
 *
 * The route extracts the resume text from the uploaded PDF, sends it plus the
 * job description to the LLM, and returns a Zod-validated {@link ResumeAnalysis}.
 */

import type { ResumeAnalysis } from "./analysis";

export type AnalyzeErrorCode =
  | "MISSING_RESUME"
  | "MISSING_JOB_DESCRIPTION"
  | "INVALID_FILE"
  | "FILE_TOO_LARGE"
  | "JOB_DESCRIPTION_TOO_SHORT"
  | "JOB_DESCRIPTION_TOO_LONG"
  | "EMPTY_RESUME"
  | "EXTRACTION_FAILED"
  | "ANALYSIS_FAILED"
  | "SERVER_ERROR";

export type AnalyzeSuccessResponse = {
  success: true;
  data: ResumeAnalysis;
};

export type AnalyzeErrorResponse = {
  success: false;
  error: {
    code: AnalyzeErrorCode;
    message: string;
  };
};

export type AnalyzeResponse = AnalyzeSuccessResponse | AnalyzeErrorResponse;
