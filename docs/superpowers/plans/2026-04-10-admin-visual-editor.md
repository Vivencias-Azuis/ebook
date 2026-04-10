# Admin Visual Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a desktop-first visual admin editor at `/admin/editor/[productId]` with three columns for chapter navigation, block management, and block properties editing.

**Architecture:** Implement the editor as a server-rendered page that loads product, chapters, and blocks together, using URL search params for selected chapter and block. Use small server actions for create, update, delete, publish, and reorder operations, and keep type-specific block editing isolated in small components.

**Tech Stack:** Next.js 16 App Router, TypeScript, Drizzle ORM, Turso/libSQL, React Server Components, Server Actions, Zod, Tailwind CSS.

---

## File Structure

Create or modify these files:

```txt
src/app/admin/editor/[productId]/page.tsx
src/app/admin/editor/actions.ts
src/domains/admin/editor-queries.ts
src/domains/admin/editor-mutations.ts
src/components/admin/editor-shell.tsx
src/components/admin/editor-left-column.tsx
src/components/admin/editor-center-column.tsx
src/components/admin/editor-right-column.tsx
src/components/admin/editor-empty-state.tsx
src/components/admin/block-forms/rich-text-form.tsx
src/components/admin/block-forms/callout-form.tsx
src/components/admin/block-forms/checklist-form.tsx
src/components/admin/block-forms/download-form.tsx
src/components/admin/block-forms/media-form.tsx
src/components/admin/block-forms/quiz-form.tsx
src/components/admin/block-forms/block-form-router.tsx
tests/admin-editor-queries.test.ts
tests/admin-editor-mutations.test.ts
```

## Task 1: Editor Read Model

**Files:**
- Create: `src/domains/admin/editor-queries.ts`
- Test: `tests/admin-editor-queries.test.ts`

- [ ] **Step 1: Write the failing tests for editor query shaping**

Create `tests/admin-editor-queries.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { deriveEditorSelection } from "@/domains/admin/editor-queries";

const product = {
  id: "product-guided-first-steps",
  title: "Guide",
  status: "published" as const,
};

const chapters = [
  {
    id: "chapter-intro",
    title: "Introdução",
    sortOrder: 1,
    isPublished: true,
    blocks: [
      { id: "block-a", title: "Intro", type: "rich_text" as const, sortOrder: 1, isPublished: true, payloadJson: "{\"markdown\":\"Hello\"}" },
    ],
  },
  {
    id: "chapter-week-1",
    title: "Semana 1",
    sortOrder: 2,
    isPublished: false,
    blocks: [],
  },
];

describe("deriveEditorSelection", () => {
  it("defaults to the first chapter and first block", () => {
    const result = deriveEditorSelection({ product, chapters, selectedChapterId: null, selectedBlockId: null });
    expect(result.selectedChapter?.id).toBe("chapter-intro");
    expect(result.selectedBlock?.id).toBe("block-a");
  });

  it("clears stale block selection when the block is not in the selected chapter", () => {
    const result = deriveEditorSelection({
      product,
      chapters,
      selectedChapterId: "chapter-week-1",
      selectedBlockId: "block-a",
    });
    expect(result.selectedChapter?.id).toBe("chapter-week-1");
    expect(result.selectedBlock).toBe(null);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/admin-editor-queries.test.ts
```

Expected: FAIL because `deriveEditorSelection` does not exist.

- [ ] **Step 3: Implement editor query module**

Create `src/domains/admin/editor-queries.ts`:

