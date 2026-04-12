"use server";

import { revalidatePath } from "next/cache";

import {
  createProduct,
  updateProduct,
} from "@/domains/admin/product-mutations";
import { requireAdminSession } from "@/domains/auth/server";

export type ActionState = {
  success: boolean;
  error?: string;
  productId?: string;
};

export async function createProductAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminSession();

  try {
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const priceCentsRaw = parseInt(formData.get("priceCents") as string, 10);
    const priceCents = isNaN(priceCentsRaw) ? 0 : priceCentsRaw;
    const subtitle = formData.get("subtitle") as string | null;
    const stripePriceId = formData.get("stripePriceId") as string | null;

    const product = await createProduct({
      title,
      slug,
      description,
      priceCents,
      ...(subtitle && subtitle.length > 0 ? { subtitle } : {}),
      ...(stripePriceId && stripePriceId.length > 0 ? { stripePriceId } : {}),
    });

    revalidatePath("/admin");

    return { success: true, productId: product.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function updateProductAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminSession();

  try {
    const productId = formData.get("productId") as string;

    if (!productId) {
      return { success: false, error: "productId is required" };
    }

    const getString = (key: string): string | undefined => {
      const val = formData.get(key) as string | null;
      return val && val.length > 0 ? val : undefined;
    };

    const priceCentsRaw = formData.get("priceCents") as string | null;
    const priceCentsParsed =
      priceCentsRaw && priceCentsRaw.length > 0
        ? parseInt(priceCentsRaw, 10)
        : undefined;
    const priceCents =
      priceCentsParsed !== undefined && !isNaN(priceCentsParsed)
        ? priceCentsParsed
        : undefined;

    const statusRaw = getString("status");
    const status =
      statusRaw === "draft" ||
      statusRaw === "published" ||
      statusRaw === "archived"
        ? statusRaw
        : undefined;

    await updateProduct(productId, {
      title: getString("title"),
      slug: getString("slug"),
      description: getString("description"),
      priceCents,
      status,
      subtitle: getString("subtitle"),
      stripePriceId: getString("stripePriceId"),
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/products/${productId}/settings`);
    revalidatePath(`/admin/editor/${productId}`);

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
