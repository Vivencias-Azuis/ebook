import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { SignOutButton } from "@/components/auth/sign-out-button";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({}));
  Object.defineProperty(window, "location", {
    value: { href: "/" },
    writable: true,
  });
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

it("renders a button with default label Sair", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<SignOutButton />);
  });

  const button = container.querySelector("button");
  expect(button).not.toBeNull();
  expect(button?.textContent).toBe("Sair");

  await act(async () => root.unmount());
});

it("calls POST /api/auth/sign-out with application/json on click", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<SignOutButton />);
  });

  const button = container.querySelector("button")!;

  await act(async () => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

  expect(fetch).toHaveBeenCalledWith("/api/auth/sign-out", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  await act(async () => root.unmount());
});

it("redirects to / after sign-out", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<SignOutButton />);
  });

  const button = container.querySelector("button")!;

  await act(async () => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

  expect(window.location.href).toBe("/");

  await act(async () => root.unmount());
});
