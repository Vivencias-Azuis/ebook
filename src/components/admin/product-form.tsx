"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createProductAction,
  updateProductAction,
  type ActionState,
} from "@/app/admin/products/actions";

type Product = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string;
  priceCents: number;
  status: string;
  stripePriceId: string | null;
};

type ProductFormProps = {
  product?: Product;
};

const initialState: ActionState = { success: false };

const INPUT_CLASS =
  "w-full rounded-[0.75rem] border border-zinc-200 bg-white px-4 py-3 text-zinc-950 shadow-[0_2px_6px_-4px_rgba(15,23,42,0.12)] outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100";

const LABEL_CLASS = "block text-sm font-semibold text-zinc-700";

export function ProductForm({ product }: ProductFormProps) {
  const isEdit = product !== undefined;

  const action = isEdit ? updateProductAction : createProductAction;

  const [state, formAction, isPending] = useActionState(action, initialState);

  const showEditorLink = isEdit || (state.success && state.productId);
  const editorProductId = isEdit ? product.id : state.productId;

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-6">
        {isEdit && <input type="hidden" name="productId" value={product.id} />}

        {/* Title */}
        <div className="space-y-1.5">
          <label className={LABEL_CLASS} htmlFor="title">
            Título
          </label>
          <input
            className={INPUT_CLASS}
            id="title"
            name="title"
            type="text"
            required
            defaultValue={product?.title ?? ""}
          />
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <label className={LABEL_CLASS} htmlFor="slug">
            Slug
          </label>
          <input
            className={INPUT_CLASS}
            id="slug"
            name="slug"
            type="text"
            required
            defaultValue={product?.slug ?? ""}
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-1.5">
          <label className={LABEL_CLASS} htmlFor="subtitle">
            Subtítulo{" "}
            <span className="font-normal text-zinc-400">(opcional)</span>
          </label>
          <input
            className={INPUT_CLASS}
            id="subtitle"
            name="subtitle"
            type="text"
            defaultValue={product?.subtitle ?? ""}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className={LABEL_CLASS} htmlFor="description">
            Descrição
          </label>
          <textarea
            className={`${INPUT_CLASS} min-h-[8rem] resize-y`}
            id="description"
            name="description"
            required
            defaultValue={product?.description ?? ""}
          />
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <label className={LABEL_CLASS} htmlFor="priceCents">
            Preço (centavos){" "}
            <span className="font-normal text-zinc-400">(BRL)</span>
          </label>
          <input
            className={INPUT_CLASS}
            id="priceCents"
            name="priceCents"
            type="number"
            required
            min={0}
            defaultValue={product?.priceCents ?? ""}
          />
        </div>

        {/* Status — edit mode only */}
        {isEdit && (
          <div className="space-y-1.5">
            <label className={LABEL_CLASS} htmlFor="status">
              Status
            </label>
            <select
              className={INPUT_CLASS}
              id="status"
              name="status"
              defaultValue={product.status}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        )}

        {/* Stripe Price ID */}
        <div className="space-y-1.5">
          <label className={LABEL_CLASS} htmlFor="stripePriceId">
            Stripe Price ID{" "}
            <span className="font-normal text-zinc-400">(opcional)</span>
          </label>
          <input
            className={INPUT_CLASS}
            id="stripePriceId"
            name="stripePriceId"
            type="text"
            defaultValue={product?.stripePriceId ?? ""}
          />
        </div>

        {/* Error */}
        {state.error ? (
          <p className="rounded-[0.75rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-full border border-zinc-950 bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Aguarde..."
            : isEdit
              ? "Salvar alterações"
              : "Criar produto"}
        </button>
      </form>

      {/* Post-save CTA */}
      {showEditorLink && editorProductId ? (
        <div className="rounded-[2rem] border border-zinc-200 bg-white/90 px-6 py-5 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.28)]">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Conteúdo
          </p>
          <Link
            href={`/admin/editor/${editorProductId}`}
            className="inline-flex items-center justify-center rounded-full border border-zinc-950 bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Editar conteúdo do produto
          </Link>
        </div>
      ) : null}
    </div>
  );
}
