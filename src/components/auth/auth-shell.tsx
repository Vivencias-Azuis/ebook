import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="va-auth">
      <section className="va-auth-stage">
        <Link href="/" className="va-wordmark va-wordmark-on-dark">
          <span className="va-wordmark-ribbon" aria-hidden="true" />
          Vivências Azuis
        </Link>
        <div className="flex max-w-md flex-1 flex-col justify-center gap-10">
          <div>
            <h1 className="font-serif text-[32px] font-medium leading-[1.15] text-[#fbf8f2] sm:text-[36px]">
              Guias para famílias em jornada autista
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-[#fbf8f2]/72">
              Conteúdo editorial pensado para organizar decisões, reduzir a
              sobrecarga e entender o que fazer primeiro.
            </p>
          </div>
          <figure className="va-book">
            <span className="va-book-ribbon" aria-hidden="true" />
            <Image
              src="/images/guia-pratico-cover.png"
              alt="Capa do Guia Prático Primeiros 30 Dias"
              width={480}
              height={640}
              className="va-book-image"
            />
          </figure>
        </div>
      </section>
      <section className="va-auth-form-col">
        <div className="w-full max-w-sm">
          <p className="va-kicker">Conta</p>
          <h2 className="mt-3 font-serif text-[32px] font-medium leading-tight text-[color:var(--va-ink)]">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--va-soft-ink)]">
            {description}
          </p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
