import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

type RegisterPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;
  const nextPath =
    typeof params?.next === "string" && params.next.startsWith("/")
      ? params.next
      : "/library";

  return (
    <AuthShell
      title="Criar conta"
      description="Cadastre-se com seu nome, email e senha."
    >
      <AuthForm mode="register" nextPath={nextPath} />
      <p className="mt-6 text-sm text-[color:var(--va-soft-ink)]">
        Já tem conta?{" "}
        <Link
          className="font-medium text-[color:var(--va-navy)] hover:underline"
          href={`/login?next=${encodeURIComponent(nextPath)}`}
        >
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
