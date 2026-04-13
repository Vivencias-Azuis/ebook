import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Reembolso",
  description:
    "Condições de reembolso para produtos digitais do Vivências Azuis.",
};

export default function ReembolsoPage() {
  return (
    <main className="va-page min-h-screen text-[color:var(--va-ink)]">
      <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <header className="mb-12">
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-[0.24em] text-[color:var(--va-blue)]"
          >
            Vivências Azuis
          </Link>
          <h1 className="mt-6 font-serif text-4xl font-bold leading-tight text-[color:var(--va-navy)]">
            Política de Reembolso
          </h1>
          <p className="mt-4 text-sm text-[color:var(--va-muted)]">
            Última atualização: abril de 2026
          </p>
        </header>

        <div className="space-y-10 text-base leading-8 text-[color:var(--va-soft-ink)]">
          <section className="rounded-[1.5rem] border border-[color:var(--va-line)] bg-white p-7">
            <p className="text-lg font-semibold text-[color:var(--va-ink)]">
              Resumo simples
            </p>
            <p className="mt-3">
              Se você comprou um produto e não ficou satisfeita, peça o
              reembolso em até <strong>7 dias</strong> após a compra. Sem
              burocracia, sem precisar justificar.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-[color:var(--va-ink)]">
              Prazo para solicitação
            </h2>
            <p>
              Você tem <strong>7 dias corridos</strong> a partir da data da
              compra para solicitar o reembolso, conforme o Código de Defesa do
              Consumidor (Art. 49 da Lei nº 8.078/1990), que garante o direito
              de arrependimento em compras realizadas fora do estabelecimento
              comercial.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-[color:var(--va-ink)]">
              Como solicitar
            </h2>
            <p>
              Entre em contato por e-mail com o assunto{" "}
              <strong>&ldquo;Reembolso&rdquo;</strong> e o endereço de e-mail
              usado na compra. Processamos o reembolso em até 5 dias úteis após
              a confirmação.
            </p>
            <p className="mt-4">
              O valor é estornado diretamente no cartão ou conta usada no
              pagamento, pelo mesmo meio processado pelo Stripe. O prazo de
              crédito depende da operadora do cartão.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-[color:var(--va-ink)]">
              O que acontece com o acesso
            </h2>
            <p>
              Após a confirmação do reembolso, o acesso ao produto é revogado na
              plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-[color:var(--va-ink)]">
              Dúvidas
            </h2>
            <p>
              Se tiver qualquer problema com o acesso ao produto antes de pedir
              o reembolso, entre em contato — muitas vezes conseguimos resolver
              rapidamente.
            </p>
          </section>
        </div>

        <footer className="mt-16 border-t border-[color:var(--va-line)] pt-8 text-sm text-[color:var(--va-muted)]">
          <p>
            <Link
              href="/privacidade"
              className="text-[color:var(--va-blue)] underline"
            >
              Política de privacidade
            </Link>{" "}
            ·{" "}
            <Link href="/" className="text-[color:var(--va-blue)] underline">
              Voltar ao início
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
