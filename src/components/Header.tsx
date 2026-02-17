"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNav from "./MobileNav";

export default function Header() {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-content">
          <button
            className="header-burger"
            id="mobile-nav-toggle"
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            <img src="/assets/ui/icons/icon_burger.svg" alt="" />
          </button>

          <Link href="/" className="header-logo" aria-label="Mezcalómano Home">
            <img src="/assets/brand/logos/mezcalomano_lockup_stacked_dark.svg" alt="" />
          </Link>

          <nav className="header-nav" aria-label="Main navigation">
            <ul className="header-nav-desktop">
              <li><Link href="/" className={pathname === "/" ? "active" : ""}>HOME</Link></li>
              <li><Link href="/about" className={pathname === "/about" ? "active" : ""}>ABOUT</Link></li>
              <li><Link href="/contact" className={pathname === "/contact" ? "active" : ""}>CONTACT</Link></li>
            </ul>
          </nav>

          <a href="https://shop.mezcalomano.com" className="header-shop" aria-label="Shop">
            <img src="/assets/ui/icons/icon_shopping-basket.svg" alt="" />
          </a>
        </div>
      </header>
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}
