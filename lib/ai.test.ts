import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { generateContentMock } = vi.hoisted(() => ({ generateContentMock: vi.fn() }));

vi.mock("@google/genai", () => {
  class ApiError extends Error {
    status: number;
    constructor(message?: string, status?: number) {
      super(message);
      this.status = status ?? 500;
    }
  }
  class GoogleGenAI {
    models = { generateContent: generateContentMock };
  }
  return { GoogleGenAI, ApiError };
});

// Imported after the mock is registered.
const { analyzeResume, AiError } = await import("./ai");
const { ApiError } = await import("@google/genai");

const validAnalysis = {
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

const ok = (text: string) => ({ text });

describe("analyzeResume", () => {
  beforeEach(() => {
    generateContentMock.mockReset();
    process.env.LLM_API_KEY = "test-key";
  });

  afterEach(() => {
    delete process.env.LLM_API_KEY;
  });

  it("returns the validated analysis on a well-formed response", async () => {
    generateContentMock.mockResolvedValue(ok(JSON.stringify(validAnalysis)));
    const result = await analyzeResume("resume text", "job description");
    expect(result).toEqual(validAnalysis);
    expect(generateContentMock).toHaveBeenCalledOnce();
  });

  it("tolerates a ```json code fence around the JSON", async () => {
    generateContentMock.mockResolvedValue(
      ok("```json\n" + JSON.stringify(validAnalysis) + "\n```"),
    );
    await expect(analyzeResume("r", "j")).resolves.toEqual(validAnalysis);
  });

  it("throws MISSING_KEY when no API key is configured", async () => {
    delete process.env.LLM_API_KEY;
    await expect(analyzeResume("r", "j")).rejects.toMatchObject({
      name: "AiError",
      reason: "MISSING_KEY",
    });
    expect(generateContentMock).not.toHaveBeenCalled();
  });

  it("throws INVALID_RESPONSE when the model output fails schema validation", async () => {
    generateContentMock.mockResolvedValue(
      ok(JSON.stringify({ ...validAnalysis, overallScore: 250 })),
    );
    await expect(analyzeResume("r", "j")).rejects.toMatchObject({
      reason: "INVALID_RESPONSE",
    });
  });

  it("throws INVALID_RESPONSE when the model returns non-JSON", async () => {
    generateContentMock.mockResolvedValue(ok("I could not analyze this."));
    await expect(analyzeResume("r", "j")).rejects.toBeInstanceOf(AiError);
  });

  it("throws INVALID_RESPONSE when the model returns an empty response", async () => {
    generateContentMock.mockResolvedValue({ text: undefined });
    await expect(analyzeResume("r", "j")).rejects.toMatchObject({
      reason: "INVALID_RESPONSE",
    });
  });

  it("maps a blocked prompt to PROVIDER_ERROR", async () => {
    generateContentMock.mockResolvedValue({ promptFeedback: { blockReason: "SAFETY" } });
    await expect(analyzeResume("r", "j")).rejects.toMatchObject({
      reason: "PROVIDER_ERROR",
    });
  });

  it("maps provider API errors to PROVIDER_ERROR", async () => {
    generateContentMock.mockRejectedValue(new ApiError("rate limited", 429));
    await expect(analyzeResume("r", "j")).rejects.toMatchObject({
      reason: "PROVIDER_ERROR",
    });
  });
});
