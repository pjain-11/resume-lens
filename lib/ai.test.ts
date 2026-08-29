import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { parseMock } = vi.hoisted(() => ({ parseMock: vi.fn() }));

vi.mock("@anthropic-ai/sdk", () => {
  class APIError extends Error {
    status: number | undefined;
    constructor(message?: string, status?: number) {
      super(message);
      this.status = status;
    }
  }
  class APIConnectionError extends Error {}
  class MockAnthropic {
    messages = { parse: parseMock };
    static APIError = APIError;
    static APIConnectionError = APIConnectionError;
  }
  return { default: MockAnthropic };
});

// Imported after the mock is registered.
const { analyzeResume, AiError } = await import("./ai");
const Anthropic = (await import("@anthropic-ai/sdk")).default;

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

describe("analyzeResume", () => {
  beforeEach(() => {
    parseMock.mockReset();
    process.env.LLM_API_KEY = "test-key";
  });

  afterEach(() => {
    delete process.env.LLM_API_KEY;
  });

  it("returns the validated analysis on a well-formed response", async () => {
    parseMock.mockResolvedValue({ parsed_output: validAnalysis });
    const result = await analyzeResume("resume text", "job description");
    expect(result).toEqual(validAnalysis);
    expect(parseMock).toHaveBeenCalledOnce();
  });

  it("throws MISSING_KEY when no API key is configured", async () => {
    delete process.env.LLM_API_KEY;
    await expect(analyzeResume("r", "j")).rejects.toMatchObject({
      name: "AiError",
      reason: "MISSING_KEY",
    });
    expect(parseMock).not.toHaveBeenCalled();
  });

  it("throws INVALID_RESPONSE when the model output fails schema validation", async () => {
    parseMock.mockResolvedValue({
      parsed_output: { ...validAnalysis, overallScore: 250 },
    });
    await expect(analyzeResume("r", "j")).rejects.toMatchObject({
      reason: "INVALID_RESPONSE",
    });
  });

  it("throws INVALID_RESPONSE when the model returns nothing parseable", async () => {
    parseMock.mockResolvedValue({ parsed_output: null });
    await expect(analyzeResume("r", "j")).rejects.toBeInstanceOf(AiError);
  });

  it("maps provider API errors to PROVIDER_ERROR", async () => {
    parseMock.mockRejectedValue(new Anthropic.APIError("rate limited", 429));
    await expect(analyzeResume("r", "j")).rejects.toMatchObject({
      reason: "PROVIDER_ERROR",
    });
  });
});
