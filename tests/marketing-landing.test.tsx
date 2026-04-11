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
  it("renders only the real course catalog and routes users to login with a reader redirect", () => {
    const sampleProduct = {
      ...product,
      id: "product-guided-first-steps",
      slug: "guia-pratico-primeiros-30-dias",
      title: "Guia Prático: Primeiros 30 Dias",
      description:
        "Um guia introdutório publicado para validar a base do catálogo e do leitor.",
    };
    const realProduct = {
      ...product,
      id: "product-guia-pratico-primeiros-30-dias",
      slug: "guia-pratico-primeiros-30-dias-apos-diagnostico",
      title: "Guia Prático: Primeiros 30 Dias Após Suspeita ou Diagnóstico",
    };

    const markup = renderToStaticMarkup(
      <CatalogLanding featuredProduct={realProduct} products={[realProduct]} />,
    );

    expect(markup).toContain("Vivências Azuis");
    expect(markup).toContain("Cursos disponíveis");
    expect(markup).toContain("Entrar para começar");
    expect(markup).toContain(
      "/login?next=%2Fproducts%2Fguia-pratico-primeiros-30-dias-apos-diagnostico%2Fread",
    );
    expect(markup).not.toContain("Curso em destaque");
    expect(markup).not.toContain("Primeiro capítulo liberado");
    expect(markup).toContain(
      "Guia Prático: Primeiros 30 Dias Após Suspeita ou Diagnóstico",
    );
    expect(markup).not.toContain(
      "/login?next=%2Fproducts%2Fguia-pratico-primeiros-30-dias%2Fread",
    );
    expect(markup).not.toContain(sampleProduct.description);
  });
});
