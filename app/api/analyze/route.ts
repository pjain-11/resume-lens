import { NextResponse } from "next/server";
import { analyzeResume, AiError } from "@/lib/ai";
import { extractResumeText, PdfError } from "@/lib/pdf";
import { validateJobDescription, validateResumeFile } from "@/lib/validation";
import type { AnalyzeErrorCode, AnalyzeResponse } from "@/types/analyze";

// PDF parsing + the LLM call need the Node.js runtime; never cache this handler.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function errorResponse(
  code: AnalyzeErrorCode,
  message: string,
  status: number,
): NextResponse<AnalyzeResponse> {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export async function POST(request: Request): Promise<NextResponse<AnalyzeResponse>> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("INVALID_FILE", "Could not read the uploaded form data.", 400);
  }

  const resumeEntry = formData.get("resume");
  const jobDescriptionEntry = formData.get("jobDescription");

  const resumeFile = resumeEntry instanceof File ? resumeEntry : null;
  const jobDescription =
    typeof jobDescriptionEntry === "string" ? jobDescriptionEntry : null;

  const resumeError = validateResumeFile(resumeFile);
  if (resumeError) {
    const status = resumeError.code === "FILE_TOO_LARGE" ? 413 : 400;
    return errorResponse(resumeError.code, resumeError.message, status);
  }

  const jobDescriptionError = validateJobDescription(jobDescription);
  if (jobDescriptionError) {
    return errorResponse(jobDescriptionError.code, jobDescriptionError.message, 400);
  }

  // 1. Extract resume text from the PDF.
  let resumeText: string;
  try {
    // resumeFile / jobDescription are non-null here — the validators guarantee it.
    const bytes = new Uint8Array(await resumeFile!.arrayBuffer());
    resumeText = await extractResumeText(bytes);
  } catch (error) {
    if (error instanceof PdfError) {
      if (error.code === "INVALID_FILE") {
        return errorResponse("INVALID_FILE", "Please upload a valid PDF resume.", 400);
      }
      if (error.code === "EMPTY_RESUME") {
        return errorResponse(
          "EMPTY_RESUME",
          "Unable to extract readable text from this PDF. Scanned or image-only resumes aren't supported yet.",
          422,
        );
      }
      return errorResponse(
        "EXTRACTION_FAILED",
        "We couldn't read this PDF. Try re-exporting it and uploading again.",
        422,
      );
    }
    console.error("[api/analyze] unexpected failure during PDF extraction");
    return errorResponse(
      "SERVER_ERROR",
      "Something went wrong while processing your resume. Please try again.",
      500,
    );
  }

  // 2. Send resume text + job description to the LLM and validate the result.
  try {
    const analysis = await analyzeResume(resumeText, jobDescription!);
    return NextResponse.json({ success: true, data: analysis }, { status: 200 });
  } catch (error) {
    if (error instanceof AiError) {
      // Safe technical marker only — no resume text, no keys, no raw provider payload.
      console.error(`[api/analyze] AI analysis failed: ${error.reason}`);
      return errorResponse(
        "ANALYSIS_FAILED",
        "AI analysis is temporarily unavailable. Please try again.",
        503,
      );
    }
    console.error("[api/analyze] unexpected failure during AI analysis");
    return errorResponse(
      "SERVER_ERROR",
      "Something went wrong while analyzing your resume. Please try again.",
      500,
    );
  }
}
