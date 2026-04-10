import Link from "next/link";

import { getPublishedProducts } from "@/domains/products/queries";
import { formatMoney } from "@/lib/format";

export default async function AdminPage() {
  const products = await getPublishedProducts();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,#fafaf9_0%,#ffffff_60%)] text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12 lg:px-10">
        <header className="flex flex-col gap-6 border-b border-zinc-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">
              Admin
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Painel inicial de produtos.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-zinc-600">
              Esta é apenas a casca administrativa para acompanhar os produtos
              publicados e abrir espaço para os próximos fluxos internos.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-zinc-950 bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Novo produto
          </button>
        </header>

        <section className="mt-10 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/90 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.28)] backdrop-blur">
          <div className="border-b border-zinc-200 px-6 py-4 sm:px-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Produtos publicados
            </p>
          </div>

          {products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-left">
                <thead className="bg-zinc-50/80">
                  <tr>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 sm:px-8">
                      Produto
                    </th>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                      Preço
                    </th>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                      Página pública
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {products.map((product) => (
                    <tr key={product.id} className="align-top">
                      <td className="px-6 py-5 sm:px-8">
                        <div className="space-y-1">
                          <p className="text-base font-semibold tracking-tight text-zinc-950">
                            {product.title}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {product.slug}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-emerald-800">
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-zinc-900">
                        {formatMoney(
                          product.priceCents,
                          product.currency.toUpperCase(),
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <Link
                          href={`/products/${product.slug}`}
                          className="text-sm font-medium text-zinc-950 transition-colors hover:text-zinc-600"
                        >
                          Abrir produto
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-10 sm:px-8">
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
                Nenhum produto publicado disponível para listar no momento.
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
