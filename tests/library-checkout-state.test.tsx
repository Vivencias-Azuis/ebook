import { describe, expect, it } from "vitest";

import { deriveLibraryCheckoutMessage } from "@/domains/products/library";

describe("deriveLibraryCheckoutMessage", () => {
  it("shows a processing message after Stripe redirects back", () => {
    expect(deriveLibraryCheckoutMessage("processing", false)).toBe(
      "Pagamento recebido. Estamos confirmando seu acesso. Se o novo produto ainda nao apareceu, atualize a pagina em alguns segundos.",
    );
  });

  it("shows a softer processing message when the user already has products", () => {
    expect(deriveLibraryCheckoutMessage("processing", true)).toBe(
      "Pagamento recebido. Seu novo acesso pode levar alguns segundos para aparecer na biblioteca.",
    );
  });

  it("returns null when there is no checkout state", () => {
    expect(deriveLibraryCheckoutMessage(undefined, false)).toBeNull();
  });
});
