import Image from "next/image";
import Link from "next/link";

import { formatMoney } from "@/lib/format";
import { getProductCoverUrl } from "@/lib/product-assets";

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
  products,
}: {
  featuredProduct: Product | null;
  products: Product[];
}) {
  const courseHref = (slug: string) =>
    `/login?next=${encodeURIComponent(`/products/${slug}/read`)}`;
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
      <header className="px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[color:var(--va-line)] bg-white/80 px-5 py-3 backdrop-blur sm:px-6">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--va-blue)]"
          >
            Vivências Azuis
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-[color:var(--va-soft-ink)] transition-colors hover:text-[color:var(--va-blue)]"
          >
            Entrar
          </Link>
        </div>
      </header>

      <section className="px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-[linear-gradient(135deg,var(--va-blue-800)_0%,var(--va-blue)_52%,var(--va-navy)_100%)] px-8 py-12 text-white shadow-[0_30px_90px_-40px_rgba(11,35,66,0.45)] sm:px-10 lg:px-12 lg:py-14">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--va-blue-100)]">
              Vivências Azuis
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.02] sm:text-5xl lg:text-[4.3rem]">
              Cursos para orientar a jornada com clareza, acolhimento e próximos
              passos possíveis
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/84 sm:text-xl">
              A Vivências Azuis reúne cursos e guias digitais para famílias que
              precisam entender o que fazer primeiro e como avançar com mais
              segurança no dia a dia.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-semibold text-white/88">
              <span className="va-chip va-chip-on-dark">Acesso imediato</span>
              <span className="va-chip va-chip-on-dark">Linguagem simples</span>
              <span className="va-chip va-chip-on-dark">
                Aplicável na rotina
              </span>
            </div>
            <p className="mx-auto mt-8 max-w-2xl text-sm leading-6 text-white/76">
              Explore os materiais disponíveis abaixo e comece pelo que faz mais
              sentido para o momento da sua família.
            </p>
          </div>
        </div>
      </section>

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
              Cursos disponíveis
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              Escolha por onde começar
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="va-panel flex h-full flex-col bg-white"
              >
                {getProductCoverUrl(product.slug) ? (
                  <div className="mb-4 overflow-hidden rounded-[1.25rem]">
                    <Image
                      src={getProductCoverUrl(product.slug)!}
                      alt={`Capa de ${product.title}`}
                      width={480}
                      height={640}
                      className="w-full object-cover"
                    />
                  </div>
                ) : null}
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
                      {formatMoney(
                        product.priceCents,
                        product.currency.toUpperCase(),
                      )}
                    </p>
                  </div>
                  <Link
                    href={courseHref(product.slug)}
                    className="inline-flex items-center justify-center rounded-full border border-[color:var(--va-line-strong)] px-4 py-2 text-sm font-semibold text-[color:var(--va-blue)] transition-colors hover:bg-[color:var(--va-paper)]"
                  >
                    Entrar para começar
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="border-t border-[color:var(--va-line)] px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-7xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[color:var(--va-blue)]">
            Vivências Azuis
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[color:var(--va-muted)]">
            <Link
              href="/privacidade"
              className="underline hover:text-[color:var(--va-blue)]"
            >
              Política de privacidade
            </Link>
            <Link
              href="/reembolso"
              className="underline hover:text-[color:var(--va-blue)]"
            >
              Política de reembolso
            </Link>
          </nav>
          <p className="text-xs text-[color:var(--va-muted)]">
            © {new Date().getFullYear()} Vivências Azuis
          </p>
        </div>
      </footer>
    </main>
  );
}
