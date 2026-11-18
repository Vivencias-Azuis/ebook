import { requireServerSession } from "@/domains/auth/server";
import { LibraryLanding } from "@/components/library/library-landing";
import {
  deriveLibraryCheckoutMessage,
  getUserLibraryProducts,
} from "@/domains/products/library";
import { getUserProgressSummariesForProducts } from "@/domains/progress/queries";

type LibraryPageProps = {
  searchParams?: Promise<{
    checkout?: string;
  }>;
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const session = await requireServerSession();
  const [products, params] = await Promise.all([
    getUserLibraryProducts(session.user.id),
    searchParams,
  ]);
  const checkout = params?.checkout;
  const hasUnlockedProducts = products.some((product) => product.hasAccess);
  const progressSummaries = await getUserProgressSummariesForProducts(
    session.user.id,
    products.map((product) => product.productId),
  );
  const checkoutMessage = deriveLibraryCheckoutMessage(
    checkout,
    hasUnlockedProducts,
  );

  return (
    <LibraryLanding
      products={products}
      progressSummaries={progressSummaries}
      checkoutMessage={checkoutMessage}
    />
  );
}
