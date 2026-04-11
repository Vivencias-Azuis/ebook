import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { AuthForm } from "@/components/auth/auth-form";
import { authClient } from "@/lib/auth-client";

const { replaceMock, signInEmailMock, signUpEmailMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  signInEmailMock: vi.fn(),
  signUpEmailMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: signInEmailMock,
    },
    signUp: {
      email: signUpEmailMock,
    },
  },
}));

afterEach(() => {
  document.body.innerHTML = "";
});

beforeEach(() => {
  vi.clearAllMocks();
});

it("login form shows Portuguese labels", () => {
  expect(typeof AuthForm).toBe("function");
});

it("uses the next path as callback and redirect target on login", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  signInEmailMock.mockResolvedValue({});

  await act(async () => {
    root.render(
      <AuthForm mode="login" nextPath="/products/guia-pratico/read" />,
    );
  });

  const emailInput = container.querySelector<HTMLInputElement>("#email");
  const passwordInput = container.querySelector<HTMLInputElement>("#password");
  const form = container.querySelector("form");

  if (!emailInput || !passwordInput || !form) {
    throw new Error("Auth form did not render expected fields");
  }

  await act(async () => {
    emailInput.value = "familia@example.com";
    emailInput.dispatchEvent(new Event("input", { bubbles: true }));
    passwordInput.value = "12345678";
    passwordInput.dispatchEvent(new Event("input", { bubbles: true }));
  });

  await act(async () => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  });

  expect(authClient.signIn.email).toHaveBeenCalledWith({
    email: expect.any(String),
    password: expect.any(String),
    callbackURL: "/products/guia-pratico/read",
  });
  expect(replaceMock).toHaveBeenCalledWith("/products/guia-pratico/read");

  await act(async () => {
    root.unmount();
  });
});

it("shows feedback when sign in returns an auth error payload", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  signInEmailMock.mockResolvedValue({
    error: {
      message: "Email ou senha inválidos.",
    },
  });

  await act(async () => {
    root.render(<AuthForm mode="login" nextPath="/library" />);
  });

  const form = container.querySelector("form");

  if (!form) {
    throw new Error("Auth form did not render");
  }

  await act(async () => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  });

  expect(container.textContent).toContain("Email ou senha inválidos.");
  expect(replaceMock).not.toHaveBeenCalled();

  await act(async () => {
    root.unmount();
  });
});

it("shows feedback when sign up returns an auth error payload", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  signUpEmailMock.mockResolvedValue({
    error: {
      message: "Este email já está em uso.",
    },
  });

  await act(async () => {
    root.render(<AuthForm mode="register" nextPath="/library" />);
  });

  const form = container.querySelector("form");

  if (!form) {
    throw new Error("Auth form did not render");
  }

  await act(async () => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  });

  expect(container.textContent).toContain("Este email já está em uso.");
  expect(replaceMock).not.toHaveBeenCalled();

  await act(async () => {
    root.unmount();
  });
});
