type PdfBlock =
  | { kind: "rich_text"; title: string | null; markdown: string }
  | { kind: "checklist"; title: string | null; items: Array<{ id: string; label: string }> };

type PdfDocument = {
  product: { title: string; subtitle?: string | null };
  chapters: Array<{ title: string; blocks: PdfBlock[] }>;
};

export function ProductPdfTemplate({
  document,
  variant,
}: {
  document: PdfDocument;
  variant: "fast" | "print";
}) {
  return (
    <html lang="pt-BR">
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta charSet="utf-8" />
        <title>{document.product.title}</title>
        <style>{variant === "fast" ? FAST_CSS : PRINT_CSS}</style>
      </head>
      <body data-variant={variant}>
        <header className="cover">
          <h1>{document.product.title}</h1>
          {document.product.subtitle ? <p>{document.product.subtitle}</p> : null}
        </header>
        {document.chapters.map((chapter) => (
          <section key={chapter.title}>
            <h2>{chapter.title}</h2>
            {chapter.blocks.map((block, index) => (
              <article key={`${chapter.title}-${index}`}>
                {block.title ? <h3>{block.title}</h3> : null}
                {"markdown" in block ? <pre>{block.markdown}</pre> : null}
                {"items" in block ? (
                  <ul>
                    {block.items.map((item) => (
                      <li key={item.id}>[ ] {item.label}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </section>
        ))}
      </body>
    </html>
  );
}

const FAST_CSS =
  "body{font-family:Arial,sans-serif;font-size:12px;line-height:1.45;padding:28px;color:#111} h1,h2,h3{color:#0b2342} pre{white-space:pre-wrap;font-family:inherit}";
const PRINT_CSS =
  "@page{margin:20mm 16mm} body{font-family:Georgia,serif;font-size:12px;line-height:1.6;color:#1f2937} .cover{padding:36px 0 24px;border-bottom:1px solid #cbd5e1;margin-bottom:24px} h1,h2,h3{color:#0b2342} section{break-inside:avoid}";
