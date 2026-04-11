import type { EditorBlock } from "@/domains/admin/editor-queries";
import { parseBlockPayload } from "@/domains/content/blocks";
import { CalloutForm } from "./callout-form";
import { ChecklistForm } from "./checklist-form";
import { DownloadForm } from "./download-form";
import { MediaForm } from "./media-form";
import { QuizForm } from "./quiz-form";
import { RichTextForm } from "./rich-text-form";

export function BlockFormRouter({
  block,
  productId,
}: {
  block: EditorBlock;
  productId: string;
}) {
  if (block.type === "rich_text") {
    return (
      <RichTextForm
        block={block}
        payload={parseBlockPayload("rich_text", block.payloadJson)}
        productId={productId}
      />
    );
  }
  if (block.type === "callout") {
    return (
      <CalloutForm
        block={block}
        payload={parseBlockPayload("callout", block.payloadJson)}
        productId={productId}
      />
    );
  }
  if (block.type === "checklist") {
    return (
      <ChecklistForm
        block={block}
        payload={parseBlockPayload("checklist", block.payloadJson)}
        productId={productId}
      />
    );
  }
  if (block.type === "download") {
    return (
      <DownloadForm
        block={block}
        payload={parseBlockPayload("download", block.payloadJson)}
        productId={productId}
      />
    );
  }
  if (block.type === "audio" || block.type === "video") {
    return (
      <MediaForm
        block={block}
        payload={parseBlockPayload(block.type, block.payloadJson)}
        productId={productId}
      />
    );
  }
  if (block.type === "quiz") {
    return (
      <QuizForm
        block={block}
        payload={parseBlockPayload("quiz", block.payloadJson)}
        productId={productId}
      />
    );
  }
  return (
    <div className="text-sm text-zinc-600">
      Este bloco não precisa de edição lateral.
    </div>
  );
}
