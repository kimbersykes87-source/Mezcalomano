"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
import type maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import centroid from "@turf/centroid";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getStatesInData, parseStatesForGeo } from "@/lib/map-utils";
import { speciesDirectorySlug, toSlug } from "@/lib/slug";
import type { Species } from "@/types/species";

const AGAVE_YELLOW = "#a29037";
const AGAVE_YELLOW_DARK = "#7a6c2a";
const MAP_CENTER: [number, number] = [-102, 23];
const MAP_ZOOM = 4.5;

/** MapLibre fill-color expression: map click highlight, then species filter, then data states. */
function statesFillColorExpr(
  mapClickedState: string | null,
  selectedList: string[],
  statesInDataList: string[]
): maplibregl.ExpressionSpecification {
  const parts: unknown[] = ["case"];
  if (mapClickedState) {
    parts.push(["==", ["get", "state_name"], mapClickedState], AGAVE_YELLOW);
  }
  parts.push(
    ["in", ["get", "state_name"], ["literal", selectedList]],
    AGAVE_YELLOW,
    ["in", ["get", "state_name"], ["literal", statesInDataList]],
    "rgba(255,255,255,0.25)",
    "rgba(100,100,100,0.12)"
  );
  return parts as maplibregl.ExpressionSpecification;
}

function statesLineColorExpr(
  mapClickedState: string | null,
  selectedList: string[],
  statesInDataList: string[]
): maplibregl.ExpressionSpecification {
  const parts: unknown[] = ["case"];
  if (mapClickedState) {
    parts.push(["==", ["get", "state_name"], mapClickedState], AGAVE_YELLOW);
  }
  parts.push(
    ["in", ["get", "state_name"], ["literal", selectedList]],
    AGAVE_YELLOW_DARK,
    ["in", ["get", "state_name"], ["literal", statesInDataList]],
    "#ffffff",
    "rgba(140,140,140,0.5)"
  );
  return parts as maplibregl.ExpressionSpecification;
}

