import Image from "next/image";
import Link from "next/link";

import { requireServerSession } from "@/domains/auth/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  deriveLibraryCheckoutMessage,
  getUserLibraryProducts,
} from "@/domains/products/library";
import { getUserProgressSummariesForProducts } from "@/domains/progress/queries";
import { formatMoney } from "@/lib/format";
import { getProductCoverUrl } from "@/lib/product-assets";

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
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="va-wordmark">
            <span className="va-wordmark-ribbon" aria-hidden="true" />
            Vivências Azuis
          </Link>
          <SignOutButton className="va-nav-link" />
        </div>

        <header className="mb-10 max-w-2xl">
          <p className="va-kicker">Biblioteca</p>
          <h1 className="mt-3 font-serif text-4xl font-medium leading-tight text-[color:var(--va-ink)] sm:text-5xl">
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

              const coverUrl = getProductCoverUrl(product.slug);

              return (
                <article
                  key={product.productId}
                  className="va-panel flex h-full flex-col bg-white"
                >
                  {coverUrl ? (
                    <div className="mb-4 overflow-hidden rounded-[1.25rem]">
                      <Image
                        src={coverUrl}
                        alt={`Capa de ${product.title}`}
                        width={480}
                        height={640}
                        className="w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex-1 space-y-3">
                    <p className="va-kicker">Guia digital</p>
                    <h2 className="font-serif text-2xl font-medium leading-tight text-[color:var(--va-ink)]">
                      {product.title}
                    </h2>
                    {product.subtitle ? (
                      <p className="text-sm leading-6 text-[color:var(--va-muted)]">
                        {product.subtitle}
                      </p>
                    ) : null}
                    <p className="text-sm leading-7 text-[color:var(--va-soft-ink)]">
                      {product.description}
                    </p>
                    <span
                      className={`inline-flex text-xs font-medium ${
                        product.hasAccess
                          ? "text-[color:var(--va-navy)]"
                          : "text-[color:var(--va-muted)]"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* Barra de progresso */}
                  <div className="mt-6">
                    <div className="h-1 overflow-hidden rounded-sm bg-[color:var(--va-line)]">
                      <div
                        className="h-full bg-[color:var(--va-navy)]"
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
                      <p className="text-xs text-[color:var(--va-muted)]">
                        Preço original
                      </p>
                      <p className="va-price mt-1 text-xl text-[color:var(--va-ink)]">
                        {formatMoney(
                          product.priceCents,
                          product.currency.toUpperCase(),
                        )}
                      </p>
                    </div>
                    <Link
                      href={`/products/${product.slug}/read${progress.continueReadingChapterId ? `#${progress.continueReadingChapterId}` : ""}`}
                      className="va-button-primary"
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
