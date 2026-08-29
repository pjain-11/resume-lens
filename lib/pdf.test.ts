import { describe, expect, it } from "vitest";
import { makePdf } from "../test/makePdf";
import { extractResumeText, looksLikePdf, PdfError } from "./pdf";

describe("looksLikePdf", () => {
  it("is true for the %PDF- signature", () => {
    expect(looksLikePdf(new TextEncoder().encode("%PDF-1.7\n..."))).toBe(true);
  });

  it("is false for arbitrary bytes", () => {
    expect(looksLikePdf(new TextEncoder().encode("not a pdf"))).toBe(false);
    expect(looksLikePdf(new Uint8Array([1, 2, 3]))).toBe(false);
  });
});

describe("extractResumeText", () => {
  it("throws INVALID_FILE when bytes are not a PDF", async () => {
    await expect(
      extractResumeText(new TextEncoder().encode("plain text file")),
    ).rejects.toMatchObject({ code: "INVALID_FILE" });
  });

  it("throws EMPTY_RESUME for a PDF with no readable text", async () => {
    await expect(extractResumeText(makePdf(""))).rejects.toMatchObject({
      code: "EMPTY_RESUME",
    });
  });

  it("extracts text from a valid PDF", async () => {
    const text = await extractResumeText(
      makePdf("Jane Doe Staff Engineer backend systems"),
    );
    expect(text).toContain("Jane Doe");
    expect(text.length).toBeGreaterThan(10);
  });

  it("surfaces failures as PdfError", async () => {
    await expect(extractResumeText(new Uint8Array([0]))).rejects.toBeInstanceOf(PdfError);
  });
});
