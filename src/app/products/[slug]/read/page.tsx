import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireServerSession } from "@/domains/auth/server";
import { canAccessProduct, getUserProductEntitlement } from "@/domains/orders/access";
import { getProductBySlug, getPublishedProductContent } from "@/domains/products/queries";
import { BlockRenderer } from "@/features/reader/block-renderer";

type ProductReadPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductReadPage({ params }: ProductReadPageProps) {
  const session = await requireServerSession();
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "published") {
    notFound();
  }

  const entitlement = await getUserProductEntitlement(session.user.id, product.id);

  if (!canAccessProduct(entitlement)) {
    redirect(`/products/${product.slug}`);
  }

  const chapters = await getPublishedProductContent(product.id);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_30%),linear-gradient(180deg,#ffffff_0%,#fafaf9_65%)] text-zinc-950">
      <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/library"
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-950"
          >
            ← Voltar para a biblioteca
          </Link>
          <Link
            href={`/products/${product.slug}`}
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-950"
          >
            Ver página do produto
          </Link>
        </div>

        <section className="rounded-[2rem] border border-zinc-200 bg-white shadow-[0_28px_80px_-48px_rgba(15,23,42,0.32)]">
          <div className="border-b border-zinc-200 px-6 py-8 sm:px-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">
              Leitura
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {product.title}
            </h1>
            {product.subtitle ? (
              <p className="mt-3 max-w-3xl text-base leading-8 text-zinc-600">
                {product.subtitle}
              </p>
            ) : null}
          </div>

          <div className="grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="border-b border-zinc-200 bg-zinc-50/80 px-6 py-6 lg:border-b-0 lg:border-r lg:px-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                Capítulos
              </p>
              <nav className="mt-4 space-y-2">
                {chapters.map((chapter) => (
                  <a
                    key={chapter.id}
                    href={`#${chapter.id}`}
                    className="block rounded-xl border border-transparent px-3 py-2 text-sm leading-6 text-zinc-600 transition-colors hover:border-zinc-200 hover:bg-white hover:text-zinc-950"
                  >
                    <span className="block font-medium text-zinc-950">
                      {chapter.title}
                    </span>
                    <span className="block text-xs text-zinc-500">
                      {chapter.blocks.length} bloco{chapter.blocks.length === 1 ? "" : "s"}
                    </span>
                  </a>
                ))}
              </nav>
            </aside>

            <div className="space-y-10 px-6 py-8 sm:px-8">
              {chapters.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
                  Nenhum capítulo publicado ainda.
                </div>
              ) : null}

              {chapters.map((chapter) => (
                <section key={chapter.id} id={chapter.id} className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                      Capítulo {chapter.sortOrder}
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {chapter.title}
                    </h2>
                  </div>

                  <div className="space-y-8">
                    {chapter.blocks.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-600">
                        Nenhum bloco publicado neste capítulo.
                      </div>
                    ) : null}

                    {chapter.blocks.map((block) => (
                      <BlockRenderer
                        key={block.id}
                        type={block.type}
                        title={block.title}
                        payloadJson={block.payloadJson}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
