import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";

import ConsentBanner from "@/components/consent-banner";

export const metadata: Metadata = {
  title: "Mezcalomano Shop",
  description: "Mezcalomano discovery decks and gifts.",
  metadataBase: new URL("https://shop.mezcalomano.com"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const consent = (await cookies()).get("consent_state")?.value ?? "unset";
  const gaId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

  return (
    <html lang="en" className="h-full bg-white" style={{ color: 'var(--foreground)' }}>
      <body className="min-h-full antialiased" style={{ fontFamily: "'Open Sans', sans-serif" }}>
        <div className="flex min-h-screen flex-col">
          <header className="border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-lg font-brand tracking-tight" style={{ color: 'var(--foreground)' }}>
                Mezcalómano
              </Link>
              <nav className="flex items-center gap-4 text-sm" style={{ color: 'var(--accent-muted)' }}>
                <Link className="hover:opacity-80 transition-opacity" style={{ color: 'var(--accent-muted)' }} href="/cart">
                  Cart
                </Link>
                <Link className="hover:opacity-80 transition-opacity" style={{ color: 'var(--accent-muted)' }} href="/legal/terms">
                  Terms
                </Link>
                <Link className="hover:opacity-80 transition-opacity" style={{ color: 'var(--accent-muted)' }} href="/legal/privacy">
                  Privacy
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-6 text-sm md:flex-row md:items-center md:justify-between" style={{ color: 'var(--accent-muted)' }}>
              <span>© {new Date().getFullYear()} <span className="font-brand">Mezcalómano</span>. All rights reserved.</span>
              <div className="flex items-center gap-4">
                <Link className="hover:opacity-80 transition-opacity" style={{ color: 'var(--accent-muted)' }} href="/legal/shipping">
                  Shipping policy
                </Link>
                <Link className="hover:opacity-80 transition-opacity" style={{ color: 'var(--accent-muted)' }} href="/legal/returns">
                  Returns
                </Link>
                <Link className="hover:opacity-80 transition-opacity" style={{ color: 'var(--accent-muted)' }} href="/legal/cookies">
                  Manage cookies
                </Link>
              </div>
            </div>
          </footer>
        </div>
        <ConsentBanner />
        {consent === "accepted" && gaId ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', { anonymize_ip: true });
                `,
              }}
            />
          </>
        ) : null}
      </body>
    </html>
  );
}
