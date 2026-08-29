/**
 * Shared contract for the `POST /api/analyze` route.
 *
 * This checkpoint only performs PDF text extraction — no AI analysis yet.
 */

export type AnalyzeErrorCode =
  | "MISSING_RESUME"
  | "MISSING_JOB_DESCRIPTION"
  | "INVALID_FILE"
  | "FILE_TOO_LARGE"
  | "JOB_DESCRIPTION_TOO_SHORT"
  | "JOB_DESCRIPTION_TOO_LONG"
  | "EMPTY_RESUME"
  | "EXTRACTION_FAILED"
  | "SERVER_ERROR";

export type ResumeExtractionResult = {
  resumeName: string;
  /**
   * The extracted resume text. Only returned outside production — it is a
   * temporary aid for verifying extraction in this checkpoint and will be
   * replaced by AI analysis output next.
   */
  resumeText?: string;
  resumeCharacterCount: number;
};

export type AnalyzeSuccessResponse = {
  success: true;
  data: ResumeExtractionResult;
};

export type AnalyzeErrorResponse = {
  success: false;
  error: {
    code: AnalyzeErrorCode;
    message: string;
  };
};

export type AnalyzeResponse = AnalyzeSuccessResponse | AnalyzeErrorResponse;
