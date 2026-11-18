import type { ReactNode } from "react";
import Link from "next/link";

export function SiteHeader({
  showLogin = true,
  trailing,
}: {
  showLogin?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <header className="va-site-header">
      <div className="va-site-header-inner">
        <Link href="/" className="va-wordmark">
          <span className="va-wordmark-ribbon" aria-hidden="true" />
          Vivências Azuis
        </Link>
        {trailing ? (
          trailing
        ) : showLogin ? (
          <Link href="/login" className="va-nav-link">
            Entrar
          </Link>
        ) : null}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="va-site-footer">
      <div className="va-site-footer-inner">
        <Link href="/" className="va-wordmark">
          <span className="va-wordmark-ribbon" aria-hidden="true" />
          Vivências Azuis
        </Link>
        <nav className="va-footer-nav">
          <Link href="/privacidade">Política de privacidade</Link>
          <Link href="/reembolso">Política de reembolso</Link>
        </nav>
        <p className="va-footer-copy">
          © {new Date().getFullYear()} Vivências Azuis
        </p>
      </div>
    </footer>
  );
}

export function Kicker({
  index,
  children,
  className,
}: {
  index?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <p className={className ? `va-kicker ${className}` : "va-kicker"}>
      {index ? <span className="va-kicker-num">{index}</span> : null}
      {children}
    </p>
  );
}
