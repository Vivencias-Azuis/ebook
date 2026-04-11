"use client";

import { useState } from "react";
import Link from "next/link";

import type { BlockProgressState } from "@/domains/progress/queries";
import type { ReaderPage } from "@/features/reader/pagination";

type ReaderSidebarProps = {
  productTitle: string;
  productSlug: string;
  currentPageNumber: number;
  progressPercent: number;
  readerPages: ReaderPage[];
  progressByBlockId: Record<string, BlockProgressState>;
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
}: ReaderSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const chapters = groupPagesByChapter(readerPages);

  return (
    <aside
      id="reader-sidebar-root"
      className="va-reader-panel va-reader-panel-muted order-2 p-5 lg:order-1 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto"
    >
      <div className="mb-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--va-muted)]">
            Sumário
          </p>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="reader-sidebar-nav"
            onClick={() => setIsOpen((currentState) => !currentState)}
            className="rounded-full border border-[color:var(--va-line)] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--va-blue-800)] shadow-[0_14px_26px_-22px_rgba(11,35,66,0.28)] hover:-translate-y-0.5 hover:bg-[color:var(--va-blue-100)]"
          >
            {isOpen ? "Ocultar sumário" : "Mostrar sumário"}
          </button>
        </div>

        <div className="min-w-0">
          <h1 className="max-w-[12ch] font-serif text-2xl font-semibold leading-tight text-[color:var(--va-navy)] sm:max-w-none">
            {productTitle}
          </h1>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white shadow-inner">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--va-blue-300),var(--va-blue))]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {isOpen ? (
        <nav
          id="reader-sidebar-nav"
          className="space-y-5"
          aria-label="Páginas do curso"
        >
          {chapters.map((chapter) => (
            <section key={chapter.chapterId} className="space-y-2">
              <header>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--va-muted)]">
                  Capítulo {chapter.chapterSortOrder}
                </p>
                <h2 className="mt-1 font-serif text-lg font-semibold text-[color:var(--va-navy)]">
                  {chapter.chapterTitle}
                </h2>
              </header>

              <div className="space-y-2">
                {chapter.pages.map((readerPage) => {
                  const isActive = readerPage.pageNumber === currentPageNumber;
                  const progressBlockId =
                    readerPage.sourceBlockId ?? readerPage.block?.id ?? null;
                  const isCompleted = progressBlockId
                    ? progressByBlockId[progressBlockId]?.completed
                    : false;
                  const pageLabel =
                    readerPage.slideCount > 1
                      ? `Parte ${readerPage.slideNumber} de ${readerPage.slideCount}`
                      : `Página ${readerPage.pageNumber}`;

                  return (
                    <Link
                      key={`${readerPage.chapterId}-${readerPage.pageNumber}`}
                      href={readerPageHref(productSlug, readerPage.pageNumber)}
                      aria-current={isActive ? "page" : undefined}
                      className={`va-reader-index-item group text-sm leading-6 ${
                        isActive ? "va-reader-index-item-active" : ""
                      }`}
                    >
                      <span className="flex flex-col items-start gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--va-muted)]">
                          {pageLabel}
                        </span>
                        {isCompleted ? (
                          <span className="rounded-full bg-[color:var(--va-blue-100)] px-2.5 py-1 text-[0.7rem] font-bold text-[color:var(--va-blue-800)]">
                            Lido
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 block font-semibold text-[color:var(--va-navy)]">
                        {readerPage.block?.title ?? chapter.chapterTitle}
                      </span>
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
