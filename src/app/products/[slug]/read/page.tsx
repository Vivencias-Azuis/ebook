import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireServerSession } from "@/domains/auth/server";
import {
  canAccessProduct,
  getUserProductEntitlement,
} from "@/domains/orders/access";
import { parseBlockPayload } from "@/domains/content/blocks";
import {
  getUserProductProgress,
  summarizeProductProgress,
} from "@/domains/progress/queries";
import {
  setBlockCompletion,
  setChecklistProgress,
} from "@/domains/progress/mutations";
import {
  getProductBySlug,
  getPublishedProductContent,
} from "@/domains/products/queries";
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

  const entitlement = await getUserProductEntitlement(
    session.user.id,
    product.id,
  );

  if (!canAccessProduct(entitlement)) {
    redirect(`/products/${product.slug}`);
  }

  const chapters = await getPublishedProductContent(product.id);
  const progressByBlockId = await getUserProductProgress(
    session.user.id,
    product.id,
  );
  const progressSummary = summarizeProductProgress(chapters, progressByBlockId);
  const readerPages = buildReaderPages(chapters);
  const currentPageNumber = normalizeReaderPageNumber(page, readerPages.length);
  const currentPage = readerPages[currentPageNumber - 1] ?? null;
  const currentBlock = currentPage?.block ?? null;
  const currentSourceBlockId =
    currentPage?.sourceBlockId ?? currentBlock?.id ?? null;
  const previousPage = currentPageNumber > 1 ? currentPageNumber - 1 : null;
  const nextPage =
    currentPageNumber < readerPages.length ? currentPageNumber + 1 : null;
  const slideLabel = `Etapa ${currentPageNumber} de ${Math.max(readerPages.length, 1)}`;
  const slideDetailLabel =
    currentPage && currentPage.slideCount > 1
      ? `Parte ${currentPage.slideNumber} de ${currentPage.slideCount}`
      : "Slide completo";
  const blockProgress = currentSourceBlockId
    ? progressByBlockId[currentSourceBlockId] ?? null
    : null;
  const renderedPayloadJson = currentBlock?.payloadJson ?? null;
  const progressLabel =
    progressSummary.percent === 100
      ? "Guia concluído"
      : progressSummary.percent > 0
        ? "Você já começou"
        : "Comece com calma";

  return (
    <main className="va-reader-page va-reader-shell min-h-screen overflow-hidden text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="va-reader-topbar mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/library"
            className="va-reader-ghost-button inline-flex w-fit items-center rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/14"
          >
            ← Biblioteca
          </Link>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">
              {slideLabel}
            </p>
            <p className="mt-1 text-sm font-semibold text-white/82">
              {progressSummary.percent}% concluído
            </p>
            <p className="mt-1 text-sm text-white/60">{progressLabel}</p>
          </div>
        </header>

        <section className="grid flex-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <ReaderSidebar
            productTitle={product.title}
            productSlug={product.slug}
            currentPageNumber={currentPageNumber}
            progressPercent={progressSummary.percent}
            readerPages={readerPages}
            progressByBlockId={progressByBlockId}
          />

          <div className="order-1 flex min-h-[calc(100vh-8rem)] flex-col gap-4 lg:order-2">
            <div className="va-reader-stage">
              <article className="va-reader-slide relative flex flex-1 flex-col overflow-hidden">
                <div className="va-reader-slide-header border-b border-white/10 px-6 py-6 sm:px-9">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.26em] text-[color:var(--va-blue-300)]">
                        Capítulo {currentPage?.chapterSortOrder ?? 1}
                      </p>
                      <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-5xl">
                        {currentBlock?.title ?? currentPage?.chapterTitle ?? "Leitura"}
                      </h2>
                    </div>
                    <div className="text-right text-sm text-white/70">
                      <p className="font-semibold text-white/88">{slideLabel}</p>
                      <p className="mt-1">{slideDetailLabel}</p>
                    </div>
                  </div>
                  {currentBlock?.title ? (
                    <p className="mt-3 text-base font-semibold text-white/68">
                      {currentPage?.chapterTitle}
                    </p>
                  ) : null}
                </div>

                <div className="va-reader-slide-body flex-1 px-6 py-7 sm:px-9 lg:px-12 lg:py-10">
                  {!currentPage ? (
                    <div className="rounded-[1.5rem] border border-dashed border-white/20 bg-white/6 p-6 text-sm text-white/72">
                      Nenhuma página publicada ainda.
                    </div>
                  ) : null}

                  {currentPage && !currentBlock ? (
                    <div className="rounded-[1.5rem] border border-dashed border-white/20 bg-white/6 p-6 text-sm text-white/72">
                      Este capítulo ainda não tem conteúdo publicado.
                    </div>
                  ) : null}

                  {currentBlock?.type === "checklist" ? (
                    <div className="mx-auto max-w-3xl rounded-[1.5rem] border border-white/12 bg-white/8 p-5 text-white/72">
                      <p className="font-serif text-xl font-semibold text-white">
                        Transforme esta página em ação.
                      </p>
                      <p className="mt-2 leading-7">
                        Marque abaixo o que já foi feito e volte quando precisar
                        continuar.
                      </p>
                    </div>
                  ) : null}

                  {currentBlock && currentBlock.type !== "checklist" && renderedPayloadJson ? (
                    <div className="mx-auto max-w-3xl">
                      <BlockRenderer
                        type={currentBlock.type}
                        title={null}
                        payloadJson={renderedPayloadJson}
                        progressState={blockProgress}
                      />
                    </div>
                  ) : null}
                </div>

                {currentBlock ? (
                  <div className="border-t border-white/10 px-6 py-5 sm:px-9">
                    {currentBlock.type === "checklist" ? (
                      <form
                        action={async (formData: FormData) => {
                          "use server";
                          const checkedItemIds = formData
                            .getAll("checkedItemIds")
                            .map(String);
                          const allItemIds = formData
                            .getAll("allItemIds")
                            .map(String);

                          await setChecklistProgress({
                            userId: session.user.id,
                            productId: product.id,
                            chapterId: currentPage?.chapterId ?? "",
                            blockId: currentSourceBlockId ?? currentBlock.id,
                            allItemIds,
                            checkedItemIds,
                          });
                          revalidatePath(
                            readerPageHref(product.slug, currentPageNumber),
                          );
                          revalidatePath("/library");
                        }}
                        className="rounded-[1.5rem] border border-[color:var(--va-line)] bg-[linear-gradient(180deg,#ffffff_0%,rgba(215,231,247,0.28)_100%)] p-5 shadow-[0_18px_50px_-42px_rgba(11,35,66,0.28)]"
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--va-blue-700)]">
                          Plano de ação
                        </p>
                        <div className="mt-4 grid gap-3">
                          {parseBlockPayload(
                            "checklist",
                            currentBlock.payloadJson,
                          ).items.map((item) => (
                            <label
                              key={item.id}
                              className="flex items-start gap-3 rounded-[1rem] border border-[color:var(--va-line)] bg-white px-3 py-3 text-sm text-[color:var(--va-ink)]"
                            >
                              <input
                                type="hidden"
                                name="allItemIds"
                                value={item.id}
                              />
                              <input
                                type="checkbox"
                                name="checkedItemIds"
                                value={item.id}
                                defaultChecked={
                                  blockProgress?.checkedItemIds?.includes(item.id) ?? false
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
                            blockId: currentSourceBlockId ?? currentBlock.id,
                            completed: !blockProgress?.completed,
                          });
                          revalidatePath(
                            readerPageHref(product.slug, currentPageNumber),
                          );
                          revalidatePath("/library");
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-full border border-[color:var(--va-line-strong)] bg-white px-5 py-2.5 text-sm font-bold text-[color:var(--va-blue-800)] shadow-[0_14px_34px_-30px_rgba(11,35,66,0.24)] hover:-translate-y-0.5 hover:bg-[color:var(--va-blue-100)]"
                        >
                          {blockProgress?.completed
                            ? "Marcar como pendente"
                            : "Marcar página como lida"}
                        </button>
                      </form>
                    )}
                  </div>
                ) : null}
              </article>
            </div>

            <nav
              className="va-reader-nav grid grid-cols-[1fr_auto_1fr] items-center gap-3"
              aria-label="Navegação entre etapas"
            >
              {previousPage ? (
                <Link
                  href={readerPageHref(product.slug, previousPage)}
                  className="va-reader-nav-secondary justify-self-start rounded-full border border-white/16 bg-white/8 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/14"
                >
                  Anterior
                </Link>
              ) : (
                <span />
              )}

              <span className="text-center text-sm font-bold text-white/70">
                {slideLabel}
              </span>

              {nextPage ? (
                <Link
                  href={readerPageHref(product.slug, nextPage)}
                  className="va-reader-nav-primary justify-self-end rounded-full bg-white px-4 py-2 text-sm font-bold text-[color:var(--va-navy)] transition hover:-translate-y-0.5 hover:bg-[color:var(--va-blue-100)]"
                >
                  Continuar
                </Link>
              ) : (
                <Link
                  href="/library"
                  className="va-reader-nav-primary justify-self-end rounded-full bg-white px-4 py-2 text-sm font-bold text-[color:var(--va-navy)] transition hover:-translate-y-0.5 hover:bg-[color:var(--va-blue-100)]"
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
