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
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[rgba(11,35,66,0.48)] px-4">
          <div className="va-paywall pointer-events-auto w-full max-w-lg">
            <p className="va-kicker">
              <span className="va-kicker-num">01</span>
              Amostra gratuita concluída
            </p>
            <h2 className="mt-4 font-serif text-[32px] font-medium leading-tight text-[color:var(--va-ink)]">
              O restante do guia fica após a compra
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-[color:var(--va-soft-ink)]">
              Você terminou o primeiro capítulo. Para continuar a leitura
              completa, conclua a compra.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <form action="/api/checkout" method="post" className="flex-1">
                <input type="hidden" name="productId" value={productId} />
                <button type="submit" className="va-button-primary w-full">
                  Comprar o guia
                </button>
              </form>
              <button
                type="button"
                onClick={() => setIsPaywallOpen(false)}
                className="va-button-secondary"
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
