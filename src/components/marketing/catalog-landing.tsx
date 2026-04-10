import Link from "next/link";

import { formatMoney } from "@/lib/format";

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
      <section className="px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-[linear-gradient(135deg,var(--va-blue-800)_0%,var(--va-blue)_52%,var(--va-navy)_100%)] px-8 py-12 text-white shadow-[0_30px_90px_-40px_rgba(11,35,66,0.45)] sm:px-10 lg:px-12 lg:py-14">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--va-blue-100)]">
              Vivências Azuis
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.02] sm:text-5xl lg:text-[4.3rem]">
              Guia prático para transformar o começo da jornada em próximos
              passos claros
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/84 sm:text-xl">
              Um material criado para famílias que precisam organizar decisões,
              reduzir a sobrecarga mental e entender o que fazer primeiro.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-semibold text-white/88">
              <span className="va-chip va-chip-on-dark">Acesso imediato</span>
              <span className="va-chip va-chip-on-dark">Linguagem simples</span>
              <span className="va-chip va-chip-on-dark">Aplicável na rotina</span>
            </div>
            {featuredProduct ? (
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href={`/products/${featuredProduct.slug}`}
                  className="va-button-primary"
                >
                  Conheça o guia
                </Link>
                <p className="max-w-md text-sm leading-6 text-white/76">
                  Conteúdo editorial com foco em clareza, prioridades e decisão.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {featuredProduct ? (
        <section className="mx-auto w-full max-w-7xl px-6 pt-8 lg:px-10 lg:pt-10">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="va-panel bg-white p-8 lg:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--va-blue)]">
                Produto em destaque
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-[color:var(--va-ink)] sm:text-4xl">
                {featuredProduct.title}
              </h2>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--va-muted)]">
                {featuredProduct.subtitle ?? "Um começo simples para organizar o primeiro mês"}
              </p>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[color:var(--va-soft-ink)]">
                Material pensado para famílias que precisam sair do excesso de
                informação e transformar ansiedade em próximos passos mais claros
                sobre rotina, escola, terapias e organização da jornada.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {decisionPoints.map((point) => (
                  <div
                    key={point.title}
                    className="rounded-[1.25rem] border border-[color:var(--va-line)] bg-[color:var(--va-paper)] p-4"
                  >
                    <h3 className="text-lg font-semibold text-[color:var(--va-ink)]">
                      {point.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--va-soft-ink)]">
                      {point.description}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <aside className="va-panel bg-[linear-gradient(180deg,#f7fbff_0%,#eef4f8_100%)] p-8 lg:p-10">
              <div className="rounded-[1.5rem] border border-white bg-white p-6 shadow-[0_20px_50px_-36px_rgba(11,35,66,0.22)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--va-blue)]">
                  Investimento
                </p>
                <p className="mt-3 text-4xl font-bold text-[color:var(--va-ink)]">
                  {formatMoney(
                    featuredProduct.priceCents,
                    featuredProduct.currency.toUpperCase(),
                  )}
                </p>
                <p className="mt-4 text-base leading-7 text-[color:var(--va-soft-ink)]">
                  Acesso digital imediato ao material para consultar no seu
                  ritmo, sem depender de conteúdo solto espalhado pela internet.
                </p>
                <div className="mt-6 space-y-3 text-sm text-[color:var(--va-soft-ink)]">
                  <p>Conteúdo direto para fase inicial da jornada.</p>
                  <p>Leitura simples, prática e sem promessas mágicas.</p>
                  <p>Estrutura para aplicar no dia a dia da família.</p>
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/products/${featuredProduct.slug}`}
                    className="inline-flex items-center justify-center rounded-full bg-[color:var(--va-blue-700)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--va-blue-800)]"
                  >
                    Ver página completa
                  </Link>
                  <span className="inline-flex items-center justify-center rounded-full border border-[color:var(--va-line)] px-4 py-3 text-sm font-semibold text-[color:var(--va-blue-700)]">
                    Acesso imediato
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {decisionPoints.map((point) => (
            <article key={point.title} className="va-panel bg-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--va-muted)]">
                Clareza
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-[color:var(--va-ink)]">
                {point.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-[color:var(--va-soft-ink)]">
                {point.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {products.length > 0 ? (
        <section className="mx-auto w-full max-w-7xl px-6 pb-18 lg:px-10 lg:pb-24">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--va-blue)]">
              Catálogo
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              Produtos publicados
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="va-panel flex h-full flex-col bg-white"
              >
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--va-muted)]">
                    E-book digital
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold text-[color:var(--va-ink)]">
                    {product.title}
                  </h3>
                  <p className="mt-3 text-sm font-medium uppercase tracking-[0.16em] text-[color:var(--va-muted)]">
                    {product.subtitle ?? "Vivências Azuis"}
                  </p>
                  <p className="mt-4 text-base leading-7 text-[color:var(--va-soft-ink)]">
                    {product.description}
                  </p>
                </div>
                <div className="mt-8 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--va-muted)]">
                      Preço
                    </p>
                    <p className="mt-2 text-xl font-semibold text-[color:var(--va-ink)]">
                      {formatMoney(product.priceCents, product.currency.toUpperCase())}
                    </p>
                  </div>
                  <Link
                    href={`/products/${product.slug}`}
                    className="inline-flex items-center justify-center rounded-full border border-[color:var(--va-line-strong)] px-4 py-2 text-sm font-semibold text-[color:var(--va-blue)] transition-colors hover:bg-[color:var(--va-paper)]"
                  >
                    Ver página
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
