"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  useId,
  useMemo,
  type RefObject,
} from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { SpeciesCard } from "./SpeciesCard";
import type { Species } from "@/types/species";

const SWIPE_THRESHOLD = 50;

export type DirectoryToolbarProps = {
  searchQuery: string;
  onSearchChange: (q: string) => void;
};

function DirectorySpeciesCombobox({
  species,
  currentIndex,
  onIndexChange,
  searchQuery,
  onSearchChange,
  showKeyCard,
  inputRef,
}: DirectoryToolbarProps & {
  species: Species[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  showKeyCard: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const closedLabel = useMemo(() => {
    return species[currentIndex]?.common_name ?? "";
  }, [species, currentIndex]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const inputValue = open ? searchQuery : closedLabel;

  const pick = (index: number) => {
    onIndexChange(index);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative min-h-12 min-w-0 flex-1">
      <label className="sr-only" htmlFor={`${listId}-input`}>
        Search or jump to species
      </label>
      <div className="relative flex min-h-12 items-stretch">
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          value={inputValue}
          placeholder="Search or choose…"
          onChange={(e) => {
            onSearchChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="box-border min-h-12 w-full min-w-0 rounded-lg border border-white/20 bg-white/5 px-[6rem] py-2.5 text-center text-white placeholder:text-white/40 focus:border-[var(--agave-yellow)] focus:outline-none"
          style={{ fontSize: "1.3125rem", lineHeight: 1.35 }}
        />
        <div className="pointer-events-none absolute right-2 top-0 flex h-12 items-center gap-0.5">
          {searchQuery.trim() !== "" ? (
            <button
              type="button"
              aria-label="Clear search"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSearchChange("");
                setOpen(true);
              }}
              className="pointer-events-auto inline-flex size-8 shrink-0 items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
          <button
            type="button"
            aria-label={open ? "Close list" : "Open list"}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpen((v) => !v)}
            className="pointer-events-auto inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[var(--agave-yellow)] hover:bg-white/10 hover:opacity-90"
          >
            <ChevronDown
              className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        </div>
      </div>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-lg border border-white/20 bg-[#2a2c28] py-1 shadow-xl"
        >
          {species.map((s, i) => {
            const selected = currentIndex === i;
            return (
              <li key={s.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`w-full py-2.5 text-left hover:bg-white/10 ${
                    selected ? "bg-white/10 text-[var(--agave-yellow)]" : "text-white"
                  }`}
                  style={{
                    fontSize: "1.3125rem",
                    lineHeight: 1.35,
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(i)}
                >
                  {s.common_name}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function SwipeableCardStack({
  species,
  currentIndex,
  onIndexChange,
  directoryToolbar,
}: {
  species: Species[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  directoryToolbar?: DirectoryToolbarProps;
}) {
  const touchStartX = useRef<number | null>(null);
  const directoryComboboxInputRef = useRef<HTMLInputElement>(null);

  const totalCards = species.length;

  const goTo = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(index, totalCards - 1));
      if (next === currentIndex) return;
      onIndexChange(next);
    },
    [totalCards, currentIndex, onIndexChange]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const delta = touchStartX.current - endX;
    touchStartX.current = null;
    if (delta > SWIPE_THRESHOLD) goTo(currentIndex + 1);
    else if (delta < -SWIPE_THRESHOLD) goTo(currentIndex - 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(currentIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(currentIndex + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, goTo]);

  const atStart = currentIndex <= 0;
  const atEnd = currentIndex >= totalCards - 1;

  const focusDirectoryCombobox = useCallback(() => {
    directoryToolbar?.onSearchChange("");
    const el = directoryComboboxInputRef.current;
    if (el) {
      el.focus({ preventScroll: true });
    }
  }, [directoryToolbar]);

  if (species.length === 0) {
    return (
      <div className="flex min-h-[50vh] w-full min-w-0 max-w-4xl flex-col items-center justify-center px-4 text-center text-white/70">
        <p>No species to show. Run the seed script and add Supabase credentials.</p>
      </div>
    );
  }

  const current = species[currentIndex];

  const centerTool = directoryToolbar ? (
    <DirectorySpeciesCombobox
      species={species}
      currentIndex={currentIndex}
      onIndexChange={onIndexChange}
      searchQuery={directoryToolbar.searchQuery}
      onSearchChange={directoryToolbar.onSearchChange}
      showKeyCard={false}
      inputRef={directoryComboboxInputRef}
    />
  ) : (
    <p className="min-w-0 flex-1 text-center text-sm text-white/85" aria-live="polite">
      {current
        ? `${currentIndex + 1} of ${species.length} — ${current.common_name}`
        : ""}
    </p>
  );

  return (
    <div className="flex w-full min-w-0 max-w-4xl flex-col items-center px-5">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-10 sm:max-w-2xl">
        <nav
          className="flex w-4/5 items-center gap-2.5 sm:gap-3"
          aria-label="Card navigation"
        >
        {atStart ? (
          <button
            type="button"
            aria-label="Search"
            onClick={focusDirectoryCombobox}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/5 text-[var(--agave-yellow)] hover:bg-white/10"
          >
            <Search className="size-5" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Previous card"
            onClick={() => goTo(currentIndex - 1)}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/5 text-[var(--agave-yellow)] hover:bg-white/10"
          >
            <ChevronLeft className="size-6" aria-hidden />
          </button>
        )}
        {centerTool}
        {atEnd ? (
          <button
            type="button"
            aria-label="Search"
            onClick={focusDirectoryCombobox}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/5 text-[var(--agave-yellow)] hover:bg-white/10"
          >
            <Search className="size-5" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Next card"
            onClick={() => goTo(currentIndex + 1)}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/5 text-[var(--agave-yellow)] hover:bg-white/10"
          >
            <ChevronRight className="size-6" aria-hidden />
          </button>
        )}
        </nav>
        <div
          className="touch-pan-y w-full"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div key={current.id} className="w-full pb-5 transition-opacity duration-200 ease-out">
            <SpeciesCard
              species={current}
              fallbackImageUrl={"fallbackImageUrl" in current ? (current as Species & { fallbackImageUrl?: string | null }).fallbackImageUrl : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
