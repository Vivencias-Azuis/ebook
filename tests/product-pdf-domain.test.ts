import { describe, expect, it } from "vitest";

import {
  buildProductPdfCacheKey,
  normalizeProductContentForPdf,
  renderProductPdfHtml,
} from "@/domains/products/pdf";

describe("product pdf domain", () => {
  it("builds different cache keys when variant changes", () => {
    const normalized = {
      product: { id: "prod-1", slug: "guia", title: "Guia" },
      chapters: [{ id: "c1", title: "Cap 1", blocks: [] }],
    };

    expect(buildProductPdfCacheKey(normalized, "fast")).not.toBe(
      buildProductPdfCacheKey(normalized, "print"),
    );
  });

  it("builds different cache keys when content changes", () => {
    const base = {
      product: { id: "prod-1", slug: "guia", title: "Guia" },
      chapters: [{ id: "c1", title: "Cap 1", blocks: [] }],
    };

    const changed = {
      ...base,
      chapters: [
        {
          id: "c1",
          title: "Cap 1",
          blocks: [
            { kind: "rich_text" as const, title: null, markdown: "novo" },
          ],
        },
      ],
    };

    expect(buildProductPdfCacheKey(base, "fast")).not.toBe(
      buildProductPdfCacheKey(changed, "fast"),
    );
  });

  it("normalizes published chapters into pdf sections", () => {
    const normalized = normalizeProductContentForPdf({
      product: { id: "prod-1", slug: "guia", title: "Guia", subtitle: "Sub" },
      chapters: [
        {
          id: "chapter-1",
          title: "Capítulo 1",
          sortOrder: 1,
          blocks: [
            {
              id: "block-1",
              type: "rich_text",
              title: null,
              payloadJson: JSON.stringify({ markdown: "Texto" }),
              sortOrder: 1,
            },
          ],
        },
      ],
    });

    expect(normalized.chapters[0]?.title).toBe("Capítulo 1");
    expect(normalized.chapters[0]?.blocks[0]?.kind).toBe("rich_text");
  });

  it("renders different html for fast and print variants", () => {
    const normalized = normalizeProductContentForPdf({
      product: { id: "prod-1", slug: "guia", title: "Guia", subtitle: "Sub" },
      chapters: [{ id: "c1", title: "Cap 1", sortOrder: 1, blocks: [] }],
    });

    expect(renderProductPdfHtml(normalized, "fast")).toContain(
      'data-variant="fast"',
    );
    expect(renderProductPdfHtml(normalized, "print")).toContain(
      'data-variant="print"',
    );
  });

  it("renders escaped product and block content into the pdf html", () => {
    const html = renderProductPdfHtml(
      {
        product: {
          id: "prod-1",
          slug: "guia",
          title: 'Guia & "Primeiros Passos"',
          subtitle: "<Comece com calma>",
        },
        chapters: [
          {
            id: "c1",
            title: "Capítulo 1",
            blocks: [
              {
                kind: "rich_text",
                title: "O que fazer primeiro",
                markdown: "Texto <importante> & objetivo",
              },
              {
                kind: "checklist",
                title: "Checklist",
                items: [
                  { id: "i1", label: 'Ligar para a escola & dizer "oi"' },
                ],
              },
            ],
          },
        ],
      },
      "fast",
    );

    expect(html).toContain("Guia &amp; &quot;Primeiros Passos&quot;");
    expect(html).toContain("&lt;Comece com calma&gt;");
    expect(html).toContain("Texto &lt;importante&gt; &amp; objetivo");
    expect(html).toContain("Ligar para a escola &amp; dizer &quot;oi&quot;");
  });

  it("renders markdown as semantic, styled pdf content instead of raw markdown", () => {
    const html = renderProductPdfHtml(
      {
        product: {
          id: "prod-1",
          slug: "guia",
          title: "Guia Prático",
          subtitle: "Um guia calmo para os primeiros passos.",
        },
        chapters: [
          {
            id: "c1",
            title: "Comece por aqui",
            blocks: [
              {
                kind: "rich_text",
                title: "Para quem está perdido",
                markdown: [
                  "## Primeira semana",
                  "",
                  "Texto de abertura com **ênfase** importante.",
                  "",
                  "- Organizar documentos",
                  "- Conversar com a escola",
                  "",
                  "---",
                  "",
                  "### Próximo passo",
                  "",
                  "Fechar uma prioridade por vez.",
                ].join("\n"),
              },
              {
                kind: "checklist",
                title: "Checklist inicial",
                items: [{ id: "i1", label: "Separar exames" }],
              },
            ],
          },
        ],
      },
      "print",
    );

    expect(html).toContain('class="pdf-shell"');
    expect(html).toContain('class="cover-kicker"');
    expect(html).toContain("<h4>Primeira semana</h4>");
    expect(html).toContain("<strong>ênfase</strong>");
    expect(html).toContain("<li>Organizar documentos</li>");
    expect(html).toContain("<hr");
    expect(html).toContain('class="checklist-marker"');
    expect(html).not.toContain("<pre>");
    expect(html).not.toContain("## Primeira semana");
    expect(html).not.toContain("---");
  });

  it("does not duplicate the first markdown heading when it matches the block title", () => {
    const html = renderProductPdfHtml(
      {
        product: { id: "prod-1", slug: "guia", title: "Guia" },
        chapters: [
          {
            id: "c1",
            title: "Comece por aqui",
            blocks: [
              {
                kind: "rich_text",
                title: "Para quem este guia é",
                markdown: "### Para quem este guia é\n\nTexto sem repetição.",
              },
            ],
          },
        ],
      },
      "print",
    );

    expect(html.match(/Para quem este guia é/g)).toHaveLength(1);
  });
});
