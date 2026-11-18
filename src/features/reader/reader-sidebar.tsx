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
            <p className="va-kicker">Sumário</p>
            <h1 className="mt-2 font-serif text-xl font-medium leading-tight text-[color:var(--va-ink)]">
              {productTitle}
            </h1>
          </div>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="reader-sidebar-nav"
            onClick={() => setIsOpen((currentState) => !currentState)}
            className="va-reader-sidebar-toggle shrink-0"
          >
            {isOpen ? "Ocultar" : "Abrir"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-0.5 flex-1 overflow-hidden bg-[color:var(--va-line)]">
            <div
              className="h-full bg-[color:var(--va-navy)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-[color:var(--va-muted)]">
            {progressPercent}%
          </span>
        </div>
      </div>

      <div className="my-5 h-px bg-[color:var(--va-line)]" />

      {isOpen ? (
        <nav
          id="reader-sidebar-nav"
          className="space-y-6"
          aria-label="Páginas do guia"
        >
          {chapters.map((chapter) => (
            <section key={chapter.chapterId} className="space-y-2">
              <header className="mb-2">
                <p className="va-kicker">
                  <span className="va-kicker-num">
                    {String(chapter.chapterSortOrder).padStart(2, "0")}
                  </span>
                  Capítulo
                </p>
                <h2 className="mt-1 font-serif text-base font-medium leading-snug text-[color:var(--va-ink)]">
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
                        <span className="va-reader-lock" aria-label="Bloqueado">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden
                          >
                            <rect
                              x="3.25"
                              y="7.25"
                              width="9.5"
                              height="6.5"
                              rx="1"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M5.25 7.25V5.5a2.75 2.75 0 0 1 5.5 0v1.75"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </span>
                        <span className="flex-1 truncate text-sm text-[color:var(--va-soft-ink)]">
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
                        className={`flex-1 truncate ${
                          isActive
                            ? "font-medium text-[color:var(--va-ink)]"
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
