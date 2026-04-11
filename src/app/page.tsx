import { getPublishedProducts } from "@/domains/products/queries";
import { CatalogLanding } from "@/components/marketing/catalog-landing";

const HIDDEN_MARKETING_PRODUCT_SLUGS = new Set([
  "guia-pratico-primeiros-30-dias",
]);

export default async function Home() {
  const publishedProducts = await getPublishedProducts();
  const products = publishedProducts.filter(
    (product) => !HIDDEN_MARKETING_PRODUCT_SLUGS.has(product.slug),
  );
  const featuredProduct = products[0] ?? null;

  return (
    <CatalogLanding featuredProduct={featuredProduct} products={products} />
  );
}
