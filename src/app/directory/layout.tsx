import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agave species directory",
  description:
    "Explore agave species behind mezcal—tobalá, tepeztate, cuixe, and beyond. A free educational guide from Mezcalómano; pairs with the Discovery Deck playing cards.",
};

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="directory-root">{children}</div>;
}
