import { notFound } from "next/navigation";
import Link from "next/link";

import { requireAdminSession } from "@/domains/auth/server";
import { getProductByIdForAdmin } from "@/domains/admin/product-queries";
import { ProductForm } from "@/components/admin/product-form";

type Props = {
  params: Promise<{ productId: string }>;
};

export default async function ProductSettingsPage({ params }: Props) {
  await requireAdminSession();

  const { productId } = await params;
  const product = await getProductByIdForAdmin(productId);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,#fafaf9_0%,#ffffff_60%)] text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12 lg:px-10">
        <header className="flex flex-col gap-6 border-b border-zinc-200 pb-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">
              Admin
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Configurações do produto
            </h1>
            <p className="text-lg text-zinc-600">{product.title}</p>
          </div>
        </header>

        <section className="mt-10">
          <ProductForm product={product} />
        </section>

        <section className="mt-10 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/90 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.28)] backdrop-blur">
          <div className="px-8 py-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              Links rápidos
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <Link
                  href={`/products/${product.slug}`}
                  className="text-sm font-medium text-zinc-700 underline-offset-4 hover:text-zinc-900 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver produto
                </Link>
              </li>
              <li>
                <Link
                  href={`/products/${product.slug}/read`}
                  className="text-sm font-medium text-zinc-700 underline-offset-4 hover:text-zinc-900 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ler produto
                </Link>
              </li>
              <li>
                <Link
                  href={`/admin/editor/${product.id}`}
                  className="text-sm font-medium text-zinc-700 underline-offset-4 hover:text-zinc-900 hover:underline"
                >
                  Editar conteúdo
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
