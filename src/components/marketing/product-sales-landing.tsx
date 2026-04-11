import { formatMoney } from "@/lib/format";

type Product = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  priceCents: number;
  currency: string;
};

const buyerSignals = [
  "Você recebeu suspeita ou diagnóstico e não sabe por onde começar.",
  "Você sente que precisa decidir tudo rápido sem entender o que é prioridade.",
  "Você está tentando organizar terapias, escola, rotina e documentos.",
  "Você já consumiu muita informação solta, mas continua sem um plano claro.",
];

const contentPillars = [
  {
    title: "Entendimento do começo da jornada",
    description:
      "O que observar, como organizar a cabeça e como reduzir a paralisia causada pelo excesso de informação.",
  },
  {
    title: "Prioridades práticas",
    description:
      "Como separar o urgente do importante e entender o que normalmente merece atenção primeiro.",
  },
  {
    title: "Terapias, escola e rotina",
    description:
      "Critérios simples para pensar as decisões do dia a dia com mais clareza e menos sobrecarga.",
  },
  {
    title: "Apoios e organização",
    description:
      "Roteiros e estruturas para transformar conhecimento em próximos passos concretos.",
  },
];

const tangibles = [
  "checklists de organização",
  "roteiros de próximos passos",
  "estruturas para reduzir a sensação de caos",
  "conteúdo aprofundado em linguagem simples",
  "material pensado para consulta, não só para leitura única",
];

const faqItems = [
  {
    question: "Sou nova nisso. Vou conseguir acompanhar?",
    answer:
      "Sim. O material foi pensado para quem está no início e precisa de clareza, não de linguagem técnica.",
  },
  {
    question: "Já li muita coisa na internet. O que muda aqui?",
    answer:
      "Aqui a informação vem organizada para virar ação, não só conhecimento solto.",
  },
  {
    question: "É superficial ou profundo demais?",
    answer:
      "O equilíbrio é justamente esse: explicar com profundidade suficiente, mas sem complicar.",
  },
  {
    question: "Serve se eu já tiver começado terapias ou escola?",
    answer:
      "Sim. Ele ajuda tanto quem está no começo quanto quem precisa reorganizar a jornada.",
  },
];

