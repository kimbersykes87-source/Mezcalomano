import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Directory",
  description:
    "Discover our guide to sourcing exceptional mezcals beyond espadín, like tobalá, tepeztate, and cuixe.",
};

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="directory-root">{children}</div>;
}
