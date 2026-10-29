"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AgaveImage from "@/components/AgaveImage";
import { supabase } from "@/lib/supabase";
import { getMatrixCardUrlMap, resolveSpeciesImageUrl } from "@/lib/matrix-card-urls";
import { toAgaveCard, type AgaveCard } from "@/lib/agave-cards";
import type { Species } from "@/types/species";

/** Cards shown before "Show all": three rows of four on desktop. */
const FIRST_PAGE = 12;

/** The fan in the hero and the "Start with" shortcuts. */
const FAN_NAMES = ["Arroqueño", "Madrecuixe", "Tobalá", "Tepextate"];
const QUICK_NAMES = ["Tobalá", "Espadín", "Madrecuixe"];

type FilterId = "all" | "us" | "oaxaca" | "wild";
const FILTERS: { id: FilterId; label: string; test: (c: AgaveCard) => boolean }[] = [
  { id: "all", label: "All", test: () => true },
  { id: "us", label: "Sold in the US", test: (c) => c.usCount > 0 },
  { id: "oaxaca", label: "Oaxaca", test: (c) => c.states.includes("Oaxaca") },
  { id: "wild", label: "Wild and semi wild", test: (c) => c.wild },
];

function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function matchesSearch(c: AgaveCard, q: string): boolean {
  const t = fold(q.trim());
  if (!t) return true;
  return fold([c.name, c.sci, c.states.join(" ")].join(" ")).includes(t);
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export default function DirectoryClient({ initialCards = [] }: { initialCards?: AgaveCard[] }) {
  const router = useRouter();
  const [cards, setCards] = useState<AgaveCard[]>(initialCards);
  const [loading, setLoading] = useState(initialCards.length === 0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [expanded, setExpanded] = useState(false);
  const gridRef = useRef<HTMLElement>(null);

  // Species normally arrive from the server; only fetch in the browser if that failed.
  const loadSpecies = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    const [{ data, error }, matrix] = await Promise.all([
      supabase.from("species").select("*"),
      getMatrixCardUrlMap(),
    ]);
    if (error) {
      console.error("Supabase error:", error);
      setFetchError("We couldn't load the agaves just now.");
      setCards([]);
    } else {
      const sorted = ((data as Species[]) ?? []).sort((a, b) => a.common_name.localeCompare(b.common_name, "en"));
      setCards(sorted.map((s) => toAgaveCard(s, resolveSpeciesImageUrl(s.image_url, s.common_name, matrix))));
    }
    setLoading(false);
  }, []);

  const hasInitial = initialCards.length > 0;
  useEffect(() => {
    if (hasInitial) return;
    void Promise.resolve().then(() => loadSpecies());
  }, [hasInitial, loadSpecies]);

  const byName = useMemo(() => new Map(cards.map((c) => [c.name, c])), [cards]);
  const fan = FAN_NAMES.map((n) => byName.get(n)).filter((c): c is AgaveCard => Boolean(c));
  const quick = QUICK_NAMES.map((n) => byName.get(n)).filter((c): c is AgaveCard => Boolean(c));

  const activeTest = FILTERS.find((f) => f.id === filter)?.test ?? (() => true);
  const filtered = cards.filter((c) => activeTest(c) && matchesSearch(c, query));
  const searching = query.trim() !== "" || filter !== "all";
  const showAll = expanded || searching;
  const visibleCount = showAll ? filtered.length : Math.min(FIRST_PAGE, filtered.length);

  const surprise = () => {
    if (!cards.length) return;
    const pick = cards[Math.floor(Math.random() * cards.length)];
    router.push(`/directory/${pick.slug}`);
  };

  return (
    <>
      <section className="l-hero">
        <div className="s-wrap">
          <div>
            <p className="s-eyebrow">The Discovery Deck directory</p>
            <h1>Espadín&apos;s Great, But Have You Met the Wild Ones?</h1>
            <p className="sub">40 agaves, one deck. Pick a plant, learn its story, then find a bottle to try in the US.</p>
            <form
              className="l-search"
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <label>
                <SearchIcon />
                <span className="sr-only">Search agaves</span>
                <input
                  type="search"
                  placeholder={`Search ${cards.length || 40} agaves`}
                  value={query}
                  enterKeyHint="search"
                  autoComplete="off"
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <button type="button" className="l-cta" onClick={surprise}>
                Surprise me
              </button>
            </form>
            {quick.length > 0 ? (
              <div className="l-quick">
                <span>Start with</span>
                {quick.map((c) => (
                  <Link key={c.slug} href={`/directory/${c.slug}`}>
                    {c.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <div className="l-fan" aria-hidden="true">
            {fan.map((c, i) => (
              <Link key={c.slug} className={`f${i + 1}`} href={`/directory/${c.slug}`} tabIndex={-1}>
                <AgaveImage src={c.img} alt="" eager />
                <b>{c.name}</b>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="l-stat" aria-label="Why the directory exists">
        <div className="s-wrap">
          <strong>85%</strong>
          <p>
            About 85% of mezcal is made from a single agave, espadín. Time to mix it up.
            <span>That is a lot of pressure on one plant. The other 39 are waiting.</span>
          </p>
        </div>
      </section>

      <section className="l-sec" ref={gridRef} aria-labelledby="directory-all">
        <div className="s-wrap">
          <div className="l-head">
            <div>
              <h2 id="directory-all">All 40 agaves</h2>
              <p>Tap a plant to read its card, then find a bottle.</p>
            </div>
            {!loading && !fetchError ? (
              <span className="l-count" aria-live="polite">
                Showing {visibleCount} of {searching ? filtered.length : cards.length}
              </span>
            ) : null}
          </div>
          <div className="l-filters" role="group" aria-label="Filter agaves">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`l-pill${filter === f.id ? " on" : ""}`}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="l-msg">Loading the agaves…</p>
          ) : fetchError ? (
            <div className="l-msg">
              <p>{fetchError}</p>
              <button type="button" className="l-more-btn" onClick={() => loadSpecies()}>
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="l-msg">
              <p>No agaves match that. Try another name or state.</p>
              <button
                type="button"
                className="l-more-btn"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Clear search
              </button>
            </div>
          ) : (
            <ul className="l-grid">
              {filtered.map((c, i) => (
                <li key={c.slug} hidden={i >= visibleCount}>
                  <Link className="l-card" href={`/directory/${c.slug}`}>
                    <div className="im">
                      {c.usCount > 0 ? (
                        <span className="l-badge">
                          {c.usCount} US {c.usCount === 1 ? "shop" : "shops"}
                        </span>
                      ) : null}
                      <AgaveImage src={c.img} alt={`${c.name} agave`} />
                    </div>
                    <div className="tx">
                      <h3 className="notranslate" translate="no">
                        {c.name}
                      </h3>
                      <p>{c.sci}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!showAll && filtered.length > visibleCount ? (
            <div className="l-more">
              <button type="button" className="l-more-btn" onClick={() => setExpanded(true)}>
                Show all {filtered.length} agaves
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
