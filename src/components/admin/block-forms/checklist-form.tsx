import {
  deleteBlockAction,
  updateBlockAction,
} from "@/app/admin/editor/actions";
import type { EditorBlock } from "@/domains/admin/editor-queries";

export function ChecklistForm({
  block,
  payload,
  productId,
}: {
  block: EditorBlock;
  payload: { items: { id: string; label: string }[] };
  productId: string;
}) {
  return (
    <div className="grid gap-4">
      <form
        action={async (formData: FormData) => {
          "use server";
          const entries = Array.from(formData.entries());
          const itemIds = entries
            .filter(([key]) => key.startsWith("item-id-"))
            .map(([, value]) => String(value));
          const items = itemIds.map((id) => ({
            id,
            label: String(formData.get(`item-${id}`) || ""),
          }));
          await updateBlockAction(productId, block.id, {
            title: String(formData.get("title") || "") || null,
            payloadJson: JSON.stringify({ items }),
            isPublished: formData.get("isPublished") === "on",
          });
        }}
        className="grid gap-4"
      >
        <label className="grid gap-2">
          <span className="text-sm font-medium">Título</span>
          <input
            name="title"
            defaultValue={block.title ?? ""}
            className="rounded-xl border bg-white px-4 py-3"
          />
        </label>
        <div className="grid gap-2">
          <span className="text-sm font-medium">Itens</span>
          {payload.items.map((item) => (
            <div key={item.id}>
              <input
                type="hidden"
                name={`item-id-${item.id}`}
                value={item.id}
              />
              <input
                name={`item-${item.id}`}
                defaultValue={item.label}
                className="w-full rounded-xl border bg-white px-4 py-3"
              />
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={block.isPublished}
          />
          <span className="text-sm">Publicado</span>
        </label>
        <button
          type="submit"
          className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white"
        >
          Salvar bloco
        </button>
      </form>
      <form
        action={async () => {
          "use server";
          await deleteBlockAction(productId, block.id);
        }}
      >
        <button
          type="submit"
          className="rounded-full border px-4 py-2 text-sm font-medium"
        >
          Excluir
        </button>
      </form>
    </div>
  );
}
