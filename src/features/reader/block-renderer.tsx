import type { ReactNode } from "react";

import { parseBlockPayload, type BlockType } from "@/domains/content/blocks";

type BlockRendererProps = {
  type: BlockType;
  title: string | null;
  payloadJson: string;
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
    <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
      {label}
    </div>
  );
}

export function BlockRenderer({
  type,
  title,
  payloadJson,
}: BlockRendererProps) {
  let content: ReactNode;

  try {
    content = renderBlockContent(type, payloadJson);
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
    <section className="space-y-3">
      {title ? <h3 className="text-lg font-semibold text-zinc-950">{title}</h3> : null}
      {content}
    </section>
  );
}

function renderBlockContent(type: BlockType, payloadJson: string): ReactNode {
  switch (type) {
    case "rich_text": {
      const payload = parseBlockPayload(type, payloadJson);
      return (
        <div className="whitespace-pre-wrap leading-7 text-zinc-800">
          {payload.markdown}
        </div>
      );
    }
    case "callout": {
      const payload = parseBlockPayload(type, payloadJson);
      return (
        <div className={`rounded-md border px-4 py-3 ${toneClassName(payload.tone)}`}>
          <p className="text-sm font-medium uppercase tracking-wide">{payload.tone}</p>
          <p className="mt-2 whitespace-pre-wrap leading-7">{payload.body}</p>
        </div>
      );
    }
    case "checklist": {
      const payload = parseBlockPayload(type, payloadJson);
      return (
        <ul className="space-y-3">
          {payload.items.map((item) => {
            const inputId = `checklist-${item.id}`;
            return (
              <li key={item.id} className="flex items-start gap-3 text-zinc-800">
                <input
                  aria-label={item.label}
                  checked={false}
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-600"
                  disabled
                  id={inputId}
                  readOnly
                  type="checkbox"
                />
                <label htmlFor={inputId} className="leading-6">
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
      return <PreparedPlaceholder label={`Download block ready: ${payload.label}`} />;
    }
    case "audio":
      parseBlockPayload(type, payloadJson);
      return <PreparedPlaceholder label="Audio block ready for playback UI." />;
    case "video":
      parseBlockPayload(type, payloadJson);
      return <PreparedPlaceholder label="Video block ready for playback UI." />;
    case "quiz":
      parseBlockPayload(type, payloadJson);
      return <PreparedPlaceholder label="Quiz block ready for interaction UI." />;
  }
}
