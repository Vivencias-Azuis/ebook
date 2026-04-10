import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fafaf9_0%,#ffffff_55%,#f4f4f5_100%)] text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
        <section className="w-full rounded-3xl border border-zinc-200 bg-white p-8 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.25)]">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">
              Vivências Azuis
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Create account</h1>
            <p className="text-sm leading-6 text-zinc-600">
              Register with your name, email, and password.
            </p>
          </div>

          <div className="mt-8">
            <AuthForm mode="register" />
          </div>

          <p className="mt-6 text-sm text-zinc-600">
            Already have an account?{" "}
            <Link className="font-medium text-zinc-950 underline" href="/login">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
