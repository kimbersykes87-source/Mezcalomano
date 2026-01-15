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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const consent = cookies().get("consent_state")?.value ?? "unset";
  const gaId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

  return (
    <html lang="en" className="h-full bg-white text-slate-900">
      <body className="min-h-full antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-200">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-lg font-semibold tracking-tight">
                Mezcalomano
              </Link>
              <nav className="flex items-center gap-4 text-sm text-slate-600">
                <Link className="hover:text-slate-900" href="/cart">
                  Cart
                </Link>
                <Link className="hover:text-slate-900" href="/legal/terms">
                  Terms
                </Link>
                <Link className="hover:text-slate-900" href="/legal/privacy">
                  Privacy
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <span>© {new Date().getFullYear()} Mezcalomano</span>
              <div className="flex items-center gap-4">
                <Link className="hover:text-slate-900" href="/legal/shipping">
                  Shipping policy
                </Link>
                <Link className="hover:text-slate-900" href="/legal/returns">
                  Returns
                </Link>
                <Link className="hover:text-slate-900" href="/legal/cookies">
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
