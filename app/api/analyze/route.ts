import { NextResponse } from "next/server";
import { extractResumeText, PdfError } from "@/lib/pdf";
import { validateJobDescription, validateResumeFile } from "@/lib/validation";
import type { AnalyzeErrorCode, AnalyzeResponse } from "@/types/analyze";

// PDF parsing needs the Node.js runtime; never cache this handler.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(
  code: AnalyzeErrorCode,
  message: string,
  status: number,
): NextResponse<AnalyzeResponse> {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

/** Strips any path components and caps the length of a client-supplied filename. */
function safeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "resume.pdf";
  return base.slice(0, 200);
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

  try {
    // resumeFile is non-null here — validateResumeFile guarantees it.
    const bytes = new Uint8Array(await resumeFile!.arrayBuffer());
    const resumeText = await extractResumeText(bytes);

    const isProduction = process.env.NODE_ENV === "production";

    return NextResponse.json(
      {
        success: true,
        data: {
          resumeName: safeFileName(resumeFile!.name),
          resumeCharacterCount: resumeText.length,
          // Only surfaced outside production — see types/analyze.ts.
          ...(isProduction ? {} : { resumeText }),
        },
      },
      { status: 200 },
    );
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

    // Log a redacted marker only — never the resume contents or raw error.
    console.error("[api/analyze] unexpected failure while processing resume");
    return errorResponse(
      "SERVER_ERROR",
      "Something went wrong while processing your resume. Please try again.",
      500,
    );
  }
}
