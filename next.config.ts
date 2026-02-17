import type { NextConfig } from "next";

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
  ],
};

export default nextConfig;
