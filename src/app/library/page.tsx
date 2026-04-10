import Link from "next/link";

import { requireServerSession } from "@/domains/auth/server";
import { getUserLibraryProducts } from "@/domains/products/library";
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
  const hasProducts = products.length > 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,#fafaf9_0%,#ffffff_60%)] text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12 lg:px-10">
        <header className="max-w-3xl space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">
            Biblioteca
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
            Seus produtos comprados aparecem aqui.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-600">
            Aqui aparecem apenas os produtos liberados para a sua conta.
          </p>
        </header>

        {checkout === "success" ? (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Pagamento confirmado. Seu conteúdo já está disponível na biblioteca.
          </div>
        ) : null}

        {hasProducts ? (
          <section className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.entitlementId}
                className="flex h-full flex-col justify-between rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.25)] backdrop-blur"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                      Disponível na biblioteca
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {product.title}
                    </h2>
                    {product.subtitle ? (
                      <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                        {product.subtitle}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-sm leading-7 text-zinc-600">
                    {product.description}
                  </p>
                </div>

                <div className="mt-8 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                      Preço original
                    </p>
                    <p className="text-xl font-semibold text-zinc-950">
                      {formatMoney(
                        product.priceCents,
                        product.currency.toUpperCase(),
                      )}
                    </p>
                  </div>
                  <Link
                    href={`/products/${product.slug}/read`}
                    className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                  >
                    Ler agora
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-zinc-300 bg-white/70 p-8 text-zinc-600">
            Você ainda não tem produtos liberados na biblioteca.
          </div>
        )}
      </div>
    </main>
  );
}
