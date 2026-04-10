import { updateChapterAction } from "@/app/admin/editor/actions";
import type { EditorBlock } from "@/domains/admin/editor-queries";
import { BlockFormRouter } from "@/components/admin/block-forms/block-form-router";
import type { EditorChapter } from "@/domains/admin/editor-queries";

export function EditorRightColumn({
  block,
  chapter,
  productId,
}: {
  block: EditorBlock | null;
  chapter: EditorChapter | null;
  productId: string;
}) {
  if (!block) {
    return (
      <aside className="rounded-3xl border bg-violet-50 p-5 text-sm text-zinc-700">
        {chapter ? (
          <form
            action={async (formData: FormData) => {
              "use server";
              await updateChapterAction(productId, chapter.id, {
                title: String(formData.get("title") || chapter.title),
                isPublished: formData.get("isPublished") === "on",
              });
            }}
            className="grid gap-4"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Capítulo</p>
              <h3 className="mt-2 text-lg font-semibold">Editar capítulo</h3>
            </div>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Título</span>
              <input
                name="title"
                defaultValue={chapter.title}
                className="rounded-xl border bg-white px-4 py-3"
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPublished"
                defaultChecked={chapter.isPublished}
              />
              <span className="text-sm">Publicado</span>
            </label>
            <button
              type="submit"
              className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white"
            >
              Salvar capítulo
            </button>
          </form>
        ) : (
          "Selecione um bloco para editar suas propriedades."
        )}
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
