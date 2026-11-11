import type { Metadata } from "next";
import "./giveaway.css";

export const metadata: Metadata = {
  title: "Mezcal Culture giveaway: draw your card",
  robots: { index: false, follow: false },
};

export default function GiveawayLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="gv">{children}</div>;
}
