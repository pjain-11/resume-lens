import { describe, expect, it } from "vitest";
import { analysisSchema } from "./analysis";

const validAnalysis = {
  overallScore: 82,
  skillsMatchScore: 78,
  experienceMatchScore: 88,
  educationMatchScore: 90,
  summary: "Strong overall match with minor gaps in streaming infrastructure.",
  matchingSkills: ["Node.js", "TypeScript", "PostgreSQL"],
  missingSkills: ["Kafka", "Kubernetes"],
  experienceAnalysis: "Six years of relevant backend experience across two companies.",
  resumeSuggestions: [
    "Quantify the latency improvements you mention.",
    "Surface your cloud deployment experience earlier.",
  ],
  interviewQuestions: [
    "How did you design the billing microservices?",
    "How have you handled database performance at scale?",
    "How would you introduce Kafka into this architecture?",
    "Describe a production incident you resolved.",
    "How would you scale the notifications service further?",
  ],
};

describe("analysisSchema", () => {
  it("accepts a well-formed analysis", () => {
    expect(analysisSchema.safeParse(validAnalysis).success).toBe(true);
  });

  it("rejects a score above 100", () => {
    const result = analysisSchema.safeParse({ ...validAnalysis, overallScore: 140 });
    expect(result.success).toBe(false);
  });

  it("rejects a negative score", () => {
    expect(
      analysisSchema.safeParse({ ...validAnalysis, skillsMatchScore: -5 }).success,
    ).toBe(false);
  });

  it("rejects a non-integer score", () => {
    expect(
      analysisSchema.safeParse({ ...validAnalysis, experienceMatchScore: 87.5 }).success,
    ).toBe(false);
  });

  it("rejects a missing summary", () => {
    const { summary: _omitted, ...withoutSummary } = validAnalysis;
    void _omitted;
    expect(analysisSchema.safeParse(withoutSummary).success).toBe(false);
  });

  it("rejects fewer than 5 interview questions", () => {
    expect(
      analysisSchema.safeParse({
        ...validAnalysis,
        interviewQuestions: validAnalysis.interviewQuestions.slice(0, 4),
      }).success,
    ).toBe(false);
  });

  it("rejects more than 5 interview questions", () => {
    expect(
      analysisSchema.safeParse({
        ...validAnalysis,
        interviewQuestions: [...validAnalysis.interviewQuestions, "One more?"],
      }).success,
    ).toBe(false);
  });
});
