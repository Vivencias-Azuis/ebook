import Link from "next/link";

import { formatMoney } from "@/lib/format";
import { ProductCover } from "@/components/marketing/product-cover";
import {
  Kicker,
  SiteFooter,
  SiteHeader,
} from "@/components/marketing/site-chrome";

type Product = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  priceCents: number;
  currency: string;
};

export function CatalogLanding({
  featuredProduct,
  products,
}: {
  featuredProduct: Product | null;
  products: Product[];
}) {
  const featured = featuredProduct ?? products[0] ?? null;
  const decisionPoints = [
    {
      title: "Organize o que vem primeiro",
      description:
        "Pare de tentar resolver tudo ao mesmo tempo e entenda quais decisões merecem atenção imediata.",
    },
    {
      title: "Decida com menos ruído",
      description:
        "Conteúdo profundo o suficiente para orientar, sem virar uma nova fonte de sobrecarga.",
    },
    {
      title: "Consulte no dia a dia",
      description:
        "Um guia para apoiar rotina, escola, terapias e conversas importantes com mais estrutura.",
    },
  ];

  return (
    <main className="va-page text-[color:var(--va-ink)]">
      <SiteHeader />

      <section className="va-shell grid min-w-0 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-16 lg:min-h-[calc(100svh-64px)]">
        <div className="min-w-0">
          <Kicker index="01">O guia</Kicker>
          <h1 className="mt-5 max-w-xl text-pretty font-serif text-[32px] font-medium leading-[1.12] text-[color:var(--va-ink)] sm:text-[48px] sm:leading-[1.08] sm:tracking-[-0.02em]">
            Guias para orientar a jornada com clareza, acolhimento e próximos
            passos possíveis
          </h1>
          <p className="mt-6 max-w-xl text-[18px] leading-8 text-[color:var(--va-soft-ink)]">
            A Vivências Azuis reúne guias digitais para famílias que precisam
            entender o que fazer primeiro e como avançar com mais segurança no
            dia a dia.
          </p>
          <p className="mt-5 text-sm leading-6 text-[color:var(--va-muted)]">
            Acesso imediato · Linguagem simples · Aplicável na rotina
          </p>
          {featured ? (
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                href={`/products/${featured.slug}`}
                className="va-button-primary"
              >
                Ver o guia
              </Link>
              <p className="va-price text-sm text-[color:var(--va-soft-ink)]">
                {formatMoney(
                  featured.priceCents,
                  featured.currency.toUpperCase(),
                )}
              </p>
            </div>
          ) : null}
        </div>
        {featured ? (
          <div className="flex min-w-0 justify-center lg:justify-end">
            <ProductCover
              slug={featured.slug}
              title={featured.title}
              priority
              size="hero"
            />
          </div>
        ) : null}
      </section>

      <section className="border-t border-[color:var(--va-line)]">
        <div className="va-shell grid gap-10 py-16 md:grid-cols-3 md:gap-8 lg:py-20">
          {decisionPoints.map((point, index) => (
            <article key={point.title}>
              <Kicker index={String(index + 1).padStart(2, "0")} />
              <h2 className="mt-3 font-serif text-[24px] font-medium leading-tight text-[color:var(--va-ink)]">
                {point.title}
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-[color:var(--va-soft-ink)]">
                {point.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {products.length > 0 ? (
        <section className="border-t border-[color:var(--va-line)]">
          <div className="va-shell py-16 lg:py-20">
            <div className="max-w-2xl">
              <Kicker index="02">Guias disponíveis</Kicker>
              <h2 className="mt-4 font-serif text-[32px] font-medium leading-tight sm:text-[40px]">
                Escolha por onde começar
              </h2>
            </div>
            <div
              className={
                products.length === 1
                  ? "mt-10"
                  : "mt-10 grid gap-10 md:grid-cols-2"
              }
            >
              {products.map((product) => (
                <article
                  key={product.id}
                  className={
                    products.length === 1
                      ? "border-t border-[color:var(--va-line)] pt-10"
                      : "flex flex-col gap-5"
                  }
                >
                  {products.length === 1 ? null : (
                    <ProductCover slug={product.slug} title={product.title} />
                  )}
                  <div>
                    <p className="va-kicker">Guia digital</p>
                    <h3 className="mt-3 font-serif text-[24px] font-medium leading-tight text-[color:var(--va-ink)]">
                      {product.title}
                    </h3>
                    {product.subtitle ? (
                      <p className="mt-2 text-sm leading-6 text-[color:var(--va-muted)]">
                        {product.subtitle}
                      </p>
                    ) : null}
                    <p className="mt-4 max-w-xl text-[15px] leading-7 text-[color:var(--va-soft-ink)]">
                      {product.description}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-5">
                      <p className="va-price text-lg text-[color:var(--va-ink)]">
                        {formatMoney(
                          product.priceCents,
                          product.currency.toUpperCase(),
                        )}
                      </p>
                      <Link
                        href={`/products/${product.slug}`}
                        className="va-button-secondary"
                      >
                        Ver o guia
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <SiteFooter />
    </main>
  );
}
