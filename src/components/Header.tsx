"use client";

/* eslint-disable @next/next/no-img-element -- SVG logo; sizing from CSS */
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNav from "./MobileNav";

export default function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {pathname === "/" ? (
        <Link href="/buy" className="s-bar">
        <span className="long">Pre-orders ship from November 30. Order by December 14 for US Christmas delivery.</span>
        <span className="short">Order by Dec 14 for US Christmas delivery</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      </Link>
      ) : null}
      <header className="s-top">
        <div className="s-top-in">
          <button
            className="s-burger"
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 5h16M4 12h16M4 19h16" />
            </svg>
          </button>

          <Link href="/" className="s-logo" aria-label="Mezcalómano home">
            <img src="/assets/brand/logos/mezcalomano_lockup_stacked_dark.svg" alt="" />
          </Link>

          <a href="https://shop.mezcalomano.com/products/discovery-deck" className="s-basket" aria-label="Shop">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 11-1 9" />
              <path d="m19 11-4-7" />
              <path d="M2 11h20" />
              <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
              <path d="M4.5 15.5h15" />
              <path d="m5 11 4-7" />
              <path d="m9 11 1 9" />
            </svg>
          </a>
        </div>
      </header>
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}
