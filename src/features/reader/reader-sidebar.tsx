"use client";

import { useState } from "react";
import Link from "next/link";

import type { BlockProgressState } from "@/domains/progress/queries";
import type { ReaderPage } from "@/features/reader/pagination";
import { ReaderPaywallTrigger } from "@/features/reader/reader-preview-shell";

type ReaderSidebarProps = {
  productTitle: string;
  productSlug: string;
  currentPageNumber: number;
  progressPercent: number;
  readerPages: ReaderPage[];
  progressByBlockId: Record<string, BlockProgressState>;
  accessiblePageNumbers: Set<number>;
  isPreviewMode: boolean;
  onOpenPaywall?: () => void;
};

type ReaderSidebarChapter = {
  chapterId: string;
  chapterTitle: string;
  chapterSortOrder: number;
  pages: ReaderPage[];
};

function readerPageHref(slug: string, pageNumber: number) {
  return `/products/${slug}/read?page=${pageNumber}`;
}

function groupPagesByChapter(readerPages: ReaderPage[]) {
  const chapterMap = new Map<string, ReaderSidebarChapter>();

  for (const readerPage of readerPages) {
    const existingChapter = chapterMap.get(readerPage.chapterId);

    if (existingChapter) {
      existingChapter.pages.push(readerPage);
      continue;
    }

    chapterMap.set(readerPage.chapterId, {
      chapterId: readerPage.chapterId,
      chapterTitle: readerPage.chapterTitle,
      chapterSortOrder: readerPage.chapterSortOrder,
      pages: [readerPage],
    });
  }

  return Array.from(chapterMap.values());
}

export function ReaderSidebar({
  productTitle,
  productSlug,
  currentPageNumber,
  progressPercent,
  readerPages,
  progressByBlockId,
  accessiblePageNumbers,
  isPreviewMode,
  onOpenPaywall,
}: ReaderSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const chapters = groupPagesByChapter(readerPages);

  return (
    <aside
      id="reader-sidebar-root"
      className="va-reader-panel va-reader-panel-muted order-2 p-5 lg:order-1 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.26em] text-[color:var(--va-blue)]">
              Sumário
            </p>
            <h1 className="mt-2 font-serif text-xl font-semibold leading-tight text-[color:var(--va-navy)]">
              {productTitle}
            </h1>
          </div>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="reader-sidebar-nav"
            onClick={() => setIsOpen((currentState) => !currentState)}
            className="shrink-0 rounded-full border border-[color:var(--va-line)] bg-white/80 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[color:var(--va-blue-800)] hover:bg-[color:var(--va-blue-100)]"
          >
            {isOpen ? "Ocultar" : "Abrir"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[color:var(--va-line)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--va-blue-300),var(--va-blue))]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-serif text-xs font-semibold text-[color:var(--va-soft-ink)]">
            {progressPercent}%
          </span>
        </div>
      </div>

      <div className="my-5 h-px bg-[color:var(--va-line)]" />


      {isOpen ? (
        <nav
          id="reader-sidebar-nav"
          className="space-y-6"
          aria-label="Páginas do curso"
        >
          {chapters.map((chapter) => (
            <section key={chapter.chapterId} className="space-y-2">
              <header className="mb-2">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[color:var(--va-blue)]">
                  {String(chapter.chapterSortOrder).padStart(2, "0")} · Capítulo
                </p>
                <h2 className="mt-1 font-serif text-base font-semibold leading-snug text-[color:var(--va-navy)]">
                  {chapter.chapterTitle}
                </h2>
              </header>

              <div className="space-y-0.5">
                {chapter.pages.map((readerPage) => {
                  const isActive = readerPage.pageNumber === currentPageNumber;
                  const isAccessible = accessiblePageNumbers.has(
                    readerPage.pageNumber,
                  );
                  const progressBlockId =
                    readerPage.sourceBlockId ?? readerPage.block?.id ?? null;
                  const isCompleted = progressBlockId
                    ? progressByBlockId[progressBlockId]?.completed
                    : false;
                  const pageLabel =
                    readerPage.slideCount > 1
                      ? `Parte ${readerPage.slideNumber} de ${readerPage.slideCount}`
                      : `Página ${readerPage.pageNumber}`;

                  if (!isAccessible) {
                    return (
                      <ReaderPaywallTrigger
                        key={`${readerPage.chapterId}-${readerPage.pageNumber}`}
                        aria-disabled="true"
                        data-paywall-trigger="locked-page"
                        forceVisible={isPreviewMode && Boolean(onOpenPaywall)}
                        onClick={onOpenPaywall}
                        className="va-reader-index-item flex w-full cursor-pointer items-center gap-3 text-left opacity-70"
                      >
                        <span
                          className="font-serif text-xs text-[color:var(--va-muted)]"
                          aria-hidden
                        >
                          🔒
                        </span>
                        <span className="flex-1 truncate font-serif text-sm text-[color:var(--va-soft-ink)]">
                          {readerPage.block?.title ?? chapter.chapterTitle}
                        </span>
                      </ReaderPaywallTrigger>
                    );
                  }

                  return (
                    <Link
                      key={`${readerPage.chapterId}-${readerPage.pageNumber}`}
                      href={readerPageHref(productSlug, readerPage.pageNumber)}
                      aria-current={isActive ? "page" : undefined}
                      className={`va-reader-index-item flex items-center gap-3 text-sm ${
                        isActive ? "va-reader-index-item-active" : ""
                      }`}
                    >
                      <span
                        className={`font-serif text-xs tabular-nums ${
                          isActive
                            ? "text-[color:var(--va-blue-800)]"
                            : "text-[color:var(--va-muted)]"
                        }`}
                      >
                        {String(readerPage.pageNumber).padStart(2, "0")}
                      </span>
                      <span
                        className={`flex-1 truncate font-serif ${
                          isActive
                            ? "font-semibold text-[color:var(--va-navy)]"
                            : "text-[color:var(--va-soft-ink)]"
                        }`}
                      >
                        {readerPage.block?.title ?? pageLabel}
                      </span>
                      {isCompleted ? (
                        <span
                          className="text-xs text-[color:var(--va-blue)]"
                          aria-label="Lido"
                        >
                          ✓
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>
      ) : null}
    </aside>
  );
}
