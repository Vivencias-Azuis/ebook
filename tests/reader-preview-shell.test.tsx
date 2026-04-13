import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import {
  ReaderPaywallTrigger,
  ReaderPreviewShell,
} from "@/features/reader/reader-preview-shell";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("ReaderPreviewShell", () => {
  it("opens the paywall when the header trigger is clicked in preview mode", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <ReaderPreviewShell
          isPreviewMode
          shouldOpenPaywall={false}
          productId="prod-1"
        >
          <div>
            <ReaderPaywallTrigger data-paywall-trigger="header">
              Comprar curso
            </ReaderPaywallTrigger>
            <div>Reader content</div>
          </div>
        </ReaderPreviewShell>,
      );
    });

    expect(container.textContent).toContain("Comprar curso");
    expect(container.textContent).not.toContain("Amostra gratuita concluída");

    const trigger = container.querySelector('[data-paywall-trigger="header"]');

    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("Amostra gratuita concluída");
    expect(container.innerHTML).toContain('name="productId"');
    expect(container.innerHTML).toContain('value="prod-1"');

    await act(async () => {
      root.unmount();
    });
  });
});
