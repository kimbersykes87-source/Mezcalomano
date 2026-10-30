"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGES = [
  { href: "/admin", label: "Overview", match: "" },
  { href: "/admin/shop", label: "Shop", match: "shop" },
  { href: "/admin/email", label: "Email", match: "email" },
  { href: "/admin/acquisition", label: "Acquisition / Press", match: "acquisition" },
  { href: "/admin/social", label: "Social Media", match: "social" },
] as const;

/** Page switcher at the top of every dashboard page (hidden on the login page). */
export default function AdminNav() {
  const path = (usePathname() ?? "").replace(/^\/admin/, "").replace(/^\/|\/$/g, "");
  if (path === "login") return null;
  return (
    <nav className="adm-pages" aria-label="Dashboard pages">
      {PAGES.map((p) => (
        <Link key={p.href} href={p.href} aria-current={p.match === path ? "page" : undefined}>
          {p.label}
        </Link>
      ))}
    </nav>
  );
}
