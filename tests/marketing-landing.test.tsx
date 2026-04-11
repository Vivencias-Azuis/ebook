import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CatalogLanding } from "@/components/marketing/catalog-landing";
import { ProductSalesLanding } from "@/components/marketing/product-sales-landing";

const product = {
  id: "product-guided-first-steps",
  slug: "guia-pratico-primeiros-30-dias",
  title: "Guia Prático: Primeiros 30 Dias",
  subtitle: "Um começo simples para organizar o primeiro mês",
  description:
    "Um guia para famílias que precisam entender prioridades, organizar decisões e sair da sensação de caos.",
  priceCents: 29700,
  currency: "brl",
  status: "published" as const,
  stripePriceId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("ProductSalesLanding", () => {
  it("renders the core sales promise and objections section", () => {
    const markup = renderToStaticMarkup(
      <ProductSalesLanding product={product} />,
    );

    expect(markup).toContain(
      "O guia prático para famílias que estão começando a jornada no autismo e precisam saber o que fazer primeiro",
    );
    expect(markup).toContain(
      "Se hoje tudo parece importante ao mesmo tempo, este material é para você",
    );
    expect(markup).toContain("Talvez você esteja pensando nisso agora");
    expect(markup).toContain("Comprar agora");
    expect(markup).toContain('name="productId"');
    expect(markup).toContain("R$");
  });
});

describe("CatalogLanding", () => {
  it("renders the featured offer and routes users to the product page", () => {
    const markup = renderToStaticMarkup(
      <CatalogLanding featuredProduct={product} products={[product]} />,
    );

    expect(markup).toContain(
      "Guia prático para transformar o começo da jornada em próximos passos claros",
    );
    expect(markup).toContain("Conheça o guia");
    expect(markup).toContain("/products/guia-pratico-primeiros-30-dias");
    expect(markup).toContain("Acesso imediato");
  });
});
