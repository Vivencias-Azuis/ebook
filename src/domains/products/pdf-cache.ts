import { createHash } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const GENERATED_PDF_DIR = path.resolve(process.cwd(), ".generated-pdfs");

export function ensureGeneratedPdfDir() {
  if (!existsSync(GENERATED_PDF_DIR)) {
    mkdirSync(GENERATED_PDF_DIR, { recursive: true });
  }

  return GENERATED_PDF_DIR;
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generatedPdfPath(fileName: string) {
  return path.join(ensureGeneratedPdfDir(), fileName);
}
