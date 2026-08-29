import { describe, expect, it } from "vitest";
import { makePdf } from "./makePdf";
import { POST } from "@/app/api/analyze/route";
import type { AnalyzeResponse } from "@/types/analyze";

const VALID_JD =
  "We are hiring a senior backend engineer to design and operate resilient services. ".repeat(
    3,
  );

function request(
  parts: { resume?: Blob | null; resumeName?: string; jobDescription?: string | null },
): Request {
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

describe("POST /api/analyze", () => {
  it("rejects a missing resume", async () => {
    const { status, body } = await post(request({ jobDescription: VALID_JD }));
    expect(status).toBe(400);
    expect(body).toMatchObject({ success: false, error: { code: "MISSING_RESUME" } });
  });

  it("rejects a missing job description", async () => {
    const { status, body } = await post(
      request({ resume: new Blob([makePdf("Resume text here plenty of it")]) }),
    );
    expect(status).toBe(400);
    expect(body).toMatchObject({
      success: false,
      error: { code: "MISSING_JOB_DESCRIPTION" },
    });
  });

  it("rejects a too-short job description", async () => {
    const { status, body } = await post(
      request({
        resume: new Blob([makePdf("Resume text here plenty of it")]),
        jobDescription: "too short",
      }),
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

  it("rejects an image-only / empty PDF", async () => {
    const { status, body } = await post(
      request({ resume: new Blob([makePdf("")]), jobDescription: VALID_JD }),
    );
    expect(status).toBe(422);
    expect(body).toMatchObject({ success: false, error: { code: "EMPTY_RESUME" } });
  });

  it("extracts text from a valid submission", async () => {
    const { status, body } = await post(
      request({
        resume: new Blob([makePdf("Alex Kim Principal Engineer distributed systems")]),
        jobDescription: VALID_JD,
      }),
    );
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    if (body.success) {
      expect(body.data.resumeName).toBe("resume.pdf");
      expect(body.data.resumeCharacterCount).toBeGreaterThan(0);
      expect(body.data.resumeText).toContain("Alex Kim");
    }
  });
});
