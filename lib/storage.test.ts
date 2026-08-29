import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearHistory,
  deleteAnalysis,
  deriveJobTitle,
  loadHistory,
  MAX_HISTORY,
  parseHistory,
  saveAnalysis,
  STORAGE_KEY,
} from "./storage";
import type { AnalysisResult } from "@/types/analysis";

class MemoryStorage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  getItem(key: string) {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, String(value));
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  clear() {
    this.map.clear();
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null;
  }
}

const analysis: AnalysisResult = {
  overallScore: 82,
  skillsMatchScore: 78,
  experienceMatchScore: 88,
  educationMatchScore: 90,
  summary: "Strong match.",
  matchingSkills: ["Node.js"],
  missingSkills: ["Kafka"],
  experienceAnalysis: "Relevant experience.",
  resumeSuggestions: ["Add metrics."],
  interviewQuestions: ["Q1?", "Q2?", "Q3?", "Q4?", "Q5?"],
};

function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    id: crypto.randomUUID(),
    resumeName: "resume.pdf",
    jobTitle: "Senior Backend Developer",
    createdAt: new Date().toISOString(),
    analysis,
    ...overrides,
  };
}

beforeEach(() => {
  (globalThis as { localStorage?: unknown }).localStorage = new MemoryStorage();
});

afterEach(() => {
  delete (globalThis as { localStorage?: unknown }).localStorage;
});

describe("saveAnalysis / loadHistory", () => {
  it("saves an analysis and reads it back", () => {
    const saved = saveAnalysis({
      analysis,
      resumeName: "jordan.pdf",
      jobTitle: "Platform Engineer",
    });
    expect(saved).not.toBeNull();
    const history = loadHistory();
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe(saved!.id);
    expect(history[0].jobTitle).toBe("Platform Engineer");
    expect(history[0].analysis.overallScore).toBe(82);
  });

  it("returns newest first", () => {
    const a = saveAnalysis({ analysis, resumeName: "a.pdf", jobTitle: "A" });
    const b = saveAnalysis({ analysis, resumeName: "b.pdf", jobTitle: "B" });
    const history = loadHistory();
    expect(history.map((i) => i.id)).toEqual([b!.id, a!.id]);
  });

  it("falls back to defaults for blank metadata", () => {
    const saved = saveAnalysis({ analysis, resumeName: "  ", jobTitle: "" });
    expect(saved!.resumeName).toBe("resume.pdf");
    expect(saved!.jobTitle).toBe("Job Analysis");
  });

  it(`keeps at most ${MAX_HISTORY} records`, () => {
    for (let i = 0; i < MAX_HISTORY + 5; i++) {
      saveAnalysis({ analysis, resumeName: `r${i}.pdf`, jobTitle: `Job ${i}` });
    }
    const history = loadHistory();
    expect(history).toHaveLength(MAX_HISTORY);
    // The newest save wins the first slot.
    expect(history[0].jobTitle).toBe(`Job ${MAX_HISTORY + 4}`);
  });
});

describe("deleteAnalysis", () => {
  it("removes one item without touching the others", () => {
    const a = saveAnalysis({ analysis, resumeName: "a.pdf", jobTitle: "A" });
    const b = saveAnalysis({ analysis, resumeName: "b.pdf", jobTitle: "B" });
    const remaining = deleteAnalysis(a!.id);
    expect(remaining.map((i) => i.id)).toEqual([b!.id]);
    expect(loadHistory().map((i) => i.id)).toEqual([b!.id]);
  });

  it("clears the storage key when the last item is removed", () => {
    const a = saveAnalysis({ analysis, resumeName: "a.pdf", jobTitle: "A" });
    deleteAnalysis(a!.id);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe("clearHistory", () => {
  it("removes everything", () => {
    saveAnalysis({ analysis, resumeName: "a.pdf", jobTitle: "A" });
    clearHistory();
    expect(loadHistory()).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe("empty and corrupted storage", () => {
  it("returns [] when nothing is stored", () => {
    expect(loadHistory()).toEqual([]);
  });

  it("returns [] and clears the key on invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{ not json");
    expect(loadHistory()).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("ignores entries that don't match the schema", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([makeItem(), { id: "x", jobTitle: 5 }, "nope"]),
    );
    expect(loadHistory()).toHaveLength(1);
  });

  it("treats a non-array payload as empty", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: "bar" }));
    expect(loadHistory()).toEqual([]);
  });
});

describe("parseHistory (pure)", () => {
  it("handles null, garbage, and non-arrays", () => {
    expect(parseHistory(null)).toEqual([]);
    expect(parseHistory("not json")).toEqual([]);
    expect(parseHistory(JSON.stringify({ a: 1 }))).toEqual([]);
  });

  it("caps the array at the history limit", () => {
    const many = Array.from({ length: MAX_HISTORY + 10 }, () => makeItem());
    expect(parseHistory(JSON.stringify(many))).toHaveLength(MAX_HISTORY);
  });
});

describe("deriveJobTitle", () => {
  it("uses the first non-empty line when it is short", () => {
    expect(deriveJobTitle("\n  Senior Backend Developer  \n\nAbout us...")).toBe(
      "Senior Backend Developer",
    );
  });

  it("falls back for long or empty input", () => {
    expect(deriveJobTitle("")).toBe("Job Analysis");
    expect(deriveJobTitle("x".repeat(200))).toBe("Job Analysis");
  });
});
