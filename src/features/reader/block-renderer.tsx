import type { ReactNode } from "react";

import { parseBlockPayload, type BlockType } from "@/domains/content/blocks";
import type { BlockProgressState } from "@/domains/progress/queries";

type BlockRendererProps = {
  type: BlockType;
  title: string | null;
  payloadJson: string;
  progressState?: BlockProgressState | null;
};

function toneClassName(tone: "info" | "warning" | "success") {
  switch (tone) {
    case "info":
      return "border-sky-200 bg-sky-50 text-sky-950";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
  }
}

function PreparedPlaceholder({ label }: { label: string }) {
  return (
    <div className="rounded-[1.35rem] border border-dashed border-[color:var(--va-blue-300)] bg-[color:var(--va-blue-100)]/35 px-5 py-4 text-sm text-[color:var(--va-blue-800)]">
      <span className="font-semibold">Material preparado:</span> {label}
    </div>
  );
}

export function BlockRenderer({
  type,
  title,
  payloadJson,
  progressState,
}: BlockRendererProps) {
  let content: ReactNode;

  try {
    content = renderBlockContent(type, payloadJson, progressState ?? null);
  } catch {
    content = (
      <p
        aria-live="polite"
        role="status"
        className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      >
        Conteúdo indisponível neste bloco.
      </p>
    );
  }

  return (
    <section className="space-y-4">
      {title ? (
        <h3 className="font-serif text-2xl font-semibold leading-tight text-[color:var(--va-navy)]">
          {title}
        </h3>
      ) : null}
      {content}
    </section>
  );
}

function normalizeMarkdownLine(line: string) {
  return line
    .replace(/^\\- /, "- ")
    .replace(/^(\d+)\\. /, "$1. ")
    .trim();
}

function renderInlineText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={`${part}-${index}`}
          className="font-semibold text-[color:var(--va-navy)]"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
}