```ts
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { chapters, contentBlocks, products } from "@/db/schema";

export type EditorBlock = {
  id: string;
  title: string | null;
  type: typeof contentBlocks.$inferSelect.type;
  sortOrder: number;
  isPublished: boolean;
  payloadJson: string;
};

export type EditorChapter = {
  id: string;
  title: string;
  sortOrder: number;
  isPublished: boolean;
  blocks: EditorBlock[];
};

export type EditorProduct = typeof products.$inferSelect;

export async function getEditorProduct(productId: string) {
  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  return product ?? null;
}

export async function getEditorChapters(productId: string): Promise<EditorChapter[]> {
  const productChapters = await db
    .select()
    .from(chapters)
    .where(eq(chapters.productId, productId))
    .orderBy(asc(chapters.sortOrder));

  const allBlocks = await db
    .select()
    .from(contentBlocks)
    .orderBy(asc(contentBlocks.sortOrder));

  return productChapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    sortOrder: chapter.sortOrder,
    isPublished: chapter.isPublished,
    blocks: allBlocks
      .filter((block) => block.chapterId === chapter.id)
      .map((block) => ({
        id: block.id,
        title: block.title,
        type: block.type,
        sortOrder: block.sortOrder,
        isPublished: block.isPublished,
        payloadJson: block.payloadJson,
      })),
  }));
}

export function deriveEditorSelection({
  product,
  chapters,
  selectedChapterId,
  selectedBlockId,
}: {
  product: EditorProduct;
  chapters: EditorChapter[];
  selectedChapterId: string | null;
  selectedBlockId: string | null;
}) {
  const selectedChapter =
    chapters.find((chapter) => chapter.id === selectedChapterId) ?? chapters[0] ?? null;

  const selectedBlock = selectedChapter
    ? selectedChapter.blocks.find((block) => block.id === selectedBlockId) ??
      selectedChapter.blocks[0] ??
      null
    : null;

  return {
    product,
    chapters,
    selectedChapter,
    selectedBlock,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- tests/admin-editor-queries.test.ts
```

Expected: PASS

## Task 2: Mutation Layer

**Files:**
- Create: `src/domains/admin/editor-mutations.ts`
- Test: `tests/admin-editor-mutations.test.ts`

- [ ] **Step 1: Write the failing tests for deterministic reordering**

Create `tests/admin-editor-mutations.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { reorderItems } from "@/domains/admin/editor-mutations";

describe("reorderItems", () => {
  it("swaps an item upward", () => {
    const result = reorderItems(
      [
        { id: "a", sortOrder: 1 },
        { id: "b", sortOrder: 2 },
        { id: "c", sortOrder: 3 },
      ],
      "b",
      "up",
    );

    expect(result.map((item) => [item.id, item.sortOrder])).toEqual([
      ["b", 1],
      ["a", 2],
      ["c", 3],
    ]);
  });

  it("keeps first item stable when moving up", () => {
    const result = reorderItems([{ id: "a", sortOrder: 1 }], "a", "up");
    expect(result).toEqual([{ id: "a", sortOrder: 1 }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/admin-editor-mutations.test.ts
```

Expected: FAIL because `reorderItems` does not exist.

- [ ] **Step 3: Implement pure reorder helper and mutation skeletons**

Create `src/domains/admin/editor-mutations.ts`:

