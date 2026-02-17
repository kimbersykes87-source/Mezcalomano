"use client";

import { useState, useMemo } from "react";
import MatrixCard from "./MatrixCard";
import MatrixDrawer from "./MatrixDrawer";
import type { MatrixSpecies } from "./MatrixCard";

interface DirectoryContentProps {
  matrixData: MatrixSpecies[];
}

export default function DirectoryContent({ matrixData }: DirectoryContentProps) {
  const [search, setSearch] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<MatrixSpecies | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredSpecies = useMemo(() => {
    if (!search.trim()) return matrixData;
    const q = search.toLowerCase();
    return matrixData.filter(
      (s) =>
        s.common_name.toLowerCase().includes(q) ||
        s.scientific_name.toLowerCase().includes(q) ||
        s.one_liner.toLowerCase().includes(q)
    );
  }, [matrixData, search]);

  function openDrawer(species: MatrixSpecies) {
    setSelectedSpecies(species);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedSpecies(null);
  }

  return (
    <>
      <div className="matrix-page">
        <div className="directory-intro">
          <p>
            This directory connects mezcal lovers and the mezcal curious to online retailers and
            brick-and-mortar venues that specialize in these rare, flavorful varieties.
          </p>
          <p>
            Use this directory to expand your mezcal journey, submit your favorite spots for
            inclusion to keep it growing with the community.
          </p>
        </div>
        <div className="matrix-filters">
          <label htmlFor="directory-search" className="matrix-search-label">
            SEARCH BY NAME
          </label>
          <input
            type="text"
            className="matrix-search"
            id="directory-search"
            placeholder="Search by name..."
            aria-label="Search species by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="matrix-grid" id="matrix-grid">
          {filteredSpecies.map((species) => (
            <div
              key={species.species_id}
              role="button"
              tabIndex={0}
              onClick={() => openDrawer(species)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openDrawer(species);
                }
              }}
            >
              <MatrixCard species={species} />
            </div>
          ))}
        </div>
      </div>

      <MatrixDrawer
        selectedSpecies={selectedSpecies}
        isOpen={drawerOpen}
        onClose={closeDrawer}
      />
    </>
  );
}
