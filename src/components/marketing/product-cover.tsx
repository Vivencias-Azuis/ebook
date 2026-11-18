import Image from "next/image";

import { getProductCoverUrl } from "@/lib/product-assets";

export function ProductCover({
  slug,
  title,
  priority = false,
  size = "shelf",
}: {
  slug: string;
  title: string;
  priority?: boolean;
  size?: "hero" | "shelf";
}) {
  const src = getProductCoverUrl(slug) ?? "/images/guia-pratico-cover.png";

  return (
    <figure className={size === "hero" ? "va-book va-book-hero" : "va-book"}>
      <span className="va-book-ribbon" aria-hidden="true" />
      <Image
        src={src}
        alt={`Capa de ${title}`}
        width={480}
        height={640}
        className="va-book-image"
        priority={priority}
      />
    </figure>
  );
}
