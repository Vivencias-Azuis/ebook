import { existsSync } from "node:fs";

import { parseBlockPayload, type BlockType } from "@/domains/content/blocks";

import { generatedPdfPath, sha256 } from "./pdf-cache";

export type ProductPdfVariant = "fast" | "print";

type ProductPdfNormalizedBlock =
  | { kind: "rich_text"; title: string | null; markdown: string }
  | { kind: "checklist"; title: string | null; items: Array<{ id: string; label: string }> };

type ProductPdfNormalizedContent = {
  product: { id: string; slug: string; title: string; subtitle?: string | null };
  chapters: Array<{
    id: string;
    title: string;
    blocks: ProductPdfNormalizedBlock[];
  }>;
};

export function normalizeProductContentForPdf(input: {
  product: { id: string; slug: string; title: string; subtitle?: string | null };
  chapters: Array<{
    id: string;
    title: string;
    sortOrder: number;
    blocks: Array<{
      id: string;
      type: BlockType;
      title: string | null;
      payloadJson: string;
      sortOrder: number;
    }>;
  }>;
}): ProductPdfNormalizedContent {
  return {
    product: input.product,
    chapters: input.chapters
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        blocks: chapter.blocks
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .flatMap((block): ProductPdfNormalizedBlock[] => {
            if (block.type === "download") {
              return [];
            }

            if (block.type === "rich_text") {
              return [
                {
                  kind: "rich_text",
                  title: block.title,
                  markdown: parseBlockPayload("rich_text", block.payloadJson).markdown,
                },
              ];
            }

            if (block.type === "checklist") {
              return [
                {
                  kind: "checklist",
                  title: block.title,
                  items: parseBlockPayload("checklist", block.payloadJson).items,
                },
              ];
            }

            return [];
          }),
      })),
  };
}

export function buildProductPdfCacheKey(
  normalized: ProductPdfNormalizedContent,
  variant: ProductPdfVariant,
) {
  return sha256(JSON.stringify({ variant, normalized }));
}

export function buildProductPdfFileName(
  normalized: ProductPdfNormalizedContent,
  variant: ProductPdfVariant,
) {
  return `${normalized.product.slug}-${variant}-${buildProductPdfCacheKey(normalized, variant).slice(0, 16)}.pdf`;
}

export function resolveProductPdfPath(
  normalized: ProductPdfNormalizedContent,
  variant: ProductPdfVariant,
) {
  return generatedPdfPath(buildProductPdfFileName(normalized, variant));
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getPdfStyles(variant: ProductPdfVariant) {
  return variant === "fast"
    ? "body{font-family:Arial,sans-serif;font-size:12px;line-height:1.45;padding:28px;color:#111} h1,h2,h3{color:#0b2342} pre{white-space:pre-wrap;font-family:inherit}"
    : "@page{margin:20mm 16mm} body{font-family:Georgia,serif;font-size:12px;line-height:1.6;color:#1f2937} .cover{padding:36px 0 24px;border-bottom:1px solid #cbd5e1;margin-bottom:24px} h1,h2,h3{color:#0b2342} section{break-inside:avoid}";
}

function renderPdfBlock(block: ProductPdfNormalizedBlock) {
  const title = block.title ? `<h3>${escapeHtml(block.title)}</h3>` : "";

  if (block.kind === "rich_text") {
    return `<article>${title}<pre>${escapeHtml(block.markdown)}</pre></article>`;
  }

  return `<article>${title}<ul>${block.items
    .map((item) => `<li>[ ] ${escapeHtml(item.label)}</li>`)
    .join("")}</ul></article>`;
}

export function renderProductPdfHtml(
  normalized: ProductPdfNormalizedContent,
  variant: ProductPdfVariant,
) {
  const subtitle = normalized.product.subtitle
    ? `<p>${escapeHtml(normalized.product.subtitle)}</p>`
    : "";
  const chapters = normalized.chapters
    .map(
      (chapter) =>
        `<section><h2>${escapeHtml(chapter.title)}</h2>${chapter.blocks
          .map((block) => renderPdfBlock(block))
          .join("")}</section>`,
    )
    .join("");

  return `<!doctype html><html lang="pt-BR"><head><meta charSet="utf-8" /><title>${escapeHtml(normalized.product.title)}</title><style>${getPdfStyles(variant)}</style></head><body data-variant="${variant}"><header class="cover"><h1>${escapeHtml(normalized.product.title)}</h1>${subtitle}</header>${chapters}</body></html>`;
}

export async function ensureProductPdf(
  normalized: ProductPdfNormalizedContent,
  variant: ProductPdfVariant,
) {
  const pdfPath = resolveProductPdfPath(normalized, variant);

  if (existsSync(pdfPath)) {
    return pdfPath;
  }

  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.setContent(renderProductPdfHtml(normalized, variant), { waitUntil: "load" });
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin:
        variant === "fast"
          ? { top: "12mm", right: "12mm", bottom: "14mm", left: "12mm" }
          : { top: "18mm", right: "16mm", bottom: "18mm", left: "16mm" },
    });
  } finally {
    await browser.close();
  }

  return pdfPath;
}
