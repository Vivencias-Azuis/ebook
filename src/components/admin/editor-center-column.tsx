import Link from "next/link";
import type { EditorChapter } from "@/domains/admin/editor-queries";
import { createBlockAction, reorderBlockAction } from "@/app/admin/editor/actions";

export function EditorCenterColumn({
  productId,
  chapter,
  selectedBlockId,
}: {
  productId: string;
  chapter: EditorChapter | null;
  selectedBlockId: string | null;
}) {
  if (!chapter) {
    return <div className="rounded-3xl border border-dashed p-6 text-sm text-zinc-600">Crie o primeiro capítulo para começar.</div>;
  }

  return (
    <section className="grid gap-4 rounded-3xl border bg-stone-50 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Capítulo</p>
          <h2 className="mt-2 text-xl font-semibold">{chapter.title}</h2>
        </div>
        <form
          action={async () => {
            "use server";
            await createBlockAction(productId, chapter.id, "rich_text");
          }}
        >
          <button type="submit" className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white">
            + Novo bloco
          </button>
        </form>
      </div>
      <div className="grid gap-3">
        {chapter.blocks.map((block) => (
          <div
            key={block.id}
            className={`rounded-2xl border px-4 py-4 ${selectedBlockId === block.id ? "border-zinc-950 bg-white" : "border-zinc-200 bg-white/70"}`}
          >
            <div className="flex items-center justify-between gap-4">
              <Link href={`?chapter=${chapter.id}&block=${block.id}`} className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">{block.type}</div>
                <div className="mt-1 font-medium">{block.title || "Sem título"}</div>
              </Link>
              <div className="flex gap-2">
                <form
                  action={async () => {
                    "use server";
                    await reorderBlockAction(productId, chapter.id, block.id, "up");
                  }}
                >
                  <button type="submit" className="rounded-full border px-3 py-1 text-xs">Subir</button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await reorderBlockAction(productId, chapter.id, block.id, "down");
                  }}
                >
                  <button type="submit" className="rounded-full border px-3 py-1 text-xs">Descer</button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {chapter.blocks.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-5 text-sm text-zinc-600">Nenhum bloco ainda neste capítulo.</div>
        ) : null}
      </div>
    </section>
  );
}
