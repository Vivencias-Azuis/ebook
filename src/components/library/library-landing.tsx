import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { ProductCover } from "@/components/marketing/product-cover";
import {
  Kicker,
  SiteFooter,
  SiteHeader,
} from "@/components/marketing/site-chrome";
import type { LibraryProduct } from "@/domains/products/library";

export type LibraryProgress = {
  totalBlocks: number;
  completedBlocks: number;
  percent: number;
  continueReadingChapterId: string | null;
};

const emptyProgress: LibraryProgress = {
  totalBlocks: 0,
  completedBlocks: 0,
  percent: 0,
  continueReadingChapterId: null,
};

function readingHref(product: LibraryProduct, progress: LibraryProgress) {
  const hash = progress.continueReadingChapterId
    ? `#${progress.continueReadingChapterId}`
    : "";

  return `/products/${product.slug}/read${hash}`;
}

function callToActionLabel(product: LibraryProduct, progress: LibraryProgress) {
  if (!product.hasAccess) {
    return "Ler capítulo 1";
  }

  return progress.completedBlocks > 0 ? "Continuar leitura" : "Ler agora";
}

function LibraryProgressRow({ progress }: { progress: LibraryProgress }) {
  if (progress.totalBlocks <= 0) {
    return null;
  }

  return (
    <div className="mt-6">
      {progress.percent > 0 ? (
        <div className="h-0.5 overflow-hidden bg-[color:var(--va-line)]">
          <div
            className="h-full bg-[color:var(--va-navy)]"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      ) : null}
      <p
        className={`text-xs tabular-nums text-[color:var(--va-muted)] ${
          progress.percent > 0 ? "mt-2" : ""
        }`}
      >
        {progress.percent}% lido
      </p>
    </div>
  );
}

function LibraryBook({
  product,
  progress,
  featured,
}: {
  product: LibraryProduct;
  progress: LibraryProgress;
  featured: boolean;
}) {
  const statusLabel = product.hasAccess ? "Liberado" : "Preview gratuito";
  const href = readingHref(product, progress);
  const label = callToActionLabel(product, progress);

  if (featured) {
    return (
      <article className="grid min-w-0 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-16 lg:min-h-[calc(100svh-64px)]">
        <div className="min-w-0">
          <Kicker index="01">Biblioteca</Kicker>
          <h1 className="mt-5 max-w-xl text-pretty font-serif text-[32px] font-medium leading-[1.12] text-[color:var(--va-ink)] sm:text-[48px] sm:leading-[1.08] sm:tracking-[-0.02em]">
            {product.title}
          </h1>
          {product.subtitle ? (
            <p className="mt-4 max-w-xl text-[18px] leading-8 text-[color:var(--va-soft-ink)]">
              {product.subtitle}
            </p>
          ) : null}
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-[color:var(--va-soft-ink)]">
            {product.description}
          </p>
          <p className="mt-5 text-sm text-[color:var(--va-muted)]">
            {statusLabel}
          </p>
          <LibraryProgressRow progress={progress} />
          <div className="mt-8">
            <Link href={href} className="va-button-primary">
              {label}
            </Link>
          </div>
        </div>
        <div className="flex min-w-0 justify-center lg:justify-end">
          <ProductCover
            slug={product.slug}
            title={product.title}
            priority
            size="hero"
          />
        </div>
      </article>
    );
  }

  return (
    <article className="va-list-card">
      <ProductCover slug={product.slug} title={product.title} size="thumb" />
      <div className="min-w-0 flex-1">
        <p className="va-kicker">{statusLabel}</p>
        <h2 className="mt-2 font-serif text-[24px] font-medium leading-tight text-[color:var(--va-ink)]">
          {product.title}
        </h2>
        {product.subtitle ? (
          <p className="mt-2 text-sm leading-6 text-[color:var(--va-muted)]">
            {product.subtitle}
          </p>
        ) : null}
        <p className="mt-3 text-[15px] leading-7 text-[color:var(--va-soft-ink)]">
          {product.description}
        </p>
        <LibraryProgressRow progress={progress} />
        <div className="mt-5">
          <Link href={href} className="va-button-primary">
            {label}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function LibraryLanding({
  products,
  progressSummaries,
  checkoutMessage,
}: {
  products: LibraryProduct[];
  progressSummaries: Record<string, LibraryProgress>;
  checkoutMessage: string | null;
}) {
  const featuredProduct = products.length === 1 ? products[0] : undefined;

  return (
    <main className="va-page text-[color:var(--va-ink)]">
      <SiteHeader
        showLogin={false}
        trailing={<SignOutButton className="va-nav-link" />}
      />

      {checkoutMessage ? (
        <div className="va-shell pt-8">
          <p className="va-notice">{checkoutMessage}</p>
        </div>
      ) : null}

      {products.length === 0 ? (
        <section className="va-shell py-16 lg:py-24">
          <Kicker index="01">Biblioteca</Kicker>
          <h1 className="mt-5 font-serif text-[32px] font-medium leading-tight sm:text-[40px]">
            Seus guias
          </h1>
          <p className="mt-6 max-w-xl text-[18px] leading-8 text-[color:var(--va-soft-ink)]">
            Você ainda não tem guias liberados na biblioteca.
          </p>
        </section>
      ) : featuredProduct ? (
        <section className="va-shell">
          <LibraryBook
            product={featuredProduct}
            progress={
              progressSummaries[featuredProduct.productId] ?? emptyProgress
            }
            featured
          />
        </section>
      ) : (
        <section className="va-shell py-12 lg:py-16">
          <Kicker index="01">Biblioteca</Kicker>
          <h1 className="mt-5 font-serif text-[32px] font-medium leading-tight sm:text-[40px]">
            Seus guias
          </h1>
          <p className="mt-4 max-w-xl text-[18px] leading-8 text-[color:var(--va-soft-ink)]">
            Materiais liberados para a sua conta. Consulte no seu ritmo.
          </p>
          <div className="mt-10">
            {products.map((product) => (
              <LibraryBook
                key={product.productId}
                product={product}
                progress={progressSummaries[product.productId] ?? emptyProgress}
                featured={false}
              />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
