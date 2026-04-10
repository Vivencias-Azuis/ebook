import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductBySlug } from "@/domains/products/queries";
import { formatMoney } from "@/lib/format";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "published") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_30%),linear-gradient(180deg,#ffffff_0%,#fafaf9_65%)] text-zinc-950">
      <div className="mx-auto w-full max-w-4xl px-6 py-12 lg:px-10">
        <div className="mb-10">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-950"
          >
            ← Voltar para a vitrine
          </Link>
        </div>

        <article className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.32)] sm:p-10">
          <div className="space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">
              Produto publicado
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {product.title}
            </h1>
            {product.subtitle ? (
              <p className="max-w-2xl text-lg leading-8 text-zinc-600">
                {product.subtitle}
              </p>
            ) : null}
            <p className="max-w-3xl text-base leading-8 text-zinc-700">
              {product.description}
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-6 rounded-3xl bg-zinc-50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                Investimento
              </p>
              <p className="text-3xl font-semibold text-zinc-950">
                {formatMoney(product.priceCents, product.currency.toUpperCase())}
              </p>
            </div>

            <form action="/api/checkout" method="post">
              <input type="hidden" name="productId" value={product.id} />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto"
              >
                Comprar agora
              </button>
            </form>
          </div>
        </article>
      </div>
    </main>
  );
}