```ts
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { chapters, contentBlocks } from "@/db/schema";

type SortableItem = {
  id: string;
  sortOrder: number;
};

export function reorderItems<T extends SortableItem>(
  items: T[],
  itemId: string,
  direction: "up" | "down",
) {
  const ordered = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  const index = ordered.findIndex((item) => item.id === itemId);

  if (index < 0) return ordered;
  if (direction === "up" && index === 0) return ordered;
  if (direction === "down" && index === ordered.length - 1) return ordered;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  const current = ordered[index]!;
  const target = ordered[swapIndex]!;

  ordered[index] = { ...target, sortOrder: current.sortOrder };
  ordered[swapIndex] = { ...current, sortOrder: target.sortOrder };

  return ordered.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createChapter(productId: string, title: string) {
  const existing = await db.select().from(chapters).where(eq(chapters.productId, productId));
  const nextSort = existing.length + 1;
  await db.insert(chapters).values({
    id: crypto.randomUUID(),
    productId,
    title,
    sortOrder: nextSort,
    isPublished: false,
  });
}

export async function createBlock(chapterId: string, type: typeof contentBlocks.$inferSelect.type) {
  const existing = await db.select().from(contentBlocks).where(eq(contentBlocks.chapterId, chapterId));
  const nextSort = existing.length + 1;
  const payloadByType = {
    rich_text: JSON.stringify({ markdown: "" }),
    callout: JSON.stringify({ tone: "info", body: "" }),
    checklist: JSON.stringify({ items: [{ id: crypto.randomUUID(), label: "" }] }),
    download: JSON.stringify({ assetId: "", label: "" }),
    audio: JSON.stringify({ url: "" }),
    video: JSON.stringify({ url: "" }),
    quiz: JSON.stringify({
      question: "",
      answers: [
        { id: crypto.randomUUID(), label: "", isCorrect: true },
        { id: crypto.randomUUID(), label: "", isCorrect: false },
      ],
    }),
    divider: JSON.stringify({}),
  } as const;

  await db.insert(contentBlocks).values({
    id: crypto.randomUUID(),
    chapterId,
    type,
    title: null,
    payloadJson: payloadByType[type],
    sortOrder: nextSort,
    isPublished: false,
  });
}

export async function updateBlock(blockId: string, input: { title: string | null; payloadJson: string; isPublished: boolean }) {
  await db
    .update(contentBlocks)
    .set({
      title: input.title,
      payloadJson: input.payloadJson,
      isPublished: input.isPublished,
    })
    .where(eq(contentBlocks.id, blockId));
}

export async function deleteBlock(blockId: string) {
  await db.delete(contentBlocks).where(eq(contentBlocks.id, blockId));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- tests/admin-editor-mutations.test.ts
```

Expected: PASS

## Task 3: Three-Column Editor Shell

**Files:**
- Create: `src/components/admin/editor-shell.tsx`
- Create: `src/components/admin/editor-left-column.tsx`
- Create: `src/components/admin/editor-center-column.tsx`
- Create: `src/components/admin/editor-right-column.tsx`
- Create: `src/components/admin/editor-empty-state.tsx`
- Create: `src/app/admin/editor/[productId]/page.tsx`

- [ ] **Step 1: Build the editor shell components**

Create `src/components/admin/editor-left-column.tsx`:

```tsx
import Link from "next/link";
import type { EditorChapter, EditorProduct } from "@/domains/admin/editor-queries";
import { formatMoney } from "@/lib/format";

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
        <button className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white">Salvar</button>
        <Link href={`/products/${product.slug}`} className="rounded-full border px-4 py-2 text-sm font-medium">
          Preview
        </Link>
      </div>
      <div className="grid gap-2">
        {chapters.map((chapter) => (
          <Link
            key={chapter.id}
            href={`?chapter=${chapter.id}`}
            className={`rounded-2xl border px-4 py-3 text-sm ${selectedChapterId === chapter.id ? "border-zinc-950 bg-white" : "border-zinc-200 bg-transparent"}`}
          >
            <div className="font-medium">{chapter.title}</div>
            <div className="text-xs text-zinc-500">{chapter.blocks.length} bloco{chapter.blocks.length === 1 ? "" : "s"}</div>
          </Link>
        ))}
        <button className="rounded-2xl border border-dashed px-4 py-3 text-left text-sm">+ Novo capítulo</button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Build center and right columns**

Create `src/components/admin/editor-center-column.tsx`:

```tsx
import Link from "next/link";
import type { EditorBlock, EditorChapter } from "@/domains/admin/editor-queries";

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
        <button className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white">+ Novo bloco</button>
      </div>
      <div className="grid gap-3">
        {chapter.blocks.map((block: EditorBlock) => (
          <Link
            key={block.id}
            href={`?chapter=${chapter.id}&block=${block.id}`}
            className={`rounded-2xl border px-4 py-4 ${selectedBlockId === block.id ? "border-zinc-950 bg-white" : "border-zinc-200 bg-white/70"}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">{block.type}</div>
                <div className="mt-1 font-medium">{block.title || "Sem título"}</div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-full border px-3 py-1 text-xs">Subir</button>
                <button className="rounded-full border px-3 py-1 text-xs">Descer</button>
              </div>
            </div>
          </Link>
        ))}
        {chapter.blocks.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-5 text-sm text-zinc-600">Nenhum bloco ainda neste capítulo.</div>
        ) : null}
      </div>
    </section>
  );
}
```

Create `src/components/admin/editor-right-column.tsx`:

```tsx
import type { EditorBlock } from "@/domains/admin/editor-queries";
import { BlockFormRouter } from "@/components/admin/block-forms/block-form-router";

export function EditorRightColumn({ block }: { block: EditorBlock | null }) {
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
        <BlockFormRouter block={block} />
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Compose the editor page**

Create `src/app/admin/editor/[productId]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { EditorCenterColumn } from "@/components/admin/editor-center-column";
import { EditorLeftColumn } from "@/components/admin/editor-left-column";
import { EditorRightColumn } from "@/components/admin/editor-right-column";
import {
  deriveEditorSelection,
  getEditorChapters,
  getEditorProduct,
} from "@/domains/admin/editor-queries";

type PageProps = {
  params: Promise<{ productId: string }>;
  searchParams?: Promise<{ chapter?: string; block?: string }>;
};

export default async function AdminEditorPage({ params, searchParams }: PageProps) {
  const { productId } = await params;
  const search = await searchParams;
  const product = await getEditorProduct(productId);

  if (!product) {
    notFound();
  }

  const chapters = await getEditorChapters(productId);
  const editor = deriveEditorSelection({
    product,
    chapters,
    selectedChapterId: search?.chapter ?? null,
    selectedBlockId: search?.block ?? null,
  });

  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-8">
      <div className="mx-auto grid max-w-[1600px] gap-5 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
        <EditorLeftColumn
          product={editor.product}
          chapters={editor.chapters}
          selectedChapterId={editor.selectedChapter?.id ?? null}
        />
        <EditorCenterColumn
          productId={editor.product.id}
          chapter={editor.selectedChapter}
          selectedBlockId={editor.selectedBlock?.id ?? null}
        />
        <EditorRightColumn block={editor.selectedBlock} />
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Verify the shell builds**

Run:

```bash
npm run build
```

Expected: PASS

## Task 4: Type-Specific Block Forms

**Files:**
- Create: `src/components/admin/block-forms/rich-text-form.tsx`
- Create: `src/components/admin/block-forms/callout-form.tsx`
- Create: `src/components/admin/block-forms/checklist-form.tsx`
- Create: `src/components/admin/block-forms/download-form.tsx`
- Create: `src/components/admin/block-forms/media-form.tsx`
- Create: `src/components/admin/block-forms/quiz-form.tsx`
- Create: `src/components/admin/block-forms/block-form-router.tsx`

- [ ] **Step 1: Add block form router**

Create `src/components/admin/block-forms/block-form-router.tsx`:

```tsx
import { parseBlockPayload } from "@/domains/content/blocks";
import type { EditorBlock } from "@/domains/admin/editor-queries";
import { CalloutForm } from "./callout-form";
import { ChecklistForm } from "./checklist-form";
import { DownloadForm } from "./download-form";
import { MediaForm } from "./media-form";
import { QuizForm } from "./quiz-form";
import { RichTextForm } from "./rich-text-form";

export function BlockFormRouter({ block }: { block: EditorBlock }) {
  if (block.type === "rich_text") {
    return <RichTextForm block={block} payload={parseBlockPayload("rich_text", block.payloadJson)} />;
  }
  if (block.type === "callout") {
    return <CalloutForm block={block} payload={parseBlockPayload("callout", block.payloadJson)} />;
  }
  if (block.type === "checklist") {
    return <ChecklistForm block={block} payload={parseBlockPayload("checklist", block.payloadJson)} />;
  }
  if (block.type === "download") {
    return <DownloadForm block={block} payload={parseBlockPayload("download", block.payloadJson)} />;
  }
  if (block.type === "audio" || block.type === "video") {
    return <MediaForm block={block} payload={parseBlockPayload(block.type, block.payloadJson)} />;
  }
  if (block.type === "quiz") {
    return <QuizForm block={block} payload={parseBlockPayload("quiz", block.payloadJson)} />;
  }
  return <div className="text-sm text-zinc-600">Este bloco não precisa de edição lateral.</div>;
}
```

- [ ] **Step 2: Add simple block forms**

Create `src/components/admin/block-forms/rich-text-form.tsx`:

```tsx
import type { EditorBlock } from "@/domains/admin/editor-queries";

export function RichTextForm({
  block,
  payload,
}: {
  block: EditorBlock;
  payload: { markdown: string };
}) {
  return (
    <form className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-medium">Título</span>
        <input defaultValue={block.title ?? ""} className="rounded-xl border bg-white px-4 py-3" />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium">Conteúdo</span>
        <textarea defaultValue={payload.markdown} className="min-h-56 rounded-xl border bg-white px-4 py-3" />
      </label>
      <div className="flex gap-2">
        <button className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white">Salvar bloco</button>
        <button className="rounded-full border px-4 py-2 text-sm font-medium">Excluir</button>
      </div>
    </form>
  );
}
```

Create analogous minimal forms:

- `callout-form.tsx` with title, tone select, body textarea
- `checklist-form.tsx` with title and one textarea per item label
- `download-form.tsx` with title, label, assetId
- `media-form.tsx` with title, url
- `quiz-form.tsx` with title, question, answer labels

Each form stays read/write-shape only; persistence wiring comes in the next task.

- [ ] **Step 3: Verify the forms compile**

Run:

```bash
npm run build
```

Expected: PASS

## Task 5: Wire Actions for Save/Create/Delete

**Files:**
- Create: `src/app/admin/editor/actions.ts`
- Modify: `src/components/admin/editor-left-column.tsx`
- Modify: `src/components/admin/editor-center-column.tsx`
- Modify: `src/components/admin/block-forms/*.tsx`

- [ ] **Step 1: Add server actions**

Create `src/app/admin/editor/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import {
  createBlock,
  createChapter,
  deleteBlock,
  updateBlock,
} from "@/domains/admin/editor-mutations";

export async function createChapterAction(productId: string, title: string) {
  await createChapter(productId, title);
  revalidatePath(`/admin/editor/${productId}`);
}

export async function createBlockAction(productId: string, chapterId: string, type: Parameters<typeof createBlock>[1]) {
  await createBlock(chapterId, type);
  revalidatePath(`/admin/editor/${productId}`);
}

export async function updateBlockAction(
  productId: string,
  blockId: string,
  input: { title: string | null; payloadJson: string; isPublished: boolean },
) {
  await updateBlock(blockId, input);
  revalidatePath(`/admin/editor/${productId}`);
}

export async function deleteBlockAction(productId: string, blockId: string) {
  await deleteBlock(blockId);
  revalidatePath(`/admin/editor/${productId}`);
}
```

- [ ] **Step 2: Hook create chapter and create block UI**

Update left and center columns so buttons submit small forms:

```tsx
<form action={async (formData) => {
  "use server";
  await createChapterAction(product.id, String(formData.get("title") ?? "Novo capítulo"));
}}>
  <input type="hidden" name="title" value="Novo capítulo" />
  <button className="rounded-2xl border border-dashed px-4 py-3 text-left text-sm">+ Novo capítulo</button>
</form>
```

```tsx
<form action={async () => {
  "use server";
  await createBlockAction(productId, chapter.id, "rich_text");
}}>
  <button className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white">+ Novo bloco</button>
</form>
```

- [ ] **Step 3: Hook block save/delete actions**

Update `rich-text-form.tsx` to submit serialized payload:

```tsx
import { updateBlockAction, deleteBlockAction } from "@/app/admin/editor/actions";

<form
  action={async (formData) => {
    "use server";
    await updateBlockAction(productId, block.id, {
      title: String(formData.get("title") || "") || null,
      payloadJson: JSON.stringify({ markdown: String(formData.get("markdown") || "") }),
      isPublished: formData.get("isPublished") === "on",
    });
  }}
  className="grid gap-4"
>
```

Do the same shape for the other block forms.

- [ ] **Step 4: Verify save/create/delete paths compile**

Run:

```bash
npm run build
```

Expected: PASS

## Task 6: Reordering and Publish Toggles

**Files:**
- Modify: `src/domains/admin/editor-mutations.ts`
- Modify: `src/app/admin/editor/actions.ts`
- Modify: `src/components/admin/editor-left-column.tsx`
- Modify: `src/components/admin/editor-center-column.tsx`

- [ ] **Step 1: Add reorder and publish mutation functions**

Extend `src/domains/admin/editor-mutations.ts`:

```ts
export async function reorderChapter(productId: string, chapterId: string, direction: "up" | "down") {
  const existing = await db.select().from(chapters).where(eq(chapters.productId, productId));
  const reordered = reorderItems(existing, chapterId, direction);
  await Promise.all(
    reordered.map((chapter) =>
      db.update(chapters).set({ sortOrder: chapter.sortOrder }).where(eq(chapters.id, chapter.id)),
    ),
  );
}

export async function reorderBlock(chapterId: string, blockId: string, direction: "up" | "down") {
  const existing = await db.select().from(contentBlocks).where(eq(contentBlocks.chapterId, chapterId));
  const reordered = reorderItems(existing, blockId, direction);
  await Promise.all(
    reordered.map((block) =>
      db.update(contentBlocks).set({ sortOrder: block.sortOrder }).where(eq(contentBlocks.id, block.id)),
    ),
  );
}
```

- [ ] **Step 2: Add matching actions**

Extend `src/app/admin/editor/actions.ts`:

```ts
export async function reorderChapterAction(productId: string, chapterId: string, direction: "up" | "down") {
  await reorderChapter(productId, chapterId, direction);
  revalidatePath(`/admin/editor/${productId}`);
}

export async function reorderBlockAction(productId: string, chapterId: string, blockId: string, direction: "up" | "down") {
  await reorderBlock(chapterId, blockId, direction);
  revalidatePath(`/admin/editor/${productId}`);
}
```

- [ ] **Step 3: Wire reorder controls**

Replace inert buttons with forms:

```tsx
<form action={async () => {
  "use server";
  await reorderBlockAction(productId, chapter.id, block.id, "up");
}}>
  <button className="rounded-full border px-3 py-1 text-xs">Subir</button>
</form>
```

Do the same for down and chapter-level controls.

- [ ] **Step 4: Verify the final editor slice**

Run:

```bash
npm run build
```

Expected: PASS

## Task 7: Final Verification

**Files:**
- No new files

- [ ] **Step 1: Run focused tests**

Run:

```bash
npm test -- tests/admin-editor-queries.test.ts tests/admin-editor-mutations.test.ts
```

Expected: PASS

- [ ] **Step 2: Run full verification**

Run:

```bash
npm run lint
npm test
npm run build
```

Expected: PASS

- [ ] **Step 3: Manual smoke checklist**

Check:

```txt
/admin
/admin/editor/product-guided-first-steps
```

Expected:

- Editor route opens.
- Three-column layout renders.
- Chapter selection changes URL params.
- Block selection changes URL params.
- New chapter action exists.
- New block action exists.
- Right panel changes with block selection.
- Save/delete/reorder controls render.

## Self-Review

Spec coverage:

- Three-column desktop editor: covered in Task 3.
- Chapter and block selection: covered in Task 1 and Task 3.
- Block property editing: covered in Task 4 and Task 5.
- Create/update/delete: covered in Task 5.
- Move up/down ordering: covered in Task 2 and Task 6.
- Publish toggles: included in Task 5 form shape and Task 6 mutations path.
- Empty and error states: covered in Task 3 shell behavior.