function renderRichText(markdown: string) {
  const lines = markdown
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(normalizeMarkdownLine)
    .filter(Boolean);
  const elements: ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length === 0) {
      return;
    }

    const items = listItems;
    listItems = [];
    elements.push(
      <ul key={`list-${elements.length}`} className="reader-list">
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>
            {renderInlineText(item.replace(/^- /, ""))}
          </li>
        ))}
      </ul>,
    );
  }

  for (const line of lines) {
    if (line === "---" || line === "\\---") {
      flushList();
      elements.push(
        <div
          key={`divider-${elements.length}`}
          className="reader-rule"
          aria-hidden
        />,
      );
      continue;
    }

    if (line.startsWith("- ")) {
      listItems.push(line);
      continue;
    }

    flushList();

    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={`h4-${elements.length}`}>
          {renderInlineText(line.replace(/^### /, ""))}
        </h4>,
      );
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={`h3-${elements.length}`}>
          {renderInlineText(line.replace(/^## /, ""))}
        </h3>,
      );
      continue;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h2 key={`h2-${elements.length}`}>
          {renderInlineText(line.replace(/^# /, ""))}
        </h2>,
      );
      continue;
    }

    elements.push(<p key={`p-${elements.length}`}>{renderInlineText(line)}</p>);
  }

  flushList();

  const firstIsParagraph =
    elements.length > 0 &&
    lines[0]?.startsWith("- ") === false &&
    !lines[0]?.startsWith("#") &&
    lines[0] !== "---";
  const dropCapClass = firstIsParagraph ? "" : "no-drop-cap";

  return (
    <div className={`reader-prose ${dropCapClass}`.trim()}>{elements}</div>
  );
}

function renderBlockContent(
  type: BlockType,
  payloadJson: string,
  progressState: BlockProgressState | null,
): ReactNode {
  switch (type) {
    case "rich_text": {
      const payload = parseBlockPayload(type, payloadJson);
      return renderRichText(payload.markdown);
    }
    case "callout": {
      const payload = parseBlockPayload(type, payloadJson);
      return (
        <div
          className={`rounded-[1.35rem] border px-5 py-4 shadow-[0_18px_44px_-34px_rgba(11,35,66,0.3)] ${toneClassName(payload.tone)}`}
        >
          <p className="text-sm font-medium uppercase tracking-wide">
            {payload.tone}
          </p>
          <p className="mt-2 whitespace-pre-wrap leading-7">{payload.body}</p>
        </div>
      );
    }
    case "checklist": {
      const payload = parseBlockPayload(type, payloadJson);
      const checkedItemIds = progressState?.checkedItemIds ?? [];
      return (
        <ul className="space-y-3">
          {payload.items.map((item) => {
            const inputId = `checklist-${item.id}`;
            return (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-[1.2rem] border border-[color:var(--va-line)] bg-white/72 px-4 py-3 text-[color:var(--va-ink)] shadow-[0_14px_34px_-30px_rgba(11,35,66,0.35)]"
              >
                <input
                  aria-label={item.label}
                  checked={checkedItemIds.includes(item.id)}
                  className="mt-1 h-4 w-4 rounded border-[color:var(--va-line-strong)] text-[color:var(--va-blue)]"
                  disabled
                  id={inputId}
                  readOnly
                  type="checkbox"
                />
                <label htmlFor={inputId} className="leading-7">
                  {item.label}
                </label>
              </li>
            );
          })}
        </ul>
      );
    }
    case "divider":
      parseBlockPayload(type, payloadJson);
      return <hr className="border-zinc-200" />;
    case "download": {
      const payload = parseBlockPayload(type, payloadJson);

      if (payload.mode === "dynamic_pdf" && payload.productSlug) {
        const fastHref = `/api/products/${payload.productSlug}/download-pdf?variant=fast`;
        const printHref = `/api/products/${payload.productSlug}/download-pdf?variant=print`;

        return (
          <div className="rounded-[1.2rem] border border-[color:var(--va-line)] bg-white/78 p-5 shadow-[0_18px_44px_-34px_rgba(11,35,66,0.3)]">
            <p className="font-serif text-xl font-semibold text-[color:var(--va-navy)]">
              Material para baixar
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--va-soft-ink)]">
              Escolha entre uma versão mais leve para leitura rápida ou uma
              versão pensada para impressão.
            </p>
            <details className="mt-4">
              <summary className="inline-flex cursor-pointer rounded-[8px] bg-[color:var(--va-navy)] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_38px_-28px_rgba(11,35,66,0.62)] hover:-translate-y-0.5 hover:bg-[color:var(--va-blue-800)]">
                {payload.label}
              </summary>
              <div className="mt-3 flex flex-col gap-2">
                <a
                  className="rounded-[8px] border border-[color:var(--va-line)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--va-blue-800)]"
                  href={fastHref}
                >
                  PDF rápido
                </a>
                <a
                  className="rounded-[8px] border border-[color:var(--va-line)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--va-blue-800)]"
                  href={printHref}
                >
                  PDF para imprimir
                </a>
              </div>
            </details>
          </div>
        );
      }

      if (!payload.href) {
        return (
          <PreparedPlaceholder
            label={`Download block ready: ${payload.label}`}
          />
        );
      }

      return (
        <div className="rounded-[1.2rem] border border-[color:var(--va-line)] bg-white/78 p-5 shadow-[0_18px_44px_-34px_rgba(11,35,66,0.3)]">
          <p className="font-serif text-xl font-semibold text-[color:var(--va-navy)]">
            Material para baixar
          </p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--va-soft-ink)]">
            Salve uma copia do curso completo para consultar fora da plataforma.
          </p>
          <a
            className="mt-4 inline-flex rounded-[8px] bg-[color:var(--va-navy)] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_38px_-28px_rgba(11,35,66,0.62)] hover:-translate-y-0.5 hover:bg-[color:var(--va-blue-800)]"
            download
            href={payload.href}
          >
            {payload.label}
          </a>
        </div>
      );
    }
    case "audio":
      parseBlockPayload(type, payloadJson);
      return <PreparedPlaceholder label="Audio block ready for playback UI." />;
    case "video":
      parseBlockPayload(type, payloadJson);
      return <PreparedPlaceholder label="Video block ready for playback UI." />;
    case "quiz":
      parseBlockPayload(type, payloadJson);
      return (
        <PreparedPlaceholder label="Quiz block ready for interaction UI." />
      );
  }
}
