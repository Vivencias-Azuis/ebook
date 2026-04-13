import { existsSync } from "node:fs";

import { parseBlockPayload, type BlockType } from "@/domains/content/blocks";

import { generatedPdfPath, sha256 } from "./pdf-cache";

export type ProductPdfVariant = "fast" | "print";

const PRODUCT_PDF_RENDERER_VERSION = "editorial-v7-2026-04-11";

type ProductPdfNormalizedBlock =
  | { kind: "rich_text"; title: string | null; markdown: string }
  | {
      kind: "checklist";
      title: string | null;
      items: Array<{ id: string; label: string }>;
    };

type ProductPdfNormalizedContent = {
  product: {
    id: string;
    slug: string;
    title: string;
    subtitle?: string | null;
  };
  chapters: Array<{
    id: string;
    title: string;
    blocks: ProductPdfNormalizedBlock[];
  }>;
};

export function normalizeProductContentForPdf(input: {
  product: {
    id: string;
    slug: string;
    title: string;
    subtitle?: string | null;
  };
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
                  markdown: parseBlockPayload("rich_text", block.payloadJson)
                    .markdown,
                },
              ];
            }

            if (block.type === "checklist") {
              return [
                {
                  kind: "checklist",
                  title: block.title,
                  items: parseBlockPayload("checklist", block.payloadJson)
                    .items,
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
  return sha256(
    JSON.stringify({
      variant,
      renderer: PRODUCT_PDF_RENDERER_VERSION,
      normalized,
    }),
  );
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
  const density =
    variant === "fast"
      ? ":root{--page-pad:16mm;--body-size:11px;--line:1.48;--chapter-gap:18px;--card-pad:14px}"
      : ":root{--page-pad:18mm;--body-size:12px;--line:1.62;--chapter-gap:26px;--card-pad:18px}";

  return `${density}
@page{size:A4;margin:0}
*{box-sizing:border-box}
body{margin:0;background:#f3efe7;color:#18324a;font-family:'Avenir Next','Helvetica Neue',Arial,sans-serif;font-size:var(--body-size);line-height:var(--line);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pdf-shell{min-height:100vh;padding:var(--page-pad);padding-bottom:26mm;background:linear-gradient(135deg,#fbf8f0 0%,#eef6f7 52%,#f7efe4 100%)}
.cover{position:relative;overflow:hidden;min-height:${variant === "fast" ? "126px" : "168px"};padding:${variant === "fast" ? "22px" : "30px"};border-radius:24px;background:linear-gradient(135deg,#0b3151 0%,#0f5d73 56%,#d9a84f 140%);color:#fff;box-shadow:0 18px 44px rgba(11,49,81,.18)}
.cover::after{content:"";position:absolute;right:-70px;bottom:-90px;width:250px;height:250px;border-radius:999px;background:rgba(255,255,255,.11)}
.cover-kicker{margin:0 0 18px;color:#dbeef1;font-family:Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase}
.cover h1{position:relative;max-width:610px;margin:0;color:#fff;font-family:Georgia,'Times New Roman',serif;font-size:${variant === "fast" ? "28px" : "36px"};line-height:1.06;letter-spacing:-.035em}
.cover p{position:relative;max-width:470px;margin:14px 0 0;color:#e8f5f6;font-size:${variant === "fast" ? "12px" : "15px"};line-height:1.55}
.chapter{margin-top:var(--chapter-gap)}
.chapter-header{display:grid;grid-template-columns:44px 1fr;gap:13px;align-items:start;margin-bottom:14px}
.chapter-number{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:14px;background:#d9a84f;color:#082d4a;font-family:Arial,sans-serif;font-size:10px;font-weight:800;letter-spacing:.08em}
h2{margin:0;color:#0b3151;font-family:Georgia,'Times New Roman',serif;font-size:${variant === "fast" ? "20px" : "25px"};line-height:1.1;letter-spacing:-.025em}
article{margin:0 0 12px;padding:var(--card-pad);border:1px solid rgba(14,75,103,.16);border-radius:18px;background:rgba(255,255,255,.82);box-shadow:0 10px 26px rgba(11,49,81,.08);break-inside:avoid-page;page-break-inside:avoid}
article.checklist-card{break-inside:avoid-page;page-break-inside:avoid}
article + article{break-before:avoid-page}
section.chapter{break-inside:auto}
.chapter-header{break-after:avoid-page;page-break-after:avoid}
article h3{margin:0 0 10px;color:#0f4e68;font-family:Georgia,'Times New Roman',serif;font-size:${variant === "fast" ? "13px" : "15px"};line-height:1.25;letter-spacing:-.01em}
.prose p{margin:0 0 9px}
.prose h4,.prose h5{margin:14px 0 7px;color:#0b3151;line-height:1.2}
.prose h4{font-size:${variant === "fast" ? "13px" : "16px"}}
.prose h5{font-size:${variant === "fast" ? "12px" : "14px"};color:#315f72}
.prose ul{margin:7px 0 10px;padding:0;list-style:none}
.prose li{position:relative;margin:5px 0;padding-left:18px}
.prose li::before{content:"";position:absolute;left:0;top:.62em;width:6px;height:6px;border-radius:999px;background:#d9a84f}
.prose strong{color:#0b3151;font-weight:700}
.prose hr{height:1px;margin:14px 0;border:0;background:linear-gradient(90deg,rgba(15,93,115,.35),rgba(217,168,79,.7),transparent)}
.checklist{margin:0;padding:0;list-style:none}
.checklist li{display:flex;gap:10px;align-items:flex-start;margin:8px 0;padding:9px 10px;border-radius:13px;background:#f5f0e6;color:#244258}
.checklist-marker{flex:0 0 auto;width:15px;height:15px;margin-top:1px;border:2px solid #0f5d73;border-radius:5px;background:#fff}
.footer{display:flex;justify-content:space-between;margin-top:20px;border-top:1px solid rgba(14,75,103,.18);padding-top:8px;color:#6b7f8d;font-size:8px;letter-spacing:.08em;text-transform:uppercase}
@media print{.pdf-shell{background:#fbf8f0}.cover,article{box-shadow:none}}`;
}

function renderInlineMarkdown(value: string) {
  return escapeHtml(value).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function flushParagraph(paragraphLines: string[], html: string[]) {
  if (paragraphLines.length === 0) {
    return;
  }

  html.push(`<p>${renderInlineMarkdown(paragraphLines.join(" "))}</p>`);
  paragraphLines.length = 0;
}

function flushList(listItems: string[], html: string[]) {
  if (listItems.length === 0) {
    return;
  }

  html.push(
    `<ul>${listItems.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`,
  );
  listItems.length = 0;
}

function normalizeHeadingText(value: string) {
  return value
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

function renderMarkdown(
  markdown: string,
  options?: { skipFirstHeadingMatching?: string },
) {
  const html: string[] = [];
  const paragraphLines: string[] = [];
  const listItems: string[] = [];
  let hasRenderedContent = false;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph(paragraphLines, html);
      flushList(listItems, html);
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph(paragraphLines, html);
      flushList(listItems, html);
      if (
        !hasRenderedContent &&
        options?.skipFirstHeadingMatching &&
        normalizeHeadingText(heading[2]) ===
          normalizeHeadingText(options.skipFirstHeadingMatching)
      ) {
        continue;
      }
      const level = heading[1].length <= 2 ? "h4" : "h5";
      html.push(`<${level}>${renderInlineMarkdown(heading[2])}</${level}>`);
      hasRenderedContent = true;
      continue;
    }

    if (/^-{3,}$/.test(line)) {
      flushParagraph(paragraphLines, html);
      flushList(listItems, html);
      html.push("<hr />");
      hasRenderedContent = true;
      continue;
    }

    const listItem = /^[-*]\s+(.+)$/.exec(line);
    if (listItem) {
      flushParagraph(paragraphLines, html);
      listItems.push(listItem[1]);
      hasRenderedContent = true;
      continue;
    }

    flushList(listItems, html);
    paragraphLines.push(line);
    hasRenderedContent = true;
  }

  flushParagraph(paragraphLines, html);
  flushList(listItems, html);

  return html.join("");
}

function renderPdfBlock(block: ProductPdfNormalizedBlock) {
  const title = block.title ? `<h3>${escapeHtml(block.title)}</h3>` : "";

  if (block.kind === "rich_text") {
    return `<article class="content-card">${title}<div class="prose">${renderMarkdown(
      block.markdown,
      {
        skipFirstHeadingMatching: block.title ?? undefined,
      },
    )}</div></article>`;
  }

  return `<article class="checklist-card">${title}<ul class="checklist">${block.items
    .map(
      (item) =>
        `<li><span class="checklist-marker"></span><span>${escapeHtml(item.label)}</span></li>`,
    )
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
      (chapter, index) =>
        `<section class="chapter"><div class="chapter-header"><span class="chapter-number">${String(index + 1).padStart(2, "0")}</span><h2>${escapeHtml(chapter.title)}</h2></div>${chapter.blocks
          .map((block) => renderPdfBlock(block))
          .join("")}</section>`,
    )
    .join("");

  return `<!doctype html><html lang="pt-BR"><head><meta charSet="utf-8" /><title>${escapeHtml(normalized.product.title)}</title><style>${getPdfStyles(variant)}</style></head><body data-variant="${variant}"><main class="pdf-shell"><header class="cover"><p class="cover-kicker">Vivências Azuis</p><h1>${escapeHtml(normalized.product.title)}</h1>${subtitle}</header>${chapters}<footer class="footer"><span>Guia prático</span><span>${variant === "fast" ? "Leitura rápida" : "Versão para impressão"}</span></footer></main></body></html>`;
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
    await page.setContent(renderProductPdfHtml(normalized, variant), {
      waitUntil: "load",
    });
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
