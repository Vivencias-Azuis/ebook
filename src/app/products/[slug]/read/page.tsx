import Link from "next/link";
import { notFound } from "next/navigation";
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
  estimateReadingMinutes,
  normalizeReaderPageNumber,
} from "@/features/reader/pagination";
import {
  ReaderPaywallTrigger,
  ReaderPreviewShell,
} from "@/features/reader/reader-preview-shell";
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
  const hasFullAccess = canAccessProduct(entitlement);

  const chapters = await getPublishedProductContent(product.id);
  const progressByBlockId = await getUserProductProgress(
    session.user.id,
    product.id,
  );
  const progressSummary = summarizeProductProgress(chapters, progressByBlockId);
  const readerPages = buildReaderPages(chapters);
  const previewChapterId = chapters[0]?.id ?? null;
  const accessibleReaderPages =
    hasFullAccess || !previewChapterId
      ? readerPages
      : readerPages.filter(
          (readerPage) => readerPage.chapterId === previewChapterId,
        );
  const currentPageNumber = normalizeReaderPageNumber(
    page,
    accessibleReaderPages.length,
  );
  const currentPage = accessibleReaderPages[currentPageNumber - 1] ?? null;
  const currentBlock = currentPage?.block ?? null;
  const currentSourceBlockId =
    currentPage?.sourceBlockId ?? currentBlock?.id ?? null;
  const previousPage = currentPageNumber > 1 ? currentPageNumber - 1 : null;
  const nextPage =
    currentPageNumber < accessibleReaderPages.length
      ? currentPageNumber + 1
      : null;
  const totalPagesVisible = Math.max(accessibleReaderPages.length, 1);
  const slideLabel = `Etapa ${currentPageNumber} de ${totalPagesVisible}`;
  const slideDetailLabel =
    currentPage && currentPage.slideCount > 1
      ? `Parte ${currentPage.slideNumber} de ${currentPage.slideCount}`
      : "Slide completo";
  const readingMinutes = estimateReadingMinutes(currentBlock);
  const slideProgressPercent = Math.min(
    100,
    Math.round((currentPageNumber / totalPagesVisible) * 100),
  );
  const blockProgress = currentSourceBlockId
    ? (progressByBlockId[currentSourceBlockId] ?? null)
    : null;
  const renderedPayloadJson = currentBlock?.payloadJson ?? null;
  const progressLabel =
    progressSummary.percent === 100
      ? "Guia concluído"
      : progressSummary.percent > 0
        ? "Você já começou"
        : "Comece com calma";
  const accessiblePageNumbers = new Set(
    accessibleReaderPages.map((readerPage) => readerPage.pageNumber),
  );
  const isPreviewMode = !hasFullAccess;
  const shouldOpenPaywall =
    isPreviewMode &&
    accessibleReaderPages.length > 0 &&
    currentPageNumber === accessibleReaderPages.length;

  return (
    <ReaderPreviewShell
      isPreviewMode={isPreviewMode}
      shouldOpenPaywall={shouldOpenPaywall}
      productId={product.id}
    >
      <main className="va-reader-page va-reader-shell min-h-screen overflow-hidden text-white">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
          <header className="va-reader-bar va-reader-topbar mb-4 flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <Link
                href="/library"
                className="va-reader-ghost-button inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/82 transition hover:-translate-y-0.5 hover:bg-white/14"
              >
                <span aria-hidden>←</span>
                <span>Biblioteca</span>
              </Link>
              <span
                className="hidden h-6 w-px bg-white/12 sm:block"
                aria-hidden
              />
              <p className="hidden text-xs uppercase tracking-[0.22em] text-white/55 sm:block">
                {slideLabel}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10"
                  aria-hidden
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[color:var(--va-blue-300)] to-white"
                    style={{ width: `${progressSummary.percent}%` }}
                  />
                </div>
                <p className="text-xs font-semibold text-white/78">
                  {progressSummary.percent}%{" "}
                  <span className="text-white/50">· {progressLabel}</span>
                </p>
              </div>
              <ReaderPaywallTrigger
                data-paywall-trigger="header"
                className="inline-flex w-fit items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--va-navy)] transition hover:-translate-y-0.5 hover:bg-[color:var(--va-blue-100)]"
              >
                Comprar
              </ReaderPaywallTrigger>
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
              accessiblePageNumbers={accessiblePageNumbers}
              isPreviewMode={isPreviewMode}
            />

            <div className="order-1 flex min-h-[calc(100vh-8rem)] flex-col gap-4 lg:order-2">
              <div className="va-reader-stage flex min-h-[calc(100vh-8rem)]">
                <article className="va-reader-slide relative flex flex-1 flex-col">
                  <div className="va-reader-slide-header px-8 py-7 sm:px-12 sm:py-9">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="va-reader-kicker">
                          Capítulo{" "}
                          {String(currentPage?.chapterSortOrder ?? 1).padStart(
                            2,
                            "0",
                          )}
                          {currentBlock
                            ? ` · ≈${readingMinutes} min de leitura`
                            : ""}
                        </p>
                        <h2 className="mt-4 font-serif text-[2.4rem] font-semibold leading-[1.08] tracking-[-0.02em] text-[color:var(--va-navy)] sm:text-[2.8rem]">
                          {currentBlock?.title ??
                            currentPage?.chapterTitle ??
                            "Leitura"}
                        </h2>
                        {currentBlock?.title &&
                        currentBlock.title !== currentPage?.chapterTitle ? (
                          <p className="mt-3 font-serif text-base italic text-[color:var(--va-soft-ink)]">
                            em {currentPage?.chapterTitle}
                          </p>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-right font-serif text-sm text-[color:var(--va-soft-ink)]">
                        <p className="font-semibold text-[color:var(--va-navy)]">
                          {currentPageNumber}
                          <span className="mx-1 text-[color:var(--va-muted)]">
                            /
                          </span>
                          {totalPagesVisible}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[color:var(--va-muted)]">
                          {slideDetailLabel}
                        </p>
                      </div>
                    </div>
                    <div className="va-reader-slide-progress">
                      <span style={{ width: `${slideProgressPercent}%` }} />
                    </div>
                  </div>

                  <div className="va-reader-slide-body flex-1 px-8 py-10 sm:px-12 lg:px-16 lg:py-14">
                    {!currentPage ? (
                      <div className="mx-auto max-w-xl rounded-[1rem] border border-dashed border-[color:var(--va-line-strong)] bg-white/50 p-6 text-center text-sm text-[color:var(--va-soft-ink)]">
                        Nenhuma página publicada ainda.
                      </div>
                    ) : null}

                    {currentPage && !currentBlock ? (
                      <div className="mx-auto max-w-xl rounded-[1rem] border border-dashed border-[color:var(--va-line-strong)] bg-white/50 p-6 text-center text-sm text-[color:var(--va-soft-ink)]">
                        Este capítulo ainda não tem conteúdo publicado.
                      </div>
                    ) : null}

                    {currentBlock?.type === "checklist" ? (
                      <div className="mx-auto mb-6 max-w-[40rem] border-l-2 border-[color:var(--va-blue)] pl-5">
                        <p className="font-serif text-xl italic text-[color:var(--va-navy)]">
                          Transforme esta página em ação.
                        </p>
                        <p className="mt-2 font-serif text-base leading-7 text-[color:var(--va-soft-ink)]">
                          Marque abaixo o que já foi feito. Volte quando
                          precisar continuar.
                        </p>
                      </div>
                    ) : null}

                    {currentBlock &&
                    currentBlock.type !== "checklist" &&
                    renderedPayloadJson ? (
                      <div className="mx-auto max-w-[40rem]">
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
                    <div className="border-t border-[color:var(--va-line)] bg-[rgba(248,244,237,0.6)] px-8 py-5 sm:px-12">
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
                                    blockProgress?.checkedItemIds?.includes(
                                      item.id,
                                    ) ?? false
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
                          {currentPage?.slideCount &&
                          currentPage.slideCount > 1 ? (
                            <p className="mb-3 text-sm text-[color:var(--va-soft-ink)]">
                              Esta etapa faz parte de um bloco maior. O status
                              vale para todas as partes deste bloco.
                            </p>
                          ) : null}
                          <button
                            type="submit"
                            className="rounded-full border border-[color:var(--va-line-strong)] bg-white px-5 py-2.5 text-sm font-bold text-[color:var(--va-blue-800)] shadow-[0_14px_34px_-30px_rgba(11,35,66,0.24)] hover:-translate-y-0.5 hover:bg-[color:var(--va-blue-100)]"
                          >
                            {blockProgress?.completed
                              ? "Marcar bloco como pendente"
                              : "Marcar bloco como lido"}
                          </button>
                        </form>
                      )}
                    </div>
                  ) : null}
                </article>
              </div>

              <nav
                className="va-reader-bar va-reader-nav grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-2.5"
                aria-label="Navegação entre etapas"
              >
                {previousPage ? (
                  <Link
                    href={readerPageHref(product.slug, previousPage)}
                    className="va-reader-nav-secondary group inline-flex w-fit items-center gap-2 justify-self-start rounded-full border border-white/14 bg-white/6 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/82 transition hover:-translate-y-0.5 hover:bg-white/14"
                  >
                    <span
                      className="transition group-hover:-translate-x-0.5"
                      aria-hidden
                    >
                      ←
                    </span>
                    Anterior
                  </Link>
                ) : (
                  <span />
                )}

                <span className="font-serif text-xs tabular-nums text-white/62">
                  {currentPageNumber} / {totalPagesVisible}
                </span>

                {nextPage ? (
                  <Link
                    href={readerPageHref(product.slug, nextPage)}
                    className="va-reader-nav-primary group inline-flex w-fit items-center gap-2 justify-self-end rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--va-navy)] transition hover:-translate-y-0.5 hover:bg-[color:var(--va-blue-100)]"
                  >
                    Continuar
                    <span
                      className="transition group-hover:translate-x-0.5"
                      aria-hidden
                    >
                      →
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/library"
                    className="va-reader-nav-primary inline-flex w-fit items-center gap-2 justify-self-end rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--va-navy)] transition hover:-translate-y-0.5 hover:bg-[color:var(--va-blue-100)]"
                  >
                    Finalizar ✓
                  </Link>
                )}
              </nav>
            </div>
          </section>
        </div>
      </main>
    </ReaderPreviewShell>
  );
}
