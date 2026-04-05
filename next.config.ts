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
    { source: "/shop", destination: "https://shop.mezcalomano.com", permanent: false },
    { source: "/matrix", destination: "/directory", permanent: true },
    { source: "/matrix/", destination: "/directory", permanent: true },
    ...directorySlugRedirects,
  ],
};

export default nextConfig;
