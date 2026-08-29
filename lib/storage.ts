import {
  analysisHistoryItemSchema,
  type AnalysisHistoryItem,
  type AnalysisResult,
} from "@/types/analysis";

/**
 * Analysis history persisted in the browser's `localStorage`.
 *
 * This is browser-local only — it is NOT secure storage and never leaves the
 * user's device. Never put API keys, tokens, or server secrets here.
 */

export const STORAGE_KEY = "resumeLensAnalyses";
export const MAX_HISTORY = 20;

function getStore(): Storage | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage : null;
  } catch {
    // Access to localStorage can throw (e.g. privacy settings).
    return null;
  }
}

function newId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Pure: turn a raw stored string into a clean, newest-first history array.
 * Any corruption (missing, non-JSON, wrong shape, bad item) is treated as
 * empty rather than surfaced as an error.
 */
export function parseHistory(raw: string | null): AnalysisHistoryItem[] {
  if (!raw) return [];

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const items: AnalysisHistoryItem[] = [];
  for (const entry of data) {
    const parsed = analysisHistoryItemSchema.safeParse(entry);
    if (parsed.success) items.push(parsed.data);
  }
  return items.slice(0, MAX_HISTORY);
}

function write(store: Storage, items: AnalysisHistoryItem[]): void {
  try {
    if (items.length === 0) {
      store.removeItem(STORAGE_KEY);
    } else {
      store.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  } catch {
    /* storage full or unavailable — nothing we can safely do */
  }
  notify();
}

// --- Reactive layer for `useSyncExternalStore` ---------------------------------

// Stable reference so `useSyncExternalStore` doesn't loop on the server snapshot.
const EMPTY_HISTORY: AnalysisHistoryItem[] = [];
const listeners = new Set<() => void>();
let snapshot: AnalysisHistoryItem[] | null = null;

function notify(): void {
  snapshot = null; // invalidate the cached snapshot
  for (const listener of listeners) listener();
}

function handleStorageEvent(event: StorageEvent): void {
  if (event.key === STORAGE_KEY || event.key === null) notify();
}

/** Subscribe to history changes (this tab's writes + other tabs). */
export function subscribeHistory(listener: () => void): () => void {
  if (listeners.size === 0 && typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageEvent);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
}

/** Cached snapshot for `useSyncExternalStore` — stable between writes. */
export function getHistorySnapshot(): AnalysisHistoryItem[] {
  if (snapshot === null) snapshot = loadHistory();
  return snapshot;
}

/** Server render has no history. */
export function getHistoryServerSnapshot(): AnalysisHistoryItem[] {
  return EMPTY_HISTORY;
}

/** Reads and sanitises the saved history. Returns `[]` when unavailable. */
export function loadHistory(): AnalysisHistoryItem[] {
  const store = getStore();
  if (!store) return [];

  let raw: string | null;
  try {
    raw = store.getItem(STORAGE_KEY);
  } catch {
    return [];
  }
  if (raw === null) return [];

  const items = parseHistory(raw);

  // Self-heal: drop a corrupted value so it doesn't linger.
  let looksValid = false;
  try {
    looksValid = Array.isArray(JSON.parse(raw));
  } catch {
    looksValid = false;
  }
  if (!looksValid && items.length === 0) {
    try {
      store.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  return items;
}

/** Saves a new analysis at the front of the history, capped at {@link MAX_HISTORY}. */
export function saveAnalysis(input: {
  analysis: AnalysisResult;
  resumeName: string;
  jobTitle: string;
}): AnalysisHistoryItem | null {
  const store = getStore();
  if (!store) return null;

  const item: AnalysisHistoryItem = {
    id: newId(),
    resumeName: input.resumeName.trim() || "resume.pdf",
    jobTitle: input.jobTitle.trim() || "Job Analysis",
    createdAt: new Date().toISOString(),
    analysis: input.analysis,
  };

  const next = [item, ...loadHistory()].slice(0, MAX_HISTORY);
  write(store, next);
  return item;
}

/** Removes one analysis by id and returns the updated history. */
export function deleteAnalysis(id: string): AnalysisHistoryItem[] {
  const store = getStore();
  if (!store) return [];

  const next = loadHistory().filter((item) => item.id !== id);
  write(store, next);
  return next;
}

/** Removes the entire history. */
export function clearHistory(): void {
  const store = getStore();
  if (!store) {
    notify();
    return;
  }
  try {
    store.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  notify();
}

/** Returns a single saved analysis by id, or `null`. */
export function getAnalysis(id: string): AnalysisHistoryItem | null {
  return loadHistory().find((item) => item.id === id) ?? null;
}

/**
 * Best-effort job title: the first non-empty line of the job description if it
 * is short enough to be a heading, otherwise a generic label. Deliberately not
 * sophisticated.
 */
export function deriveJobTitle(jobDescription: string): string {
  const firstLine = jobDescription
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  if (firstLine && firstLine.length <= 100) return firstLine;
  return "Job Analysis";
}
