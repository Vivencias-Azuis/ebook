import { requireAdminSession } from "@/domains/auth/server";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  await requireAdminSession();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,#fafaf9_0%,#ffffff_60%)] text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12 lg:px-10">
        <header className="flex flex-col gap-6 border-b border-zinc-200 pb-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">
              Admin
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Novo produto
            </h1>
          </div>
        </header>

        <section className="mt-10">
          <ProductForm />
        </section>
      </div>
    </main>
  );
}
