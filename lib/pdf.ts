import { extractText, getDocumentProxy } from "unpdf";

const PDF_SIGNATURE = "%PDF-";

/** Minimum number of non-whitespace characters for a PDF to count as readable. */
const MIN_MEANINGFUL_CHARS = 30;

export type PdfErrorCode = "INVALID_FILE" | "EXTRACTION_FAILED" | "EMPTY_RESUME";

export class PdfError extends Error {
  readonly code: PdfErrorCode;

  constructor(code: PdfErrorCode, message: string) {
    super(message);
    this.name = "PdfError";
    this.code = code;
  }
}

/** Checks the leading bytes for the `%PDF-` file signature. */
export function looksLikePdf(bytes: Uint8Array): boolean {
  if (bytes.byteLength < PDF_SIGNATURE.length) return false;
  const header = new TextDecoder("latin1").decode(bytes.subarray(0, PDF_SIGNATURE.length));
  return header === PDF_SIGNATURE;
}

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ *\n */g, "\n")
    .trim();
}

function countMeaningfulChars(text: string): number {
  return text.replace(/\s+/g, "").length;
}

/**
 * Extracts text from a PDF in memory. Throws {@link PdfError} for files that
 * are not PDFs, fail to parse, or contain no readable text (e.g. scanned
 * image-only resumes — OCR is out of scope for this checkpoint).
 */
export async function extractResumeText(bytes: Uint8Array): Promise<string> {
  if (!looksLikePdf(bytes)) {
    throw new PdfError("INVALID_FILE", "Uploaded file is not a PDF.");
  }

  let rawText: string;
  try {
    const pdf = await getDocumentProxy(bytes);
    const { text } = await extractText(pdf, { mergePages: true });
    rawText = Array.isArray(text) ? text.join("\n") : text;
  } catch {
    // Swallow the underlying parser error — it can contain file internals.
    throw new PdfError("EXTRACTION_FAILED", "Could not parse the PDF.");
  }

  const normalized = normalizeWhitespace(rawText);

  if (countMeaningfulChars(normalized) < MIN_MEANINGFUL_CHARS) {
    throw new PdfError("EMPTY_RESUME", "No readable text found in the PDF.");
  }

  return normalized;
}
