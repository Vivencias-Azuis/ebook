import Link from "next/link";

import { requireServerSession } from "@/domains/auth/server";
import {
  deriveLibraryCheckoutMessage,
  getUserLibraryProducts,
} from "@/domains/products/library";
import { getUserProgressSummariesForProducts } from "@/domains/progress/queries";
import { formatMoney } from "@/lib/format";

type LibraryPageProps = {
  searchParams?: Promise<{
    checkout?: string;
  }>;
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const session = await requireServerSession();
  const [products, params] = await Promise.all([
    getUserLibraryProducts(session.user.id),
    searchParams,
  ]);
  const checkout = params?.checkout;
  const hasCatalogProducts = products.length > 0;
  const hasUnlockedProducts = products.some((product) => product.hasAccess);
  const progressSummaries = await getUserProgressSummariesForProducts(
    session.user.id,
    products.map((product) => product.productId),
  );
  const checkoutMessage = deriveLibraryCheckoutMessage(
    checkout,
    hasUnlockedProducts,
  );

  return (
    <main className="va-page min-h-screen text-[color:var(--va-ink)]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 lg:px-10">
        {/* Nav */}
        <div className="va-reader-bar mb-8 flex items-center justify-between px-5 py-3">
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-[0.24em] text-[color:var(--va-blue)]"
          >
            Vivências Azuis
          </Link>
          <Link
            href="/api/auth/sign-out"
            className="text-sm font-medium text-[color:var(--va-soft-ink)] hover:text-[color:var(--va-ink)]"
          >
            Sair
          </Link>
        </div>

        {/* Hero */}
        <header className="mb-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--va-blue)]">
            Biblioteca
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-[color:var(--va-navy)] sm:text-5xl">
            Seus guias
          </h1>
          <p className="mt-4 text-base leading-7 text-[color:var(--va-soft-ink)]">
            Materiais liberados para a sua conta. Consulte no seu ritmo.
          </p>
        </header>

        {checkoutMessage ? (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {checkoutMessage}
          </div>
        ) : null}

        {hasCatalogProducts ? (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const progress = progressSummaries[product.productId] ?? {
                totalBlocks: 0,
                completedBlocks: 0,
                percent: 0,
                continueReadingChapterId: null,
              };
              const callToActionLabel = product.hasAccess
                ? progress.completedBlocks > 0
                  ? "Continuar leitura"
                  : "Ler agora"
                : "Ler capítulo 1";
              const statusLabel = product.hasAccess
                ? "Liberado"
                : "Preview gratuito";

              return (
                <article
                  key={product.productId}
                  className="va-panel flex h-full flex-col bg-white"
                >
                  <div className="flex-1 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--va-muted)]">
                      Guia digital
                    </p>
                    <h2 className="font-serif text-2xl font-bold leading-tight text-[color:var(--va-navy)]">
                      {product.title}
                    </h2>
                    {product.subtitle ? (
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--va-muted)]">
                        {product.subtitle}
                      </p>
                    ) : null}
                    <p className="text-sm leading-7 text-[color:var(--va-soft-ink)]">
                      {product.description}
                    </p>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                        product.hasAccess
                          ? "bg-[color:var(--va-blue-100)] text-[color:var(--va-blue-800)]"
                          : "bg-[color:var(--va-paper)] text-[color:var(--va-muted)]"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* Barra de progresso */}
                  <div className="mt-6">
                    <div className="h-2 overflow-hidden rounded-full bg-[color:var(--va-paper)] shadow-inner">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,var(--va-blue-300),var(--va-blue))]"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-medium text-[color:var(--va-muted)]">
                      {progress.percent}% concluído · {progress.completedBlocks}
                      /{progress.totalBlocks} blocos
                    </p>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--va-muted)]">
                        Preço original
                      </p>
                      <p className="mt-1 text-xl font-bold text-[color:var(--va-ink)]">
                        {formatMoney(
                          product.priceCents,
                          product.currency.toUpperCase(),
                        )}
                      </p>
                    </div>
                    <Link
                      href={`/products/${product.slug}/read${progress.continueReadingChapterId ? `#${progress.continueReadingChapterId}` : ""}`}
                      className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--va-blue-700),var(--va-navy))] px-5 py-2.5 text-sm font-bold text-white shadow-[0_14px_34px_-22px_rgba(11,35,66,0.52)] hover:-translate-y-0.5"
                    >
                      {callToActionLabel}
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-[color:var(--va-line-strong)] bg-[color:var(--va-paper)] p-8 text-[color:var(--va-soft-ink)]">
            Você ainda não tem guias liberados na biblioteca.
          </div>
        )}
      </div>
    </main>
  );
}
