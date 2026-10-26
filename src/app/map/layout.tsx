import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map",
  description: "Interactive map of agave species across Mexico",
  alternates: { canonical: "/map" },
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="map-root">{children}</div>;
}
