"use client";

export function SignOutButton({
  className,
  children = "Sair",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  async function handleSignOut() {
    await fetch("/api/auth/sign-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    window.location.href = "/";
  }

  return (
    <button type="button" onClick={handleSignOut} className={className}>
      {children}
    </button>
  );
}
