import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map",
  description: "Interactive map of agave species across Mexico",
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
