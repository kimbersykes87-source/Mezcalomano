import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import {
  LOGO_IMAGE_PATH,
  OG_IMAGE_PATH,
  SITE_META_DESCRIPTION,
  SITE_URL,
} from "@/lib/site-seo";
import "@/styles/global.css";
import "@/styles/components.css";

const orgId = `${SITE_URL}/#organization`;
const websiteId = `${SITE_URL}/#website`;

const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": orgId,
      name: "Mezcalómano",
      url: SITE_URL,
      logo: `${SITE_URL}${LOGO_IMAGE_PATH}`,
      sameAs: [
        "https://www.instagram.com/mezcalomano/",
        "https://www.tiktok.com/@mezcalomano",
      ],
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: SITE_URL,
      name: "Mezcalómano",
      description: SITE_META_DESCRIPTION,
      publisher: { "@id": orgId },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mezcalómano",
    template: "%s | Mezcalómano",
  },
  description: SITE_META_DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Mezcalómano",
    description: SITE_META_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "The Discovery Deck box beside the Sierra Negra card on a charcoal background",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mezcalómano",
    description: SITE_META_DESCRIPTION,
    images: [OG_IMAGE_PATH],
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
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wdth,wght@75,300;75,400;75,600;75,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="layout-pin-footer font-sans" suppressHydrationWarning>
        <JsonLd data={siteStructuredData} />
        <Header />
        <main className="page-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
