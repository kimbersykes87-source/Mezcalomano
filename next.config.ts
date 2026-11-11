import type { NextConfig } from "next";
import directoryLegacySlugRedirects from "./data/directory-legacy-slug-redirects.json";

const directorySlugRedirects = Object.entries(directoryLegacySlugRedirects as Record<string, string>).map(
  ([fromSlug, toSlug]) => ({
    source: `/directory/${fromSlug}`,
    destination: `/directory/${toSlug}`,
    permanent: true as const,
  })
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
  redirects: async () => [
    { source: "/buy", destination: "https://shop.mezcalomano.com/products/discovery-deck", permanent: false },
    { source: "/shop", destination: "https://shop.mezcalomano.com/products/discovery-deck", permanent: false },
    { source: "/matrix", destination: "/directory", permanent: true },
    { source: "/matrix/", destination: "/directory", permanent: true },
    { source: "/diaries", destination: "/small-pours", permanent: true },
    { source: "/diaries/:slug", destination: "/small-pours/:slug", permanent: true },
    { source: "/small-pours/gifts-for-mezcal-lovers", destination: "/small-pours/gifts-for-tequila-lovers", permanent: true },
    ...directorySlugRedirects,
  ],
  // Giveaway videos and stills live on R2 (media.mezcalomano.com); served through this site too, so the page
  // never depends on a visitor's DNS knowing the newer subdomain.
  rewrites: async () => [{ source: "/giveaway-media/:path*", destination: "https://media.mezcalomano.com/:path*" }],
};

export default nextConfig;
