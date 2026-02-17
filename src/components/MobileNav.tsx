"use client";

import { useEffect } from "react";
import Link from "next/link";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  return (
    <div
      className={`mobile-nav-overlay ${isOpen ? "is-open" : ""}`}
      id="mobile-nav-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <div className="mobile-nav-header">
        <span></span>
        <button className="mobile-nav-close" type="button" onClick={onClose} aria-label="Close menu">
          <img src="/assets/ui/icons/icon_close.svg" alt="" />
        </button>
      </div>
      <nav aria-label="Mobile navigation">
        <ul className="mobile-nav-list">
          <li className="mobile-nav-item">
            <Link href="/" className="mobile-nav-link" onClick={onClose}>HOME</Link>
          </li>
          <li className="mobile-nav-item">
            <Link href="/about" className="mobile-nav-link" onClick={onClose}>ABOUT</Link>
          </li>
          <li className="mobile-nav-item">
            <Link href="/directory" className="mobile-nav-link" onClick={onClose}>DIRECTORY</Link>
          </li>
          <li className="mobile-nav-item">
            <Link href="/contact" className="mobile-nav-link" onClick={onClose}>CONTACT</Link>
          </li>
          <li className="mobile-nav-item">
            <a href="https://shop.mezcalomano.com" className="mobile-nav-link mobile-nav-shop" onClick={onClose}>SHOP</a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
