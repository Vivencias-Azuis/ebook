import type { EditorBlock } from "@/domains/admin/editor-queries";
import { BlockFormRouter } from "@/components/admin/block-forms/block-form-router";

export function EditorRightColumn({ block, productId }: { block: EditorBlock | null; productId: string }) {
  if (!block) {
    return (
      <aside className="rounded-3xl border bg-violet-50 p-5 text-sm text-zinc-700">
        Selecione um bloco para editar suas propriedades.
      </aside>
    );
  }

  return (
    <aside className="rounded-3xl border bg-violet-50 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Propriedades</p>
      <h3 className="mt-2 text-lg font-semibold">{block.type}</h3>
      <div className="mt-4">
        <BlockFormRouter block={block} productId={productId} />
      </div>
    </aside>
  );
}
