import Link from "next/link";
import type { EditorChapter, EditorProduct } from "@/domains/admin/editor-queries";
import { formatMoney } from "@/lib/format";
import { createChapterAction, reorderChapterAction } from "@/app/admin/editor/actions";

export function EditorLeftColumn({
  product,
  chapters,
  selectedChapterId,
}: {
  product: EditorProduct;
  chapters: EditorChapter[];
  selectedChapterId: string | null;
}) {
  return (
    <aside className="grid gap-4 rounded-3xl border bg-zinc-50 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Produto</p>
        <h2 className="mt-2 text-lg font-semibold">{product.title}</h2>
        <p className="mt-2 text-sm text-zinc-600">
          {product.status} • {formatMoney(product.priceCents, product.currency.toUpperCase())}
        </p>
      </div>
      <div className="flex gap-2">
        <Link href={`/products/${product.slug}`} className="rounded-full border px-4 py-2 text-sm font-medium">
          Preview
        </Link>
      </div>
      <div className="grid gap-2">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="flex items-center gap-2">
            <Link
              href={`?chapter=${chapter.id}`}
              className={`flex-1 rounded-2xl border px-4 py-3 text-sm ${selectedChapterId === chapter.id ? "border-zinc-950 bg-white" : "border-zinc-200 bg-transparent"}`}
            >
              <div className="font-medium">{chapter.title}</div>
              <div className="text-xs text-zinc-500">{chapter.blocks.length} bloco{chapter.blocks.length === 1 ? "" : "s"}</div>
            </Link>
            <form
              action={async () => {
                "use server";
                await reorderChapterAction(product.id, chapter.id, "up");
              }}
            >
              <button type="submit" className="rounded-full border px-2 py-1 text-xs">↑</button>
            </form>
            <form
              action={async () => {
                "use server";
                await reorderChapterAction(product.id, chapter.id, "down");
              }}
            >
              <button type="submit" className="rounded-full border px-2 py-1 text-xs">↓</button>
            </form>
          </div>
        ))}
        <form
          action={async (formData: FormData) => {
            "use server";
            await createChapterAction(product.id, String(formData.get("title") ?? "Novo capítulo"));
          }}
        >
          <input type="hidden" name="title" value="Novo capítulo" />
          <button type="submit" className="w-full rounded-2xl border border-dashed px-4 py-3 text-left text-sm">
            + Novo capítulo
          </button>
        </form>
      </div>
    </aside>
  );
}
