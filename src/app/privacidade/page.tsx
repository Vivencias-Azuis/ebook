import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o Vivências Azuis coleta, usa e protege seus dados pessoais.",
};

export default function PrivacidadePage() {
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
            Política de Privacidade
          </h1>
          <p className="mt-4 text-sm text-[color:var(--va-muted)]">
            Última atualização: abril de 2026
          </p>
        </header>

        <div className="prose prose-slate max-w-none space-y-10 text-base leading-8 text-[color:var(--va-soft-ink)]">
          <section>
            <h2 className="mb-3 text-xl font-bold text-[color:var(--va-ink)]">
              1. Quem somos
            </h2>
            <p>
              O Vivências Azuis é responsável pelo tratamento dos dados
              coletados nesta plataforma. Para dúvidas sobre privacidade, entre
              em contato pelo e-mail disponível na página de contato.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-[color:var(--va-ink)]">
              2. Dados que coletamos
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Dados de conta:</strong> nome e endereço de e-mail
                fornecidos no cadastro.
              </li>
              <li>
                <strong>Dados de compra:</strong> registros de pedidos e acesso
                a produtos adquiridos. Dados de pagamento são processados
                diretamente pelo Stripe — não armazenamos número de cartão.
              </li>
              <li>
                <strong>Dados de uso:</strong> progresso de leitura e interações
                com o conteúdo, para permitir que você continue de onde parou.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-[color:var(--va-ink)]">
              3. Como usamos seus dados
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Criar e manter sua conta na plataforma.</li>
              <li>Processar sua compra e liberar acesso ao produto.</li>
              <li>Salvar seu progresso de leitura.</li>
              <li>Entrar em contato sobre sua conta quando necessário.</li>
            </ul>
            <p className="mt-4">
              Não vendemos nem compartilhamos seus dados com terceiros para fins
              de marketing.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-[color:var(--va-ink)]">
              4. Compartilhamento de dados
            </h2>
            <p>
              Seus dados são compartilhados apenas com os serviços necessários
              para o funcionamento da plataforma:
            </p>
            <ul className="list-disc space-y-2 pl-5 mt-3">
              <li>
                <strong>Stripe</strong> — processamento de pagamento (sujeito à{" "}
                <a
                  href="https://stripe.com/br/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[color:var(--va-blue)] underline"
                >
                  política de privacidade do Stripe
                </a>
                ).
              </li>
              <li>
                <strong>Turso/libSQL</strong> — banco de dados onde suas
                informações são armazenadas de forma segura.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-[color:var(--va-ink)]">
              5. Seus direitos (LGPD)
            </h2>
            <p>
              De acordo com a Lei Geral de Proteção de Dados (Lei nº
              13.709/2018), você tem direito a:
            </p>
            <ul className="list-disc space-y-2 pl-5 mt-3">
              <li>Confirmar a existência de tratamento dos seus dados.</li>
              <li>Acessar os dados que temos sobre você.</li>
              <li>Corrigir dados incompletos ou desatualizados.</li>
              <li>
                Solicitar a exclusão dos seus dados pessoais, exceto os
                necessários por obrigação legal.
              </li>
            </ul>
            <p className="mt-4">
              Para exercer qualquer desses direitos, entre em contato por
              e-mail.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-[color:var(--va-ink)]">
              6. Retenção de dados
            </h2>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa. Após
              solicitação de exclusão, removemos seus dados em até 30 dias,
              exceto os que precisamos guardar por obrigações legais ou fiscais.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-[color:var(--va-ink)]">
              7. Cookies
            </h2>
            <p>
              Utilizamos apenas cookies estritamente necessários para manter sua
              sessão autenticada na plataforma. Não utilizamos cookies de
              rastreamento de terceiros.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-[color:var(--va-ink)]">
              8. Alterações nesta política
            </h2>
            <p>
              Esta política pode ser atualizada periodicamente. A data de última
              atualização fica sempre registrada no topo desta página. Mudanças
              significativas serão comunicadas por e-mail.
            </p>
          </section>
        </div>

        <footer className="mt-16 border-t border-[color:var(--va-line)] pt-8 text-sm text-[color:var(--va-muted)]">
          <p>
            Dúvidas?{" "}
            <Link
              href="/reembolso"
              className="text-[color:var(--va-blue)] underline"
            >
              Política de reembolso
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
