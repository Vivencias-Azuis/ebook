import { deleteBlockAction, updateBlockAction } from "@/app/admin/editor/actions";
import type { EditorBlock } from "@/domains/admin/editor-queries";

export function MediaForm({
  block,
  payload,
  productId,
}: {
  block: EditorBlock;
  payload: { url: string; title?: string };
  productId: string;
}) {
  return (
    <div className="grid gap-4">
      <form
        action={async (formData: FormData) => {
          "use server";
          await updateBlockAction(productId, block.id, {
            title: String(formData.get("title") || "") || null,
            payloadJson: JSON.stringify({ url: String(formData.get("url") || "") }),
            isPublished: formData.get("isPublished") === "on",
          });
        }}
        className="grid gap-4"
      >
        <label className="grid gap-2">
          <span className="text-sm font-medium">Título</span>
          <input name="title" defaultValue={block.title ?? ""} className="rounded-xl border bg-white px-4 py-3" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium">URL</span>
          <input name="url" defaultValue={payload.url} className="rounded-xl border bg-white px-4 py-3" />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isPublished" defaultChecked={block.isPublished} />
          <span className="text-sm">Publicado</span>
        </label>
        <button type="submit" className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white">Salvar bloco</button>
      </form>
      <form
        action={async () => {
          "use server";
          await deleteBlockAction(productId, block.id);
        }}
      >
        <button type="submit" className="rounded-full border px-4 py-2 text-sm font-medium">Excluir</button>
      </form>
    </div>
  );
}
