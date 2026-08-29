import { describe, expect, it, vi } from "vitest";
import { makePdf } from "./makePdf";
import type { AnalyzeResponse } from "@/types/analyze";

const { analyzeResumeMock } = vi.hoisted(() => ({ analyzeResumeMock: vi.fn() }));

// Never call the real LLM from automated tests.
vi.mock("@/lib/ai", () => {
  class AiError extends Error {
    reason: string;
    constructor(reason: string, message: string) {
      super(message);
      this.name = "AiError";
      this.reason = reason;
    }
  }
  return { analyzeResume: analyzeResumeMock, AiError };
});

const { POST } = await import("@/app/api/analyze/route");
const { AiError } = await import("@/lib/ai");

const VALID_JD =
  "We are hiring a senior backend engineer to design and operate resilient services. ".repeat(
    3,
  );

const VALID_ANALYSIS = {
  overallScore: 80,
  skillsMatchScore: 75,
  experienceMatchScore: 82,
  educationMatchScore: 88,
  summary: "Solid match.",
  matchingSkills: ["Node.js"],
  missingSkills: ["Kafka"],
  experienceAnalysis: "Relevant backend experience.",
  resumeSuggestions: ["Add metrics."],
  interviewQuestions: ["Q1?", "Q2?", "Q3?", "Q4?", "Q5?"],
};

function request(parts: {
  resume?: Blob | null;
  resumeName?: string;
  jobDescription?: string | null;
}): Request {
  const form = new FormData();
  if (parts.resume) {
    form.append(
      "resume",
      new File([parts.resume], parts.resumeName ?? "resume.pdf", {
        type: "application/pdf",
      }),
    );
  }
  if (parts.jobDescription != null) {
    form.append("jobDescription", parts.jobDescription);
  }
  return new Request("http://localhost/api/analyze", { method: "POST", body: form });
}

async function post(req: Request) {
  const res = await POST(req);
  return { status: res.status, body: (await res.json()) as AnalyzeResponse };
}

const resumePdf = () =>
  new Blob([makePdf("Alex Kim Principal Engineer distributed systems backend")]);

describe("POST /api/analyze", () => {
  it("rejects a missing resume", async () => {
    analyzeResumeMock.mockReset();
    const { status, body } = await post(request({ jobDescription: VALID_JD }));
    expect(status).toBe(400);
    expect(body).toMatchObject({ success: false, error: { code: "MISSING_RESUME" } });
    expect(analyzeResumeMock).not.toHaveBeenCalled();
  });

  it("rejects a missing job description", async () => {
    analyzeResumeMock.mockReset();
    const { status, body } = await post(request({ resume: resumePdf() }));
    expect(status).toBe(400);
    expect(body).toMatchObject({
      success: false,
      error: { code: "MISSING_JOB_DESCRIPTION" },
    });
    expect(analyzeResumeMock).not.toHaveBeenCalled();
  });

  it("rejects a too-short job description", async () => {
    const { status, body } = await post(
      request({ resume: resumePdf(), jobDescription: "too short" }),
    );
    expect(status).toBe(400);
    expect(body).toMatchObject({
      success: false,
      error: { code: "JOB_DESCRIPTION_TOO_SHORT" },
    });
  });

  it("rejects a non-PDF resume", async () => {
    const { status, body } = await post(
      request({
        resume: new Blob(["just text"]),
        resumeName: "resume.txt",
        jobDescription: VALID_JD,
      }),
    );
    expect(status).toBe(400);
    expect(body).toMatchObject({ success: false, error: { code: "INVALID_FILE" } });
  });

  it("rejects an image-only / empty PDF before calling the LLM", async () => {
    analyzeResumeMock.mockReset();
    const { status, body } = await post(
      request({ resume: new Blob([makePdf("")]), jobDescription: VALID_JD }),
    );
    expect(status).toBe(422);
    expect(body).toMatchObject({ success: false, error: { code: "EMPTY_RESUME" } });
    expect(analyzeResumeMock).not.toHaveBeenCalled();
  });

  it("returns the validated analysis on success", async () => {
    analyzeResumeMock.mockReset();
    analyzeResumeMock.mockResolvedValue(VALID_ANALYSIS);
    const { status, body } = await post(
      request({ resume: resumePdf(), jobDescription: VALID_JD }),
    );
    expect(status).toBe(200);
    expect(body).toEqual({ success: true, data: VALID_ANALYSIS });
    expect(analyzeResumeMock).toHaveBeenCalledOnce();
  });

  it("returns ANALYSIS_FAILED when the LLM step fails", async () => {
    analyzeResumeMock.mockReset();
    analyzeResumeMock.mockRejectedValue(new AiError("PROVIDER_ERROR", "boom"));
    const { status, body } = await post(
      request({ resume: resumePdf(), jobDescription: VALID_JD }),
    );
    expect(status).toBe(503);
    expect(body).toMatchObject({
      success: false,
      error: { code: "ANALYSIS_FAILED" },
    });
  });
});
