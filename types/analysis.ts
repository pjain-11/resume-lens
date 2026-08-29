import { z } from "zod";

/**
 * Structure of a resume/job-description match analysis.
 *
 * The LLM is asked to return exactly this shape; the response is always
 * re-validated with {@link analysisSchema} before it reaches the client.
 */
export const analysisSchema = z.object({
  /** Overall suitability of the resume for the job, 0–100. */
  overallScore: z.number().int().min(0).max(100),
  /** How well the resume's explicit skills match the job's, 0–100. */
  skillsMatchScore: z.number().int().min(0).max(100),
  /** How well the candidate's experience matches the job requirements, 0–100. */
  experienceMatchScore: z.number().int().min(0).max(100),
  /** How well the candidate's stated education matches the job, 0–100. */
  educationMatchScore: z.number().int().min(0).max(100),
  /** Short recruiter-style summary of the match. */
  summary: z.string().min(1),
  /** Skills clearly supported by BOTH the resume and the job description. */
  matchingSkills: z.array(z.string()),
  /** Important job requirements not clearly demonstrated in the resume. */
  missingSkills: z.array(z.string()),
  /** Concise paragraph on experience relevance and gaps. */
  experienceAnalysis: z.string().min(1),
  /** Practical, resume-specific improvement suggestions. */
  resumeSuggestions: z.array(z.string()),
  /** Exactly five interview questions tailored to the candidate and role. */
  interviewQuestions: z.array(z.string()).length(5),
});

export type ResumeAnalysis = z.infer<typeof analysisSchema>;

/** Alias used by the history feature. */
export type AnalysisResult = ResumeAnalysis;

/**
 * One saved analysis in the browser-local history (`localStorage`).
 * The schema is used to validate anything read back from storage.
 */
export const analysisHistoryItemSchema = z.object({
  id: z.string().min(1),
  resumeName: z.string().min(1),
  jobTitle: z.string().min(1),
  /** ISO timestamp of when the analysis was saved. */
  createdAt: z.string().min(1),
  analysis: analysisSchema,
});

export type AnalysisHistoryItem = z.infer<typeof analysisHistoryItemSchema>;
