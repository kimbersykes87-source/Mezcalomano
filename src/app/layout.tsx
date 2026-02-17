import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/styles/global.css";
import "@/styles/components.css";

const siteUrl = "https://mezcalomano.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mezcalómano",
    template: "%s | Mezcalómano",
  },
  description: "Discover the agave species behind mezcal",
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Mezcalómano",
    description: "Discover the agave species behind mezcal",
    images: [
      {
        url: "/assets/og/mezcalomano_og_1200x630.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mezcalómano",
    description: "Discover the agave species behind mezcal",
    images: ["/assets/og/mezcalomano_og_1200x630.png"],
  },
  icons: {
    icon: [
      { url: "/assets/favicon/favicon_16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/favicon/favicon_32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/favicon/favicon_48.png", sizes: "48x48", type: "image/png" },
      { url: "/assets/favicon/app_icon_512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/assets/favicon/app_icon_512.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans+Condensed:wght@300;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="layout-pin-footer" suppressHydrationWarning>
        <Header />
        <main className="page-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
