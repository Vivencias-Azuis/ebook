import {
  deleteBlockAction,
  updateBlockAction,
} from "@/app/admin/editor/actions";
import type { EditorBlock } from "@/domains/admin/editor-queries";

export function CalloutForm({
  block,
  payload,
  productId,
}: {
  block: EditorBlock;
  payload: { tone: "info" | "warning" | "success"; body: string };
  productId: string;
}) {
  return (
    <div className="grid gap-4">
      <form
        action={async (formData: FormData) => {
          "use server";
          await updateBlockAction(productId, block.id, {
            title: String(formData.get("title") || "") || null,
            payloadJson: JSON.stringify({
              tone: String(formData.get("tone") || "info"),
              body: String(formData.get("body") || ""),
            }),
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
        <label className="grid gap-2">
          <span className="text-sm font-medium">Tom</span>
          <select
            name="tone"
            defaultValue={payload.tone}
            className="rounded-xl border bg-white px-4 py-3"
          >
            <option value="info">Info</option>
            <option value="warning">Aviso</option>
            <option value="success">Sucesso</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium">Texto</span>
          <textarea
            name="body"
            defaultValue={payload.body}
            className="min-h-32 rounded-xl border bg-white px-4 py-3"
          />
        </label>
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
