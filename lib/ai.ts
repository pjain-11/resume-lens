import "server-only";

import { ApiError, GoogleGenAI } from "@google/genai";
import { analysisSchema, type ResumeAnalysis } from "@/types/analysis";

/**
 * LLM provider: Google Gemini via the official `@google/genai` SDK.
 * Isolated here so the model or provider can be swapped without touching the
 * API route. This module is server-only — it must never be imported by a
 * client component (`server-only` throws if it is).
 */

const MODEL = process.env.LLM_MODEL?.trim() || "gemini-3.6-flash";

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
interviewQuestions: exactly 5 specific questions grounded in the candidate's resume, the role, and the matching/missing skills. No generic HR questions.

Respond with ONLY a JSON object (no markdown, no code fences) with exactly these keys:
{
  "overallScore": integer 0-100,
  "skillsMatchScore": integer 0-100,
  "experienceMatchScore": integer 0-100,
  "educationMatchScore": integer 0-100,
  "summary": string,
  "matchingSkills": array of strings,
  "missingSkills": array of strings,
  "experienceAnalysis": string,
  "resumeSuggestions": array of strings,
  "interviewQuestions": array of exactly 5 strings
}`;

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

/** Removes a ```json … ``` fence if the model added one despite instructions. */
function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : trimmed;
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

  const ai = new GoogleGenAI({ apiKey });

  let rawText: string | undefined;
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: buildUserPrompt(resumeText, jobDescription),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.3,
        // Generous: Gemini 3.x reasoning tokens also count against this budget.
        maxOutputTokens: 8192,
      },
    });

    const blockReason = response.promptFeedback?.blockReason;
    if (blockReason) {
      throw new AiError("PROVIDER_ERROR", `Request blocked (${blockReason}).`);
    }

    rawText = response.text;
  } catch (error) {
    if (error instanceof AiError) throw error;
    if (error instanceof ApiError) {
      throw new AiError("PROVIDER_ERROR", `Provider request failed (${error.status}).`);
    }
    throw new AiError("PROVIDER_ERROR", "Provider request failed (network).");
  }

  if (!rawText || !rawText.trim()) {
    throw new AiError("INVALID_RESPONSE", "The model returned an empty response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(rawText));
  } catch {
    throw new AiError("INVALID_RESPONSE", "The model response was not valid JSON.");
  }

  // Never trust the model — validate explicitly.
  const result = analysisSchema.safeParse(parsed);
  if (!result.success) {
    throw new AiError(
      "INVALID_RESPONSE",
      "The model response did not match the expected schema.",
    );
  }

  return result.data;
}
