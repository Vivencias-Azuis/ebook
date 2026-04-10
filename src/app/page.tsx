import { getPublishedProducts } from "@/domains/products/queries";
import { CatalogLanding } from "@/components/marketing/catalog-landing";

export default async function Home() {
  const products = await getPublishedProducts();
  const featuredProduct = products[0] ?? null;

  return <CatalogLanding featuredProduct={featuredProduct} products={products} />;
}
