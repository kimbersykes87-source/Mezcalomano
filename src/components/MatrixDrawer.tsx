"use client";

import { useEffect } from "react";
import type { MatrixSpecies } from "./MatrixCard";

interface MatrixDrawerProps {
  selectedSpecies: MatrixSpecies | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MatrixDrawer({ selectedSpecies, isOpen, onClose }: MatrixDrawerProps) {
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

  if (!selectedSpecies) return null;

  return (
    <div
      className={`matrix-drawer-backdrop ${isOpen ? "is-open" : ""}`}
      id="matrix-drawer-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Species details"
    >
      <div className="matrix-drawer">
        <button
          type="button"
          className="matrix-drawer-close"
          id="matrix-drawer-close"
          aria-label="Close"
          onClick={onClose}
        >
          <img src="/assets/ui/icons/icon_close.svg" alt="" />
        </button>
        <div className="matrix-drawer-content">
          <div className="matrix-drawer-image">
            <img
              id="drawer-image"
              src={selectedSpecies.image_800}
              alt={`${selectedSpecies.common_name} (${selectedSpecies.scientific_name})`}
            />
          </div>
          <div className="matrix-drawer-info">
            <h2 id="drawer-common-name">{selectedSpecies.common_name}</h2>
            <h3 id="drawer-scientific-name">{selectedSpecies.scientific_name}</h3>
            <p id="drawer-one-liner">{selectedSpecies.one_liner}</p>
            <div className="matrix-drawer-meta">
              <div className="matrix-drawer-meta-item">
                <span className="matrix-drawer-meta-label">Habitat:</span>
                <span id="drawer-habitat">{selectedSpecies.habitat}</span>
              </div>
              <div className="matrix-drawer-meta-item">
                <span className="matrix-drawer-meta-label">Height:</span>
                <span id="drawer-height">{selectedSpecies.height}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