export function ProductSalesLanding({ product }: { product: Product }) {
  const price = formatMoney(product.priceCents, product.currency.toUpperCase());

  return (
    <main className="va-page text-[color:var(--va-ink)]">
      <section className="relative overflow-hidden px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-[color:var(--va-surface)] text-white shadow-[0_30px_90px_-40px_rgba(11,35,66,0.28)] ring-1 ring-[color:var(--va-line)]">
          <div className="grid gap-0 lg:grid-cols-[1.12fr_0.88fr]">
            <div className="relative overflow-hidden rounded-t-[2rem] bg-[linear-gradient(135deg,var(--va-blue-800)_0%,var(--va-blue)_48%,var(--va-navy)_100%)] px-8 py-10 sm:px-10 lg:rounded-l-[2rem] lg:rounded-tr-none lg:px-12 lg:py-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(215,231,247,0.08),transparent_28%)]" />
              <div className="relative max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--va-blue-100)]">
                  Vivências Azuis
                </p>
                <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.04] sm:text-5xl lg:text-[3.6rem]">
                  O guia prático para famílias que estão começando a jornada no
                  autismo e precisam saber o que fazer primeiro
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/84 sm:text-xl">
                  Entenda prioridades, organize os próximos passos e reduza a
                  sensação de estar perdida entre terapias, escola, rotina,
                  direitos e decisões urgentes.
                </p>

                <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-white/88">
                  <span className="va-chip va-chip-on-dark">
                    Acesso imediato
                  </span>
                  <span className="va-chip va-chip-on-dark">
                    Leitura simples
                  </span>
                  <span className="va-chip va-chip-on-dark">
                    Aplicável na rotina
                  </span>
                </div>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <form action="/api/checkout" method="post">
                    <input type="hidden" name="productId" value={product.id} />
                    <button type="submit" className="va-button-primary">
                      Comprar agora
                    </button>
                  </form>
                  <p className="max-w-sm text-sm leading-6 text-white/72">
                    Compra segura • acesso digital • leitura no seu tempo
                  </p>
                </div>
              </div>
            </div>

            <aside className="rounded-b-[2rem] bg-[linear-gradient(180deg,#f7fbff_0%,#eef4f8_100%)] px-8 py-8 sm:px-10 lg:rounded-r-[2rem] lg:rounded-bl-none lg:px-12 lg:py-12">
              <div className="mx-auto max-w-md rounded-[1.8rem] border border-white bg-white p-5 shadow-[0_28px_60px_-36px_rgba(11,35,66,0.34)]">
                <div className="rounded-[1.35rem] border border-[color:var(--va-line)] bg-white p-6 text-[color:var(--va-ink)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--va-blue)]">
                    E-book digital
                  </p>
                  <h2 className="mt-3 text-3xl font-bold leading-tight">
                    {product.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--va-soft-ink)]">
                    {product.subtitle ?? product.description}
                  </p>
                </div>

                <div className="mt-5 rounded-[1.25rem] border border-[color:var(--va-line)] bg-[color:var(--va-paper)] p-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--va-muted)]">
                        Investimento
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-[color:var(--va-ink)]">
                        {price}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--va-blue-700)]">
                      acesso imediato
                    </span>
                  </div>
                  <div className="mt-4 rounded-[1rem] bg-white p-4 text-sm leading-6 text-[color:var(--va-soft-ink)]">
                    {product.description}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="va-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--va-blue)]">
              Identificação
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-[color:var(--va-ink)] sm:text-4xl">
              Se hoje tudo parece importante ao mesmo tempo, este material é
              para você
            </h2>
          </div>
          <div className="grid gap-4">
            {buyerSignals.map((item) => (
              <div key={item} className="va-list-card">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[color:var(--va-blue)]" />
                <p className="text-base leading-7 text-[color:var(--va-soft-ink)]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[color:var(--va-line)] bg-white/80">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-16 lg:grid-cols-2 lg:px-10">
          <div className="va-panel-dark">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--va-blue-100)]">
              Transformação
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl">
              Menos confusão. Mais clareza sobre o próximo passo.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/76">
              O foco aqui não é despejar informação. É organizar a cabeça da
              família para que as decisões deixem de ser tomadas no susto.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="va-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--va-muted)]">
                Antes
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--va-soft-ink)]">
                <li>informação demais</li>
                <li>culpa por não dar conta</li>
                <li>decisões tomadas no susto</li>
                <li>dúvida sobre o que priorizar</li>
              </ul>
            </div>
            <div className="va-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--va-muted)]">
                Depois
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--va-soft-ink)]">
                <li>visão mais clara do cenário</li>
                <li>ordem do que olhar primeiro</li>
                <li>mais segurança nas conversas importantes</li>
                <li>rotina e decisões menos caóticas</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--va-blue)]">
            Conteúdo
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
            O que você vai encontrar
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {contentPillars.map((pillar) => (
            <article key={pillar.title} className="va-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--va-muted)]">
                Capítulo estratégico
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-[color:var(--va-ink)]">
                {pillar.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-[color:var(--va-soft-ink)]">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[color:var(--va-paper)]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1fr_0.9fr] lg:px-10 lg:py-20">
          <div className="va-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--va-blue)]">
              Valor tangível
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              Não é só leitura. É um material para usar.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--va-soft-ink)]">
              O e-book combina explicação, profundidade e estrutura prática para
              ajudar a família a consultar o conteúdo quando a rotina apertar.
            </p>
          </div>
          <div className="grid gap-4">
            {tangibles.map((item) => (
              <div key={item} className="va-list-card bg-white">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[color:var(--va-blue-300)]" />
                <p className="text-base leading-7 text-[color:var(--va-soft-ink)]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="va-panel-dark">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--va-blue-100)]">
              Credibilidade
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white">
              A mesma linha editorial do Vivências Azuis, agora em formato
              guiado
            </h2>
            <p className="mt-5 text-base leading-7 text-white/76">
              Este material segue a proposta do Vivências Azuis: conteúdo claro,
              prático e respeitoso para famílias no universo do autismo. Sem
              promessas mágicas, sem excesso de tecnicismo e com foco em ajudar
              você a decidir melhor.
            </p>
          </div>
          <div className="grid gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--va-blue)]">
              Talvez você esteja pensando nisso agora
            </p>
            {faqItems.map((item) => (
              <article key={item.question} className="va-panel">
                <h3 className="text-lg font-semibold text-[color:var(--va-ink)]">
                  {item.question}
                </h3>
                <p className="mt-3 text-base leading-7 text-[color:var(--va-soft-ink)]">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-18 lg:px-10 lg:pb-24">
        <div className="rounded-[2rem] border border-[color:var(--va-line)] bg-white p-8 shadow-[0_28px_90px_-46px_rgba(11,35,66,0.24)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--va-blue)]">
                Oferta final
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-[color:var(--va-ink)] sm:text-4xl">
                Tenha em mãos um guia para sair da confusão e começar com mais
                segurança
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--va-soft-ink)]">
                Para famílias que precisam de direção prática, não de mais
                ruído.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-[color:var(--va-paper)] p-6 text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--va-muted)]">
                Acesso digital
              </p>
              <p className="mt-2 text-3xl font-semibold text-[color:var(--va-ink)]">
                {price}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-[color:var(--va-line)] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm leading-6 text-[color:var(--va-soft-ink)]">
              <p>{product.title}</p>
              <p>{product.subtitle ?? "Guia prático em formato digital"}</p>
            </div>
            <form action="/api/checkout" method="post">
              <input type="hidden" name="productId" value={product.id} />
              <button type="submit" className="va-button-primary">
                Comprar agora
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
