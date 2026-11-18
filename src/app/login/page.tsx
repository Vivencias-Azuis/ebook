import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath =
    typeof params?.next === "string" && params.next.startsWith("/")
      ? params.next
      : "/library";

  return (
    <AuthShell
      title="Entrar"
      description="Acesse sua biblioteca de guias e materiais."
    >
      <AuthForm mode="login" nextPath={nextPath} />
      <p className="mt-6 text-sm text-[color:var(--va-soft-ink)]">
        Ainda não tem conta?{" "}
        <Link
          className="font-medium text-[color:var(--va-navy)] hover:underline"
          href={`/register?next=${encodeURIComponent(nextPath)}`}
        >
          Criar conta
        </Link>
      </p>
    </AuthShell>
  );
}
