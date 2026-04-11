import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";

type RegisterPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;
  const nextPath =
    typeof params?.next === "string" && params.next.startsWith("/")
      ? params.next
      : "/library";

  return (
    <main className="min-h-screen text-[color:var(--va-ink)]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Coluna esquerda — dark editorial */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,var(--va-blue-800)_0%,var(--va-navy)_100%)] px-10 py-12 lg:w-1/2 lg:px-14 lg:py-16">
          <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-[rgba(122,180,227,0.08)]" />
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[color:var(--va-blue-300)]">
            Vivências Azuis
          </p>
          <div className="my-12 lg:my-0">
            <h1 className="font-serif text-3xl font-bold leading-snug text-white sm:text-4xl">
              Guias para famílias em jornada autista
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/72">
              Conteúdo editorial pensado para organizar decisões, reduzir a
              sobrecarga e entender o que fazer primeiro.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="va-chip va-chip-on-dark text-sm font-semibold text-white/88">
                Acesso imediato
              </span>
              <span className="va-chip va-chip-on-dark text-sm font-semibold text-white/88">
                Linguagem simples
              </span>
              <span className="va-chip va-chip-on-dark text-sm font-semibold text-white/88">
                Aplicável na rotina
              </span>
            </div>
          </div>
        </div>

        {/* Coluna direita — formulário */}
        <div className="va-page flex flex-1 items-center justify-center px-8 py-12 lg:px-14">
          <section className="w-full max-w-sm">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--va-blue)]">
              Conta
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-[color:var(--va-navy)]">
              Criar conta
            </h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--va-soft-ink)]">
              Cadastre-se com seu nome, email e senha.
            </p>

            <div className="mt-8">
              <AuthForm mode="register" nextPath={nextPath} />
            </div>

            <p className="mt-6 text-sm text-[color:var(--va-soft-ink)]">
              Já tem conta?{" "}
              <Link
                className="font-bold text-[color:var(--va-blue-700)] hover:underline"
                href={`/login?next=${encodeURIComponent(nextPath)}`}
              >
                Entrar
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
