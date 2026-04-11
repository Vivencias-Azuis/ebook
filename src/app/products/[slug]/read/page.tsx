import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireServerSession } from "@/domains/auth/server";
import { canAccessProduct, getUserProductEntitlement } from "@/domains/orders/access";
import { parseBlockPayload } from "@/domains/content/blocks";
import {
  getUserProductProgress,
  summarizeProductProgress,
} from "@/domains/progress/queries";
import {
  setBlockCompletion,
  setChecklistProgress,
} from "@/domains/progress/mutations";
import { getProductBySlug, getPublishedProductContent } from "@/domains/products/queries";
import { BlockRenderer } from "@/features/reader/block-renderer";
import {
  buildReaderPages,
  normalizeReaderPageNumber,
} from "@/features/reader/pagination";
import { ReaderSidebar } from "@/features/reader/reader-sidebar";

type ProductReadPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string | string[];
  }>;
};

function readerPageHref(slug: string, pageNumber: number) {
  return `/products/${slug}/read?page=${pageNumber}`;
}

export default async function ProductReadPage({
  params,
  searchParams,
}: ProductReadPageProps) {
  const session = await requireServerSession();
  const { slug } = await params;
  const { page } = await searchParams;
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "published") {
    notFound();
  }

  const entitlement = await getUserProductEntitlement(session.user.id, product.id);

  if (!canAccessProduct(entitlement)) {
    redirect(`/products/${product.slug}`);
  }

  const chapters = await getPublishedProductContent(product.id);
  const progressByBlockId = await getUserProductProgress(session.user.id, product.id);
  const progressSummary = summarizeProductProgress(chapters, progressByBlockId);
  const readerPages = buildReaderPages(chapters);
  const currentPageNumber = normalizeReaderPageNumber(page, readerPages.length);
  const currentPage = readerPages[currentPageNumber - 1] ?? null;
  const currentBlock = currentPage?.block ?? null;
  const previousPage = currentPageNumber > 1 ? currentPageNumber - 1 : null;
  const nextPage = currentPageNumber < readerPages.length ? currentPageNumber + 1 : null;
  const progressLabel =
    progressSummary.percent === 100
      ? "Guia concluído"
      : progressSummary.percent > 0
        ? "Você já começou"
        : "Comece com calma";

  return (
    <main className="va-reader-page min-h-screen overflow-hidden text-[color:var(--va-ink)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="va-reader-bar mb-5 flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <Link
            href="/library"
            className="inline-flex w-fit items-center rounded-full border border-[color:var(--va-line)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--va-blue-800)] shadow-[0_14px_26px_-22px_rgba(11,35,66,0.28)] hover:-translate-y-0.5 hover:bg-[color:var(--va-blue-100)]"
          >
            ← Biblioteca
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[color:var(--va-soft-ink)]">
            <span className="rounded-full border border-[color:var(--va-line)] bg-white px-3 py-1">
              Página {currentPageNumber} de {Math.max(readerPages.length, 1)}
            </span>
            <span className="rounded-full border border-[color:var(--va-blue-100)] bg-[color:var(--va-blue-100)] px-3 py-1 text-[color:var(--va-blue-800)]">
              {progressSummary.percent}% · {progressLabel}
            </span>
          </div>
        </header>

        <section className="grid flex-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <ReaderSidebar
            productTitle={product.title}
            productSlug={product.slug}
            currentPageNumber={currentPageNumber}
            progressPercent={progressSummary.percent}
            readerPages={readerPages}
            progressByBlockId={progressByBlockId}
          />

          <div className="order-1 flex min-h-[calc(100vh-7rem)] flex-col lg:order-2">
            <article className="va-reader-panel relative flex flex-1 flex-col overflow-hidden">
              <div className="border-b border-[color:var(--va-line)] bg-[linear-gradient(180deg,#ffffff_0%,rgba(247,251,255,0.72)_100%)] px-6 py-6 sm:px-9">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-[color:var(--va-blue-700)]">
                  Capítulo {currentPage?.chapterSortOrder ?? 1}
                </p>
                <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight tracking-[-0.03em] text-[color:var(--va-navy)] sm:text-5xl">
                  {currentPage?.chapterTitle ?? "Leitura"}
                </h2>
                {currentBlock?.title ? (
                  <p className="mt-3 text-base font-semibold text-[color:var(--va-soft-ink)]">
                    {currentBlock.title}
                  </p>
                ) : null}
              </div>

              <div className="flex-1 px-6 py-7 sm:px-9 lg:px-12 lg:py-10">
                {!currentPage ? (
                  <div className="rounded-[1.5rem] border border-dashed border-[color:var(--va-line-strong)] bg-[color:var(--va-paper)] p-6 text-sm text-[color:var(--va-soft-ink)]">
                    Nenhuma página publicada ainda.
                  </div>
                ) : null}

                {currentPage && !currentBlock ? (
                  <div className="rounded-[1.5rem] border border-dashed border-[color:var(--va-line-strong)] bg-[color:var(--va-paper)] p-6 text-sm text-[color:var(--va-soft-ink)]">
                    Este capítulo ainda não tem conteúdo publicado.
                  </div>
                ) : null}

                {currentBlock?.type === "checklist" ? (
                  <div className="mx-auto max-w-3xl rounded-[1.5rem] border border-[color:var(--va-line)] bg-[linear-gradient(180deg,rgba(215,231,247,0.4)_0%,rgba(255,255,255,0.96)_100%)] p-5 text-[color:var(--va-soft-ink)]">
                    <p className="font-serif text-xl font-semibold text-[color:var(--va-navy)]">
                      Transforme esta página em ação.
                    </p>
                    <p className="mt-2 leading-7">
                      Marque abaixo o que já foi feito e volte quando precisar continuar.
                    </p>
                  </div>
                ) : null}

                {currentBlock && currentBlock.type !== "checklist" ? (
                  <div className="mx-auto max-w-3xl">
                    <BlockRenderer
                      type={currentBlock.type}
                      title={null}
                      payloadJson={currentBlock.payloadJson}
                      progressState={progressByBlockId[currentBlock.id] ?? null}
                    />
                  </div>
                ) : null}
              </div>

              {currentBlock ? (
                <div className="border-t border-[color:var(--va-line)] px-6 py-5 sm:px-9">
                  {currentBlock.type === "checklist" ? (
                    <form
                      action={async (formData: FormData) => {
                        "use server";
                        const checkedItemIds = formData
                          .getAll("checkedItemIds")
                          .map(String);
                        const allItemIds = formData.getAll("allItemIds").map(String);

                        await setChecklistProgress({
                          userId: session.user.id,
                          productId: product.id,
                          chapterId: currentPage?.chapterId ?? "",
                          blockId: currentBlock.id,
                          allItemIds,
                          checkedItemIds,
                        });
                        revalidatePath(readerPageHref(product.slug, currentPageNumber));
                        revalidatePath("/library");
                      }}
                      className="rounded-[1.5rem] border border-[color:var(--va-line)] bg-[linear-gradient(180deg,#ffffff_0%,rgba(215,231,247,0.28)_100%)] p-5 shadow-[0_18px_50px_-42px_rgba(11,35,66,0.28)]"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--va-blue-700)]">
                        Plano de ação
                      </p>
                      <div className="mt-4 grid gap-3">
                        {parseBlockPayload("checklist", currentBlock.payloadJson).items.map((item) => (
                          <label key={item.id} className="flex items-start gap-3 rounded-[1rem] border border-[color:var(--va-line)] bg-white px-3 py-3 text-sm text-[color:var(--va-ink)]">
                            <input type="hidden" name="allItemIds" value={item.id} />
                            <input
                              type="checkbox"
                              name="checkedItemIds"
                              value={item.id}
                              defaultChecked={
                                progressByBlockId[currentBlock.id]?.checkedItemIds?.includes(item.id) ??
                                false
                              }
                              className="mt-1 h-4 w-4 rounded border-[color:var(--va-line-strong)] text-[color:var(--va-blue)]"
                            />
                            <span className="leading-6">{item.label}</span>
                          </label>
                        ))}
                      </div>
                      <button
                        type="submit"
                        className="mt-5 rounded-full bg-[color:var(--va-navy)] px-5 py-2.5 text-sm font-bold text-white shadow-[0_18px_38px_-28px_rgba(11,35,66,0.42)] hover:-translate-y-0.5 hover:bg-[color:var(--va-blue-800)]"
                      >
                        Salvar checklist
                      </button>
                    </form>
                  ) : (
                    <form
                      action={async () => {
                        "use server";
                        await setBlockCompletion({
                          userId: session.user.id,
                          productId: product.id,
                          chapterId: currentPage?.chapterId ?? "",
                          blockId: currentBlock.id,
                          completed: !progressByBlockId[currentBlock.id]?.completed,
                        });
                        revalidatePath(readerPageHref(product.slug, currentPageNumber));
                        revalidatePath("/library");
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-full border border-[color:var(--va-line-strong)] bg-white px-5 py-2.5 text-sm font-bold text-[color:var(--va-blue-800)] shadow-[0_14px_34px_-30px_rgba(11,35,66,0.24)] hover:-translate-y-0.5 hover:bg-[color:var(--va-blue-100)]"
                      >
                        {progressByBlockId[currentBlock.id]?.completed
                          ? "Marcar como pendente"
                          : "Marcar página como lida"}
                      </button>
                    </form>
                  )}
                </div>
              ) : null}
            </article>

            <nav className="va-reader-bar mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-3" aria-label="Navegação entre páginas">
              {previousPage ? (
                <Link
                  href={readerPageHref(product.slug, previousPage)}
                  className="justify-self-start rounded-full border border-[color:var(--va-line)] bg-white px-4 py-2 text-sm font-bold text-[color:var(--va-blue-800)] hover:-translate-y-0.5 hover:bg-[color:var(--va-blue-100)]"
                >
                  ← Anterior
                </Link>
              ) : (
                <span />
              )}

              <span className="text-center text-sm font-bold text-[color:var(--va-soft-ink)]">
                {currentPageNumber} / {Math.max(readerPages.length, 1)}
              </span>

              {nextPage ? (
                <Link
                  href={readerPageHref(product.slug, nextPage)}
                  className="justify-self-end rounded-full bg-[color:var(--va-navy)] px-4 py-2 text-sm font-bold text-white shadow-[0_18px_38px_-28px_rgba(11,35,66,0.62)] hover:-translate-y-0.5 hover:bg-[color:var(--va-blue-800)]"
                >
                  Próxima →
                </Link>
              ) : (
                <Link
                  href="/library"
                  className="justify-self-end rounded-full bg-[color:var(--va-navy)] px-4 py-2 text-sm font-bold text-white shadow-[0_18px_38px_-28px_rgba(11,35,66,0.62)] hover:-translate-y-0.5 hover:bg-[color:var(--va-blue-800)]"
                >
                  Finalizar
                </Link>
              )}
            </nav>
          </div>
        </section>
      </div>
    </main>
  );
}
