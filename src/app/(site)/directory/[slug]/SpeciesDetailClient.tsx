"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import AgaveImage from "@/components/AgaveImage";
import { parseStates, type AgaveCard } from "@/lib/agave-cards";
import { producerLinks } from "@/lib/producers";
import { speciesDirectorySlug } from "@/lib/slug";
import type { Species } from "@/types/species";

/** How many states to list in the hero before summarising the rest. */
const STATE_LIMIT = 3;

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function ArrowUpRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

function Chevron({ dir }: { dir: "left" | "right" | "down" }) {
  const d = dir === "left" ? "m15 6-6 6 6 6" : dir === "right" ? "m9 6 6 6-6 6" : "m6 9 6 6 6-6";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function Rail({ cards, current }: { cards: AgaveCard[]; current: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  // Start the rail with the current agave in view.
  useEffect(() => {
    const el = trackRef.current;
    const on = el?.querySelector<HTMLElement>(".d-th.on");
    if (el && on) el.scrollLeft = Math.max(0, on.offsetLeft - el.offsetLeft - 48);
  }, [current]);
  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * Math.max(320, el.clientWidth * 0.8), behavior: "smooth" });
  };
  return (
    <section className="d-rail" aria-labelledby="deal-yourself-in">
      <div className="hd">
        <h2 id="deal-yourself-in">Deal yourself in</h2>
        <div className="ar">
          <button type="button" aria-label="Previous agaves" onClick={() => scroll(-1)}>
            <Chevron dir="left" />
          </button>
          <button type="button" aria-label="Next agaves" onClick={() => scroll(1)}>
            <Chevron dir="right" />
          </button>
        </div>
      </div>
      <ul className="d-track" ref={trackRef}>
        {cards.map((c) => (
          <li key={c.slug} className={c.slug === current ? "d-th on" : "d-th"}>
            <Link href={`/directory/${c.slug}`} aria-current={c.slug === current ? "page" : undefined}>
              <div className="t">
                <AgaveImage src={c.img} alt="" />
              </div>
              <p className="notranslate" translate="no">
                {c.name}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function SpeciesDetailClient({
  species,
  image,
  rail,
}: {
  species: Species;
  image: string | null;
  rail: AgaveCard[];
}) {
  const slug = speciesDirectorySlug(species);
  const producers = producerLinks(species);
  const us = producers.filter((p) => p.us && p.url);
  const others = producers.filter((p) => !(p.us && p.url));
  const states = parseStates(species.states);
  const statesText =
    states.length > STATE_LIMIT
      ? `${states.slice(0, STATE_LIMIT).join(", ")} and ${states.length - STATE_LIMIT} more`
      : states.join(", ");
  const size = species.size_height_feet || species.size_height_meters;
  const terrain = species.habitat && typeof species.habitat === "object" ? species.habitat.terrain : null;
  const use = species.mezcal_use?.trim() || null;
  const eyebrow = !use
    ? "Agave species"
    : /semi[\s-]?(wild|managed)/i.test(use) && /wild/i.test(use)
      ? "Wild and semi wild"
      : /wild/i.test(use)
        ? "Wild"
        : /cultivated|planted|farmed/i.test(use)
          ? "Cultivated"
          : "Agave species";
  const producersText =
    producers.length > 0
      ? us.length > 0
        ? `${producers.length}, ${us.length} sell in the US`
        : String(producers.length)
      : null;
  const longName = species.common_name.length > 8;

  return (
    <div className={longName ? "d long" : "d"}>
      <section className="d-hero">
        <div className="d-stage">
          <div className="d-copy">
            <p className="s-eyebrow">{eyebrow}</p>
            <h1 className="notranslate" translate="no">
              {species.common_name}
            </h1>
            <p className="d-sci">{species.scientific_name}</p>
            {species.description ? <p className="d-lede">{species.description}</p> : null}
            <dl className="d-stats">
              {size ? (
                <div>
                  <dt>Size</dt>
                  <dd>{size}</dd>
                </div>
              ) : null}
              {statesText ? (
                <div>
                  <dt>{states.length === 1 ? "State" : "States"}</dt>
                  <dd title={states.length > STATE_LIMIT ? states.join(", ") : undefined}>{statesText}</dd>
                </div>
              ) : null}
              {producersText ? (
                <div>
                  <dt>Producers</dt>
                  <dd>{producersText}</dd>
                </div>
              ) : null}
            </dl>
            {use || terrain ? (
              <dl className="d-notes">
                {use ? (
                  <div>
                    <dt>Mezcal use</dt>
                    <dd>{use}</dd>
                  </div>
                ) : null}
                {terrain ? (
                  <div>
                    <dt>Terrain</dt>
                    <dd>{terrain}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
            {producers.length > 0 ? (
              <a className="d-cta" href="#grab-a-bottle">
                Grab a bottle
                <Chevron dir="down" />
              </a>
            ) : null}
          </div>
          <div className="d-img">
            <AgaveImage src={image} alt={`${species.common_name} agave`} eager />
          </div>
        </div>
      </section>

      {producers.length > 0 ? (
        <section className="d-sec" id="grab-a-bottle" aria-labelledby="grab-a-bottle-title">
          <h2 id="grab-a-bottle-title">
            Grab a bottle of <span className="notranslate" translate="no">{species.common_name}</span>
          </h2>
          {us.length > 0 ? (
            <>
              <p className="sub">
                {us.length} US {us.length === 1 ? "shop ships" : "shops ship"} it. Your next pour just got way more epic.
              </p>
              <ul className="d-buy">
                {us.map((p, i) => (
                  <li key={p.name + i}>
                    <a
                      className="d-b"
                      href={p.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-track-species={slug}
                      data-track-group="us"
                    >
                      <div>
                        <b>{p.name}</b>
                        <span>{hostOf(p.url!)}</span>
                      </div>
                      <i>
                        <ArrowUpRight />
                      </i>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="sub">These producers bottle it. None ship to the US yet.</p>
          )}
          {others.length > 0 ? (
            <p className="d-also">
              <b>{us.length > 0 ? "Also made by" : "Made by"}</b>
              {others.map((p, i) => (
                <span key={p.name + i}>
                  {i > 0 ? ", " : null}
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" data-track-species={slug} data-track-group="more">
                      {p.name}
                    </a>
                  ) : (
                    p.name
                  )}
                </span>
              ))}
              .
            </p>
          ) : null}
        </section>
      ) : null}

      {rail.length > 1 ? <Rail cards={rail} current={slug} /> : null}
    </div>
  );
}
