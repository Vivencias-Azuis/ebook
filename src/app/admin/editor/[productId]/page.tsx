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
  searchParams: Promise<{ chapter?: string; block?: string }>;
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
    selectedChapterId: search.chapter ?? null,
    selectedBlockId: search.block ?? null,
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
        <EditorRightColumn block={editor.selectedBlock} productId={editor.product.id} />
      </div>
    </main>
  );
}
