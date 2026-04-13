"use client";

import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

type ReaderPreviewShellProps = {
  children: ReactNode;
  isPreviewMode: boolean;
  shouldOpenPaywall: boolean;
  productId: string;
};

type PreviewPaywallContextValue = {
  isPreviewMode: boolean;
  openPaywall: () => void;
};

const PreviewPaywallContext = createContext<PreviewPaywallContextValue | null>(
  null,
);

function usePreviewPaywallContext() {
  return useContext(PreviewPaywallContext);
}

type ReaderPaywallTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  forceVisible?: boolean;
};

export function ReaderPaywallTrigger({
  children,
  forceVisible = false,
  onClick,
  ...props
}: ReaderPaywallTriggerProps) {
  const previewPaywall = usePreviewPaywallContext();

  if (!previewPaywall?.isPreviewMode && !forceVisible) {
    return null;
  }

  return (
    <button
      type="button"
      {...props}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);

        if (!event.defaultPrevented && previewPaywall) {
          previewPaywall.openPaywall();
        }
      }}
    >
      {children}
    </button>
  );
}

export function ReaderPreviewShell({
  children,
  isPreviewMode,
  shouldOpenPaywall,
  productId,
}: ReaderPreviewShellProps) {
  const [isPaywallOpen, setIsPaywallOpen] = useState(shouldOpenPaywall);
  const contextValue = useMemo<PreviewPaywallContextValue>(
    () => ({
      isPreviewMode,
      openPaywall: () => setIsPaywallOpen(true),
    }),
    [isPreviewMode],
  );

  return (
    <PreviewPaywallContext.Provider value={contextValue}>
      {children}

      {isPreviewMode && isPaywallOpen ? (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[rgba(11,35,66,0.55)] px-4">
          <div className="pointer-events-auto w-full max-w-lg rounded-[1.75rem] border border-white/30 bg-white p-7 text-[color:var(--va-ink)] shadow-[0_30px_80px_-36px_rgba(11,35,66,0.42)]">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--va-blue)]">
              Amostra gratuita concluída
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-[color:var(--va-navy)]">
              Desbloqueie o restante do curso
            </h2>
            <p className="mt-4 text-base leading-7 text-[color:var(--va-soft-ink)]">
              Você terminou o primeiro capítulo. Para liberar os próximos
              módulos e continuar a leitura completa, finalize o pagamento no
              Stripe.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <form action="/api/checkout" method="post" className="flex-1">
                <input type="hidden" name="productId" value={productId} />
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--va-blue-700),var(--va-navy))] px-5 py-3 text-sm font-bold text-white"
                >
                  Liberar curso completo
                </button>
              </form>
              <button
                type="button"
                onClick={() => setIsPaywallOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--va-line-strong)] px-5 py-3 text-sm font-bold text-[color:var(--va-blue-800)]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PreviewPaywallContext.Provider>
  );
}
