/* eslint-disable @next/next/no-img-element -- SVG social icons; fixed width/height on img */
import Link from "next/link";

/** Footer-only links (not in the main nav). */
const FOOTER_LINKS = [
  { href: "/press", label: "Press" },
  { href: "/sources", label: "Sources" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-social">
          <a href="https://www.instagram.com/mezcalomano/" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
            <img src="/assets/icons/icon_instagram.svg" alt="" width={24} height={24} />
          </a>
          <a href="https://www.tiktok.com/@mezcalomano" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
            <img src="/assets/icons/icon_tiktok.svg" alt="" width={24} height={24} />
          </a>
        </div>
        <nav className="footer-links" aria-label="Footer">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="footer-copyright">&copy; 2026 Mezcalómano · Explore agave, sip mezcal. All rights reserved.</p>
      </div>
    </footer>
  );
}
