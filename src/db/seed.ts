import { db } from "./client";
import { chapters, contentBlocks, products } from "./schema";

async function main() {
  const productId = "product-guided-first-steps";
  const chapterId = "chapter-intro";
  const blockId = "block-intro-rich-text";

  await db
    .insert(products)
    .values({
      id: productId,
      slug: "guia-pratico-primeiros-30-dias",
      title: "Guia Prático: Primeiros 30 Dias",
      subtitle: "Um começo simples para organizar o primeiro mês",
      description:
        "Um guia introdutório publicado para validar a base do catálogo e do leitor.",
      priceCents: 29700,
      currency: "brl",
      status: "published",
      stripePriceId: null,
    })
    .onConflictDoNothing();

  await db
    .insert(chapters)
    .values({
      id: chapterId,
      productId,
      title: "Introdução",
      sortOrder: 1,
      isPublished: true,
    })
    .onConflictDoNothing();

  await db
    .insert(contentBlocks)
    .values({
      id: blockId,
      chapterId,
      type: "rich_text",
      title: "Bem-vindo",
      payloadJson: JSON.stringify({
        markdown: "Este é o primeiro bloco publicado do guia.",
      }),
      sortOrder: 1,
      isPublished: true,
    })
    .onConflictDoNothing();
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
