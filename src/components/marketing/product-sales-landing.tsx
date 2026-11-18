import { formatMoney } from "@/lib/format";
import { ProductCover } from "@/components/marketing/product-cover";
import {
  Kicker,
  SiteFooter,
  SiteHeader,
} from "@/components/marketing/site-chrome";

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

function BuyButton({
  productId,
  onDark = false,
}: {
  productId: string;
  onDark?: boolean;
}) {
  return (
    <form action="/api/checkout" method="post">
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        className={
          onDark ? "va-button-primary va-button-on-dark" : "va-button-primary"
        }
      >
        Comprar agora
      </button>
    </form>
  );
}

export function ProductSalesLanding({ product }: { product: Product }) {
  const price = formatMoney(product.priceCents, product.currency.toUpperCase());

  return (
    <main className="va-page text-[color:var(--va-ink)]">
      <SiteHeader />

      <section className="va-shell grid min-w-0 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-16 lg:py-16 lg:min-h-[calc(100svh-64px)]">
        <div className="min-w-0">
          <Kicker>Guia prático</Kicker>
          <h1 className="mt-5 max-w-xl text-pretty font-serif text-[32px] font-medium leading-[1.12] text-[color:var(--va-ink)] sm:text-[44px] sm:leading-[1.08] sm:tracking-[-0.02em]">
            O guia prático para famílias que estão começando a jornada no
            autismo e precisam saber o que fazer primeiro
          </h1>
          <p className="mt-6 max-w-xl text-[18px] leading-8 text-[color:var(--va-soft-ink)]">
            Entenda prioridades, organize os próximos passos e reduza a sensação
            de estar perdida entre terapias, escola, rotina, direitos e decisões
            urgentes.
          </p>
          <p className="mt-5 text-sm leading-6 text-[color:var(--va-muted)]">
            Acesso imediato · Leitura simples · Aplicável na rotina
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <BuyButton productId={product.id} />
            <p className="text-sm leading-6 text-[color:var(--va-muted)]">
              Compra segura · acesso digital · leitura no seu tempo
            </p>
          </div>
        </div>
        <div className="flex min-w-0 flex-col items-center gap-5 lg:items-end">
          <ProductCover
            slug={product.slug}
            title={product.title}
            priority
            size="hero"
          />
          <div className="w-full max-w-[400px]">
            <p className="font-serif text-[20px] font-medium leading-tight">
              {product.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--va-soft-ink)]">
              {product.subtitle ?? product.description}
            </p>
            <p className="va-price mt-4 text-[28px] leading-none text-[color:var(--va-ink)]">
              {price}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[color:var(--va-line)]">
        <div className="va-shell grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-20">
          <div>
            <Kicker index="01">Identificação</Kicker>
            <h2 className="mt-4 font-serif text-[32px] font-medium leading-tight sm:text-[40px]">
              Se hoje tudo parece importante ao mesmo tempo, este material é
              para você
            </h2>
          </div>
          <ol className="m-0 list-none p-0">
            {buyerSignals.map((item, index) => (
              <li key={item} className="va-list-card">
                <span className="va-kicker-num mt-0.5 w-6 shrink-0 text-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-[15px] leading-7 text-[color:var(--va-soft-ink)]">
                  {item}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-[color:var(--va-line)]">
        <div className="va-shell grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div>
            <Kicker index="02">Transformação</Kicker>
            <h2 className="mt-4 font-serif text-[32px] font-medium leading-tight sm:text-[40px]">
              Menos confusão. Mais clareza sobre o próximo passo.
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-[color:var(--va-soft-ink)]">
              O foco aqui não é despejar informação. É organizar a cabeça da
              família para que as decisões deixem de ser tomadas no susto.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
            <div>
              <Kicker>Antes</Kicker>
              <ul className="mt-4 space-y-3 text-[15px] leading-7 text-[color:var(--va-soft-ink)]">
                <li>informação demais</li>
                <li>culpa por não dar conta</li>
                <li>decisões tomadas no susto</li>
                <li>dúvida sobre o que priorizar</li>
              </ul>
            </div>
            <div>
              <Kicker>Depois</Kicker>
              <ul className="mt-4 space-y-3 text-[15px] leading-7 text-[color:var(--va-soft-ink)]">
                <li>visão mais clara do cenário</li>
                <li>ordem do que olhar primeiro</li>
                <li>mais segurança nas conversas importantes</li>
                <li>rotina e decisões menos caóticas</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[color:var(--va-line)]">
        <div className="va-shell py-16 lg:py-20">
          <div className="max-w-2xl">
            <Kicker index="03">Conteúdo</Kicker>
            <h2 className="mt-4 font-serif text-[32px] font-medium leading-tight sm:text-[40px]">
              O que você vai encontrar
            </h2>
          </div>
          <ol className="mt-10 grid list-none gap-x-12 gap-y-8 p-0 md:grid-cols-2">
            {contentPillars.map((pillar, index) => (
              <li
                key={pillar.title}
                className="border-t border-[color:var(--va-line)] pt-6"
              >
                <Kicker index={String(index + 1).padStart(2, "0")}>
                  Capítulo
                </Kicker>
                <h3 className="mt-3 font-serif text-[22px] font-medium leading-tight text-[color:var(--va-ink)]">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-[color:var(--va-soft-ink)]">
                  {pillar.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-[color:var(--va-line)]">
        <div className="va-shell grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
          <div>
            <Kicker index="04">Valor tangível</Kicker>
            <h2 className="mt-4 font-serif text-[32px] font-medium leading-tight sm:text-[40px]">
              Não é só leitura. É um material para usar.
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-[color:var(--va-soft-ink)]">
              O e-book combina explicação, profundidade e estrutura prática para
              ajudar a família a consultar o conteúdo quando a rotina apertar.
            </p>
          </div>
          <ul className="m-0 list-none p-0">
            {tangibles.map((item, index) => (
              <li key={item} className="va-list-card">
                <span className="va-kicker-num mt-0.5 w-6 shrink-0 text-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-[15px] leading-7 text-[color:var(--va-soft-ink)]">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-[color:var(--va-line)]">
        <div className="va-shell grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-20">
          <div>
            <Kicker index="05">Credibilidade</Kicker>
            <h2 className="mt-4 font-serif text-[32px] font-medium leading-tight sm:text-[40px]">
              A mesma linha editorial do Vivências Azuis, agora em formato
              guiado
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-[color:var(--va-soft-ink)]">
              Este material segue a proposta do Vivências Azuis: conteúdo claro,
              prático e respeitoso para famílias no universo do autismo. Sem
              promessas mágicas, sem excesso de tecnicismo e com foco em ajudar
              você a decidir melhor.
            </p>
          </div>
          <div>
            <Kicker>Talvez você esteja pensando nisso agora</Kicker>
            <div className="mt-6">
              {faqItems.map((item) => (
                <article
                  key={item.question}
                  className="border-t border-[color:var(--va-line)] py-5"
                >
                  <h3 className="text-[16px] font-medium leading-6 text-[color:var(--va-ink)]">
                    {item.question}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-[color:var(--va-soft-ink)]">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[color:var(--va-line)]">
        <div className="va-shell max-w-3xl py-16 lg:py-20">
          <Kicker index="06">Garantia</Kicker>
          <h2 className="mt-4 font-serif text-[32px] font-medium leading-tight">
            Garantia de 7 dias
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-[color:var(--va-soft-ink)]">
            Se você comprar e sentir que o material não era o que precisava,
            basta enviar um e-mail em até 7 dias e devolvemos o valor
            integralmente. Sem perguntas.
          </p>
        </div>
      </section>

      <section className="va-offer">
        <div className="va-shell grid gap-8 py-16 lg:grid-cols-[1fr_auto] lg:items-end lg:py-20">
          <div>
            <Kicker index="07" className="text-[#fbf8f2]/64">
              Oferta
            </Kicker>
            <h2 className="mt-4 max-w-xl font-serif text-[32px] font-medium leading-tight text-[#fbf8f2] sm:text-[40px]">
              Tenha em mãos um guia para sair da confusão e começar com mais
              segurança
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#fbf8f2]/72">
              Para famílias que precisam de direção prática, não de mais ruído.
            </p>
            <p className="mt-6 text-[15px] leading-6 text-[#fbf8f2]/72">
              {product.title}
              {product.subtitle ? ` · ${product.subtitle}` : ""}
            </p>
          </div>
          <div className="flex flex-col items-start gap-5 lg:items-end">
            <p className="va-price text-[32px] leading-none text-[#fbf8f2]">
              {price}
            </p>
            <BuyButton productId={product.id} onDark />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
