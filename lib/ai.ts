import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { analysisSchema, type ResumeAnalysis } from "@/types/analysis";

/**
 * LLM provider: Anthropic Claude via the official `@anthropic-ai/sdk`.
 * Isolated here so the model or provider can be swapped without touching the
 * API route. This module is server-only — it must never be imported by a
 * client component (`server-only` throws if it is).
 */

const MODEL = process.env.LLM_MODEL?.trim() || "claude-opus-5";

/** Cap on how much resume / job text we send, to bound cost and latency. */
const MAX_INPUT_CHARS = 20_000;

export type AiFailureReason =
  | "MISSING_KEY"
  | "PROVIDER_ERROR"
  | "INVALID_RESPONSE";

export class AiError extends Error {
  readonly reason: AiFailureReason;

  constructor(reason: AiFailureReason, message: string) {
    super(message);
    this.name = "AiError";
    this.reason = reason;
  }
}

const SYSTEM_PROMPT = `You are an expert technical recruiter and resume evaluator.

Follow these rules without exception:
1. Compare the resume against the job description.
2. Use ONLY information present in the supplied resume and job description.
3. Never invent experience.
4. Never invent skills.
5. Never invent education.
6. Never invent certifications.
7. Never invent companies.
8. Never assume technologies that are not mentioned.
9. Identify skills clearly supported by the resume.
10. Identify important job requirements that are missing or not clearly demonstrated.
11. Evaluate experience relevance.
12. Provide practical resume improvement suggestions.
13. Generate interview questions based on the actual candidate and role.
14. Be objective.
15. Do not discriminate based on protected characteristics (age, gender, race, religion, nationality, disability, etc.).
16. Return structured JSON only — no prose outside the schema.
17. Keep every field concise.

Scoring (0–100 integers):
- overallScore: overall suitability of the resume for this job.
- skillsMatchScore: overlap between skills explicitly in the resume and skills required by the job.
- experienceMatchScore: how well the candidate's experience matches the job's requirements.
- educationMatchScore: how the candidate's stated education compares to the job's education requirements. If the job description states no education requirement, do not invent one — score this reasonably (typically neutral-to-high) and explain the absence of a requirement in the summary.

matchingSkills: only skills clearly evidenced in BOTH the resume and the job description. Do not include skills merely common for the role.
missingSkills: only meaningful requirements from the job description not clearly demonstrated in the resume. Focus on important gaps, not every possible technology.
experienceAnalysis: one concise paragraph covering relevant experience, required experience, relevant responsibilities/projects, and important gaps. Never invent years of experience.
resumeSuggestions: practical suggestions grounded in the actual resume. Never suggest adding skills the candidate does not have.
interviewQuestions: exactly 5 specific questions grounded in the candidate's resume, the role, and the matching/missing skills. No generic HR questions.`;

function clamp(text: string): string {
  return text.length > MAX_INPUT_CHARS ? text.slice(0, MAX_INPUT_CHARS) : text;
}

function buildUserPrompt(resumeText: string, jobDescription: string): string {
  return [
    "=== RESUME ===",
    clamp(resumeText),
    "",
    "=== JOB DESCRIPTION ===",
    clamp(jobDescription),
    "",
    "Analyze how well this resume matches this job description and return the structured analysis.",
  ].join("\n");
}

/**
 * Sends the resume text and job description to the LLM and returns a
 * Zod-validated analysis. Throws {@link AiError} for any failure — the caller
 * is responsible for turning that into a user-facing message.
 */
export async function analyzeResume(
  resumeText: string,
  jobDescription: string,
): Promise<ResumeAnalysis> {
  const apiKey = process.env.LLM_API_KEY?.trim();
  if (!apiKey) {
    throw new AiError("MISSING_KEY", "LLM_API_KEY is not configured.");
  }

  const client = new Anthropic({ apiKey, maxRetries: 2 });

  let parsedOutput: unknown;
  try {
    const message = await client.messages.parse({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(resumeText, jobDescription) }],
      output_config: {
        effort: "low",
        format: zodOutputFormat(analysisSchema),
      },
    });
    parsedOutput = message.parsed_output;
  } catch (error) {
    // The zod helper throws AnthropicError (a plain Error subclass, not an
    // APIError) when the model's JSON fails to parse or validate.
    if (
      error instanceof Anthropic.APIError ||
      error instanceof Anthropic.APIConnectionError
    ) {
      throw new AiError(
        "PROVIDER_ERROR",
        `Provider request failed (${
          error instanceof Anthropic.APIError && error.status ? error.status : "network"
        }).`,
      );
    }
    throw new AiError("INVALID_RESPONSE", "The model returned an unusable response.");
  }

  // Never trust the model — validate again explicitly.
  const result = analysisSchema.safeParse(parsedOutput);
  if (!result.success) {
    throw new AiError(
      "INVALID_RESPONSE",
      "The model response did not match the expected schema.",
    );
  }

  return result.data;
}