const DEBUG = process.env.NODE_ENV === "development";
function debug(...args: unknown[]) {
  if (DEBUG) console.log("[Map Debug]", ...args);
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function parseHabitatTerrain(habitat: Species["habitat"]): string {
  if (!habitat || typeof habitat !== "object") return "";
  const t = habitat as { terrain?: string };
  return t.terrain?.trim() ?? "";
}

/** Directory-style filter control: matches `/directory` combobox field + list (not native `<select>`). */
function MapDirectoryStyleSelect({
  id,
  label,
  "aria-label": ariaLabel,
  value,
  onChange,
  placeholder,
  options,
}: {
  id: string;
  label: string;
  "aria-label": string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

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

  const display = value || placeholder;

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative min-h-12 w-full min-w-0">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="box-border flex h-auto min-h-12 w-full min-w-0 items-center rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 pr-11 text-white focus:border-[var(--agave-yellow)] focus:outline-none sm:px-8 sm:pr-[4.75rem] md:px-[6rem]"
        style={{
          fontSize: "1.3125rem",
          lineHeight: 1.35,
        }}
      >
        <span
          className={`min-w-0 flex-1 text-balance text-center break-words ${value ? "text-white" : "text-white/40"}`}
        >
          {display}
        </span>
      </button>
      <div className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
        <ChevronDown
          className={`size-4 text-[var(--agave-yellow)] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </div>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-56 overflow-y-auto rounded-lg border border-white/20 bg-[#2a2c28] py-1 shadow-xl"
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
              className={`w-full py-2.5 text-left hover:bg-white/10 ${
                value === "" ? "bg-white/10 text-[var(--agave-yellow)]" : "text-white"
              }`}
              style={{
                fontSize: "1.3125rem",
                lineHeight: 1.35,
                paddingLeft: "1rem",
                paddingRight: "1rem",
              }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick("")}
            >
              {placeholder}
            </button>
          </li>
          {options.map((name) => {
            const selected = value === name;
            return (
              <li key={name} role="presentation">
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
                  onClick={() => pick(name)}
                >
                  {name}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export default function MapPage() {
  const mapAreaRef = useRef<HTMLElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const containerReadyObserverRef = useRef<ResizeObserver | null>(null);

  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommonName, setSelectedCommonName] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  /** State last tapped on the map (popup open); cleared when popup closes. Drives fill highlight. */
  const [mapClickedState, setMapClickedState] = useState<string | null>(null);
  const [geoJson, setGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    debug("mounted=true");
  }, []);


  useEffect(() => {
    async function fetchSpecies() {
      debug("fetching species...");
      const { data, error } = await supabase
        .from("species")
        .select("*")
        .order("species_id");
      if (error) {
        console.error("[Map] Supabase error:", error);
        debug("species fetch failed", error.message, error.details);
        setSpecies([]);
      } else {
        const list = (data as Species[]) ?? [];
        debug("species loaded", list.length, "rows");
        setSpecies(list);
      }
      setLoading(false);
    }
    fetchSpecies();
  }, []);

  useEffect(() => {
    let cancelled = false;
    debug("fetching GeoJSON...");
    fetch("/geo/mexico-states.geojson")
      .then((r) => {
        debug("GeoJSON response status", r.status, r.statusText);
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.json();
      })
      .then((data) => {
        if (!cancelled) {
          const fc = data as GeoJSON.FeatureCollection;
          debug("GeoJSON loaded", fc?.features?.length ?? 0, "features");
          setGeoJson(fc);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          console.error("[Map] GeoJSON load error:", e);
          debug("GeoJSON fetch failed", String(e));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const commonNames = [...new Set(species.map((s) => s.common_name))].sort(
    (a, b) => a.localeCompare(b, "en")
  );
  const statesInData = getStatesInData(species);
  const selectedSpecies = species.filter(
    (s) => s.common_name === selectedCommonName
  );
  const selectedStatesList = (() => {
    const set = new Set<string>();
    for (const s of selectedSpecies) {
      for (const state of parseStatesForGeo(s.states)) {
        set.add(state);
      }
    }
    if (selectedState) set.add(selectedState);
    return Array.from(set);
  })();
  const selectedStatesSet = new Set(selectedStatesList);
  const stateNamesList = (() => {
    if (!geoJson?.features?.length) return [];
    const names = geoJson.features
      .map((f) => f.properties?.state_name as string)
      .filter(Boolean);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b, "en"));
  })();

  const selectedStatesListRef = useRef<string[]>(selectedStatesList);
  selectedStatesListRef.current = selectedStatesList;
  const statesInDataRef = useRef<Set<string>>(statesInData);
  statesInDataRef.current = statesInData;
  const speciesRef = useRef<Species[]>(species);
  speciesRef.current = species;
  const selectedCommonNameRef = useRef(selectedCommonName);
  selectedCommonNameRef.current = selectedCommonName;
  const setSelectedCommonNameRef = useRef(setSelectedCommonName);
  setSelectedCommonNameRef.current = setSelectedCommonName;
  const setSelectedStateRef = useRef(setSelectedState);
  setSelectedStateRef.current = setSelectedState;
  const selectedSpeciesRef = useRef(selectedSpecies);
  selectedSpeciesRef.current = selectedSpecies;
  const selectedStatesSetRef = useRef(selectedStatesSet);
  selectedStatesSetRef.current = selectedStatesSet;
  const mapClickedStateRef = useRef(mapClickedState);
  mapClickedStateRef.current = mapClickedState;
  const setMapClickedStateRef = useRef(setMapClickedState);
  setMapClickedStateRef.current = setMapClickedState;
  const mapInitializedRef = useRef(false);
  const mapLibRef = useRef<typeof maplibregl | null>(null);

  const initMap = useCallback((MapLibre: typeof maplibregl) => {
    const container = mapContainerRef.current;
    if (!container || !geoJson || mapRef.current || mapInitializedRef.current) {
      debug("initMap early return", { hasContainer: !!container, hasGeoJson: !!geoJson, hasMap: !!mapRef.current, alreadyInit: mapInitializedRef.current });
      return;
    }
    mapInitializedRef.current = true;
    debug("initMap starting");
    mapLibRef.current = MapLibre;
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      debug("initMap abort: container has no size", rect);
      mapInitializedRef.current = false;
      return;
    }
    debug("creating MapLibre instance", rect.width, "x", rect.height);

    const map = new MapLibre.Map({
      container,
      style: {
        version: 8,
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        sources: {},
        layers: [
          {
            id: "background",
            type: "background",
            paint: { "background-color": "#272926" },
          },
        ],
      },
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      attributionControl: false,
    });

    map.addControl(new MapLibre.NavigationControl(), "bottom-right");

    const statesInDataList = Array.from(statesInData);

    map.on("error", (e) => {
      console.error("[Map] Map error:", e);
    });
    map.on("load", () => {
      debug("map load event fired, adding layers");
      map.addSource("mexico-states-all", { type: "geojson", data: geoJson });

      const labelFeatures: GeoJSON.Feature<GeoJSON.Point>[] = geoJson.features.map((f) => {
        const c = centroid(f as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>);
        const name = f.properties?.state_name as string | undefined;
        return {
          type: "Feature" as const,
          properties: { state_name: name ?? "" },
          geometry: c.geometry,
        };
      });
      map.addSource("mexico-states-labels", {
        type: "geojson",
        data: { type: "FeatureCollection", features: labelFeatures },
      });

      map.addLayer({
        id: "states-outline",
        type: "line",
        source: "mexico-states-all",
        paint: {
          "line-color": "rgba(120, 120, 120, 0.6)",
          "line-width": 0.5,
        },
      });

      const selectedList = [...selectedStatesListRef.current];
      const clicked = mapClickedStateRef.current;
      map.addLayer({
        id: "states-fill",
        type: "fill",
        source: "mexico-states-all",
        paint: {
          "fill-color": statesFillColorExpr(clicked, selectedList, statesInDataList),
          "fill-opacity": 1,
          "fill-antialias": true,
        },
      });

      map.addLayer({
        id: "states-line",
        type: "line",
        source: "mexico-states-all",
        paint: {
          "line-color": statesLineColorExpr(clicked, selectedList, statesInDataList),
          "line-width": 1.5,
        },
      });

      map.addLayer({
        id: "states-labels",
        type: "symbol",
        source: "mexico-states-labels",
        layout: {
          "text-field": ["get", "state_name"],
          "text-transform": "uppercase",
          "text-size": 11,
          "text-font": ["Noto Sans Regular"],
          "text-allow-overlap": false,
          "text-ignore-placement": false,
        },
        paint: {
          "text-color": "rgba(255,255,255,0.85)",
          "text-halo-color": "rgba(0,0,0,0.6)",
          "text-halo-width": 1.5,
        },
      });

      map.getCanvas().style.cursor = "";
      map.on("mouseenter", "states-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "states-fill", () => {
        map.getCanvas().style.cursor = "";
      });

      function onMapClick(e: maplibregl.MapMouseEvent) {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["states-fill"],
        });
        if (features.length === 0) return;
        const feature = features[0];
        const stateName = feature.properties?.state_name as string | undefined;
        if (!stateName) return;

        // Dismiss any open popup before updating highlight. Otherwise `remove()` fires the
        // previous popup's "close" handler, which clears mapClickedState after we'd set the new state.
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }

        setMapClickedStateRef.current(stateName);

        try {
          const g = feature.geometry;
          if (g && (g.type === "Polygon" || g.type === "MultiPolygon")) {
            const c = centroid({
              type: "Feature",
              properties: {},
              geometry: g,
            } as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>);
            const [lng, lat] = c.geometry.coordinates;
            map.easeTo({
              center: [lng, lat],
              zoom: map.getZoom(),
              duration: 550,
            });
          }
        } catch (err) {
          debug("state centroid / easeTo failed", err);
        }

        const currentSpecies = speciesRef.current;
        const speciesInState = currentSpecies.filter((s) => {
          const states = parseStatesForGeo(s.states);
          return states.includes(stateName);
        });
        const commonNamesInState = [...new Set(speciesInState.map((s) => s.common_name))].sort((a, b) => a.localeCompare(b, "en"));
        const directorySlugByCommonName = new Map<string, string>();
        for (const s of speciesInState) {
          if (!directorySlugByCommonName.has(s.common_name)) {
            directorySlugByCommonName.set(s.common_name, speciesDirectorySlug(s));
          }
        }

        const MapLibre = mapLibRef.current;
        if (!MapLibre) return;
        const popup = new MapLibre.Popup({
          closeButton: true,
          closeOnClick: false,
          className: "mezcal-map-popup",
        })
          .setLngLat(e.lngLat)
          .addTo(map);

        popupRef.current = popup;

        const selName = selectedCommonNameRef.current;
        const selSet = selectedStatesSetRef.current;
        const selSpecies = selectedSpeciesRef.current;
        const stateTitle = '<div class="mezcal-map-popup-title">' + escapeHtml(stateName) + "</div>";
        let body = "";
        if (selName && selSet.has(stateName)) {
          const sp = selSpecies[0];
          if (sp) {
            const terrain = parseHabitatTerrain(sp.habitat);
            const slug = speciesDirectorySlug(sp);
            body =
              '<div class="mezcal-map-popup-body">' +
              '<p class="mezcal-map-popup-detail"><a href="/directory/' +
              escapeHtml(slug) +
              '" target="_self">' +
              escapeHtml(sp.common_name) +
              "</a></p>" +
              (sp.geo_region
                ? '<p class="mezcal-map-popup-detail"><span class="mezcal-map-popup-muted">Region:</span> ' +
                  escapeHtml(sp.geo_region) +
                  "</p>"
                : "") +
              (terrain
                ? '<p class="mezcal-map-popup-detail"><span class="mezcal-map-popup-muted">Terrain:</span> ' +
                  escapeHtml(terrain) +
                  "</p>"
                : "") +
              "</div>";
          }
        } else {
          const listHtml = commonNamesInState.length
            ? commonNamesInState
                .map(
                  (n) =>
                    '<li><a href="/directory/' +
                    escapeHtml(directorySlugByCommonName.get(n) ?? toSlug(n)) +
                    '" target="_self">' +
                    escapeHtml(n) +
                    "</a></li>"
                )
                .join("")
            : '<li><span class="mezcal-map-popup-muted">None in directory</span></li>';
          body =
            '<div class="mezcal-map-popup-body">' +
            '<p class="mezcal-map-popup-lead">Mezcals in this state:</p>' +
            '<ul class="mezcal-map-popup-list">' +
            listHtml +
            "</ul></div>";
        }
        popup.setHTML('<div class="mezcal-map-popup-frame">' + stateTitle + body + "</div>");

        popup.on("close", () => {
          setSelectedCommonNameRef.current("");
          setSelectedStateRef.current("");
          setMapClickedStateRef.current(null);
        });
      }
      map.on("click", onMapClick);

      map.resize();
      requestAnimationFrame(() => map.resize());
      resizeObserverRef.current = new ResizeObserver(() => {
        mapRef.current?.resize();
      });
      resizeObserverRef.current.observe(container);
      mapRef.current = map;
      debug("map fully initialized");
    });

    mapRef.current = map;
  }, [geoJson, statesInData]);

  const initMapRef = useRef(initMap);
  initMapRef.current = initMap;

  useEffect(() => {
    debug("map init effect run", { mounted, hasGeoJson: !!geoJson, mapContainerRef: !!mapContainerRef.current });
    if (!mounted || !geoJson) {
      debug("map init effect early return: missing mounted or geoJson");
      return;
    }
    if (mapRef.current) {
      if (!mapRef.current.getLayer("states-fill")) return;
      const list = [...selectedStatesList];
      const statesInDataList = Array.from(statesInData);
      mapRef.current.setPaintProperty(
        "states-fill",
        "fill-color",
        statesFillColorExpr(mapClickedState, list, statesInDataList)
      );
      mapRef.current.setPaintProperty(
        "states-line",
        "line-color",
        statesLineColorExpr(mapClickedState, list, statesInDataList)
      );
      return;
    }
    let cancelled = false;
    const mapArea = mapAreaRef.current;
    const container = mapContainerRef.current;
    if (!mapArea || !container) {
      debug("async init: no mapArea or container");
      return;
    }
    (async () => {
      debug("loading maplibre-gl...");
      const mod = await import("maplibre-gl");
      const lib = mod.default ?? mod;
      if (cancelled) return;
      function tryInit() {
        if (!mapArea) return false;
        const areaRect = mapArea.getBoundingClientRect();
        debug("tryInit mapArea rect", areaRect.width, "x", areaRect.height);
        if (areaRect.width > 0 && areaRect.height > 0 && mapContainerRef.current) {
          initMapRef.current(lib);
          return true;
        }
        return false;
      }
      requestAnimationFrame(() => {
        if (cancelled) return;
        requestAnimationFrame(() => {
          if (cancelled) return;
          if (tryInit()) {
            debug("tryInit succeeded");
            return;
          }
          debug("mapArea had 0 height, waiting for ResizeObserver");
          containerReadyObserverRef.current = new ResizeObserver(() => {
            if (cancelled) return;
            if (tryInit() && containerReadyObserverRef.current) {
              debug("tryInit succeeded via ResizeObserver");
              containerReadyObserverRef.current.disconnect();
              containerReadyObserverRef.current = null;
            }
          });
          containerReadyObserverRef.current?.observe(mapArea);
        });
      });
    })();
    return () => {
      cancelled = true;
      containerReadyObserverRef.current?.disconnect();
      containerReadyObserverRef.current = null;
    };
  }, [mounted, geoJson, statesInData, selectedStatesList, selectedState, mapClickedState, initMap]);

  useEffect(() => {
    return () => {
      containerReadyObserverRef.current?.disconnect();
      containerReadyObserverRef.current = null;
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      if (popupRef.current) popupRef.current.remove();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      mapLibRef.current = null;
      mapInitializedRef.current = false;
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {/* Same grid as .header-content: 1fr auto 1fr — center column matches logo alignment */}
      <div className="shrink-0 bg-[#272926] py-3 sm:py-4">
        <div className="map-toolbar-content">
          <div className="map-toolbar-grid-spacer" aria-hidden />
          <div className="map-toolbar-center flex flex-col items-center gap-3 sm:gap-3">
            {loading ? (
              <p className="py-2 text-center text-sm text-white/70">Loading species…</p>
            ) : (
              <>
                <nav
                  className="flex w-4/5 items-center gap-2.5 sm:gap-3"
                  aria-label="Filter by mezcal"
                >
                  <span
                    className="inline-flex size-10 shrink-0"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <MapDirectoryStyleSelect
                      id="map-common-name"
                      label="Select a mezcal"
                      aria-label="Select a mezcal"
                      value={selectedCommonName}
                      onChange={setSelectedCommonName}
                      placeholder="Select a mezcal…"
                      options={commonNames}
                    />
                  </div>
                  <span
                    className="inline-flex size-10 shrink-0"
                    aria-hidden
                  />
                </nav>
                <nav
                  className="flex w-4/5 items-center gap-2.5 sm:gap-3"
                  aria-label="Filter by state"
                >
                  <span
                    className="inline-flex size-10 shrink-0"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <MapDirectoryStyleSelect
                      id="map-state"
                      label="Select a state"
                      aria-label="Select a state"
                      value={selectedState}
                      onChange={setSelectedState}
                      placeholder="Select a state…"
                      options={stateNamesList}
                    />
                  </div>
                  <span
                    className="inline-flex size-10 shrink-0"
                    aria-hidden
                  />
                </nav>
              </>
            )}
          </div>
          <div className="map-toolbar-grid-spacer" aria-hidden />
        </div>
      </div>

      <main
        ref={mapAreaRef}
        className="map-page-map-area relative min-h-0 w-full flex-1 overflow-hidden border-0 outline-none ring-0"
        style={{ background: "#272926", minHeight: 240 }}
      >
        {mounted && (
          <div
            ref={mapContainerRef}
            className="absolute inset-0 h-full w-full border-0 outline-none"
            style={{ background: "#272926" }}
          />
        )}
      </main>
    </div>
  );
}
