"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Não foi possível concluir a autenticação.";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      if (isRegister) {
        await authClient.signUp.email({
          name,
          email,
          password,
          callbackURL: "/library",
        });
      } else {
        await authClient.signIn.email({
          email,
          password,
          callbackURL: "/library",
        });
      }

      router.replace("/library");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {isRegister ? (
        <div className="space-y-1.5">
          <label
            className="block text-sm font-semibold text-[color:var(--va-ink)]"
            htmlFor="name"
          >
            Nome
          </label>
          <input
            className="w-full rounded-[0.75rem] border border-[color:var(--va-line)] bg-white px-4 py-3 text-[color:var(--va-ink)] shadow-[0_2px_6px_-4px_rgba(11,35,66,0.12)] outline-none transition focus:border-[color:var(--va-blue-300)] focus:ring-2 focus:ring-[color:var(--va-blue-100)]"
            id="name"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label
          className="block text-sm font-semibold text-[color:var(--va-ink)]"
          htmlFor="email"
        >
          Email
        </label>
        <input
          className="w-full rounded-[0.75rem] border border-[color:var(--va-line)] bg-white px-4 py-3 text-[color:var(--va-ink)] shadow-[0_2px_6px_-4px_rgba(11,35,66,0.12)] outline-none transition focus:border-[color:var(--va-blue-300)] focus:ring-2 focus:ring-[color:var(--va-blue-100)]"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label
          className="block text-sm font-semibold text-[color:var(--va-ink)]"
          htmlFor="password"
        >
          Senha
        </label>
        <input
          className="w-full rounded-[0.75rem] border border-[color:var(--va-line)] bg-white px-4 py-3 text-[color:var(--va-ink)] shadow-[0_2px_6px_-4px_rgba(11,35,66,0.12)] outline-none transition focus:border-[color:var(--va-blue-300)] focus:ring-2 focus:ring-[color:var(--va-blue-100)]"
          id="password"
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error ? (
        <p className="rounded-[0.75rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--va-blue-700),var(--va-navy))] px-4 py-3 text-sm font-bold text-white shadow-[0_14px_34px_-22px_rgba(11,35,66,0.52)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isPending}
      >
        {isPending
          ? "Aguarde..."
          : isRegister
            ? "Criar conta"
            : "Entrar na conta"}
      </button>
    </form>
  );
}
