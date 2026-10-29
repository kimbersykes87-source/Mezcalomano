"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
import type maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import centroid from "@turf/centroid";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getStatesInData, parseStatesForGeo } from "@/lib/map-utils";
import type { Species } from "@/types/species";

const AGAVE_YELLOW = "#dfb725";
const AGAVE_YELLOW_DARK = "#7a6c2a";
const MAP_CENTER: [number, number] = [-102, 23];
const MAP_ZOOM = 4.5;
// Zoom-out floor. MapLibre derives a min zoom from maxBounds by fitting the viewport
// INSIDE this box, so the non-limiting axis always shows less than the box. On a wide
// desktop container LONGITUDE is what binds, which means the desktop's top/bottom
// clearance is set by the longitude span, not the latitude span -- widening latitude
// alone does nothing for a cropped northern border. The 71-degree longitude span below
// is sized to leave ~4 degrees above Nogales and below Chiapas at a 2.4 container
// aspect, and still clears the country at 3.0. The latitude span is what keeps phones
// from cropping Baja and the Yucatan; it is deliberately far wider than Mexico.
/** Mexico's outline, used to centre and fit the map in its panel. */
const MEXICO_BOUNDS: [[number, number], [number, number]] = [
  [-118.4, 14.5],
  [-86.7, 32.7],
];
const MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-138, -1],
  [-67, 45],
];

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
    <div ref={wrapRef} className="map-filter-select relative w-full min-w-0">
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
        className="map-filter-select__button"
      >
        <span
          className={`min-w-0 flex-1 truncate text-left ${value ? "text-white" : "text-white/70"}`}
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
          className="map-filter-select__list"
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
              className={`map-filter-select__option ${
                value === "" ? "map-filter-select__option--active" : ""
              }`}
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
                  className={`map-filter-select__option ${
                    selected ? "map-filter-select__option--active" : ""
                  }`}
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
  const mapAreaRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
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
  /** What the side card shows: the species or state picked last (dropdown or map tap). */
  const [focus, setFocus] = useState<{ kind: "species" | "state"; name: string } | null>(null);
  const setFocusRef = useRef(setFocus);
  setFocusRef.current = setFocus;

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

  const closeMapStateDetail = useCallback(() => {
    setFocus(null);
    setSelectedCommonName("");
    setSelectedState("");
    setMapClickedState(null);
  }, []);

  useEffect(() => {
    if (!focus) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMapStateDetail();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [focus, closeMapStateDetail]);

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
        glyphs: "/map-fonts/{fontstack}/{range}.pbf",
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
      maxBounds: MAP_MAX_BOUNDS,
      renderWorldCopies: false,
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
          "text-font": ["Open Sans Semibold", "Noto Sans Regular"],
          "text-size": 13,
          "text-letter-spacing": 0.05,
          "text-max-width": 8,
          "text-allow-overlap": false,
          "text-ignore-placement": false,
        },
        paint: {
          "text-color": "#f4f2ec",
          "text-halo-color": "rgba(20,18,16,0.85)",
          "text-halo-width": 1.4,
          "text-halo-blur": 0.3,
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

        setMapClickedStateRef.current(stateName);
        setSelectedCommonNameRef.current("");
        setSelectedStateRef.current(stateName);
        setFocusRef.current({ kind: "state", name: stateName });

        const panMapToState =
          typeof window !== "undefined" &&
          window.matchMedia("(min-width: 640px)").matches;

        if (panMapToState) {
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
        }

      }
      map.on("click", onMapClick);

      // Centre Mexico in the panel, and keep it centred as the panel resizes until someone
      // moves the map themselves.
      let userMoved = false;
      const fitMexico = () => {
        if (userMoved) return;
        map.fitBounds(MEXICO_BOUNDS, { padding: 24, animate: false });
      };
      map.on("dragstart", () => {
        userMoved = true;
      });
      map.on("zoomstart", (e) => {
        if ((e as { originalEvent?: unknown }).originalEvent) userMoved = true;
      });
      map.on("click", () => {
        userMoved = true;
      });
      map.resize();
      fitMexico();
      requestAnimationFrame(() => {
        map.resize();
        fitMexico();
      });
      resizeObserverRef.current = new ResizeObserver(() => {
        mapRef.current?.resize();
        fitMexico();
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
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      mapLibRef.current = null;
      mapInitializedRef.current = false;
    };
  }, []);

  const cardItems: string[] = !focus
    ? []
    : focus.kind === "species"
      ? [...new Set(species.filter((sp) => sp.common_name === focus.name).flatMap((sp) => parseStatesForGeo(sp.states)))].sort(
          (a, b) => a.localeCompare(b, "es")
        )
      : [...new Set(species.filter((sp) => parseStatesForGeo(sp.states).includes(focus.name)).map((sp) => sp.common_name))].sort(
          (a, b) => a.localeCompare(b, "en")
        );

  return (
    <>
      <section className="m-head">
        <div className="s-wrap">
          <div>
            <p className="s-eyebrow">Where agaves grow</p>
            <h1>Find Your Agave</h1>
            <p>Pick a species or a state</p>
          </div>
          <div className="m-sel">
            {loading ? (
              <p className="m-loading">Loading species…</p>
            ) : (
              <>
                <nav className="m-field" aria-label="Filter by species">
                  <MapDirectoryStyleSelect
                    id="map-common-name"
                    label="Species"
                    aria-label="Species"
                    value={selectedCommonName}
                    onChange={(v) => {
                      setSelectedCommonName(v);
                      setSelectedState("");
                      setMapClickedState(null);
                      setFocus(v ? { kind: "species", name: v } : null);
                    }}
                    placeholder="Species"
                    options={commonNames}
                  />
                </nav>
                <nav className="m-field" aria-label="Filter by state">
                  <MapDirectoryStyleSelect
                    id="map-state"
                    label="State"
                    aria-label="State"
                    value={selectedState}
                    onChange={(v) => {
                      setSelectedState(v);
                      setSelectedCommonName("");
                      setMapClickedState(null);
                      setFocus(v ? { kind: "state", name: v } : null);
                    }}
                    placeholder="State"
                    options={stateNamesList}
                  />
                </nav>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="m-body" aria-label="Map of Mexico">
        <div className="s-wrap">
          <div
            ref={mapAreaRef}
            className="m-map map-page-map-area"
            style={{ background: "#2B2D2A" }}
          >
            {mounted && (
              <div
                ref={mapContainerRef}
                className="absolute inset-0 h-full w-full border-0 outline-none"
                style={{ background: "#2B2D2A" }}
              />
            )}
          </div>
          <aside className="m-card" aria-live="polite">
            {focus ? (
              <>
                <button
                  type="button"
                  className="m-card-close"
                  onClick={closeMapStateDetail}
                  aria-label={`Clear ${focus.name}`}
                >
                  ×
                </button>
                <h2 className="m-card-title notranslate" translate="no">
                  {focus.name}
                </h2>
                <p className="m-card-lead">
                  {focus.kind === "species" ? "Grows in these states" : "Mezcals in this state"}
                </p>
                {cardItems.length > 0 ? (
                  <ul className="m-card-list">
                    {cardItems.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          onClick={() => {
                            if (focus.kind === "species") {
                              setSelectedCommonName("");
                              setSelectedState(item);
                              setFocus({ kind: "state", name: item });
                            } else {
                              setSelectedState("");
                              setSelectedCommonName(item);
                              setFocus({ kind: "species", name: item });
                            }
                            setMapClickedState(null);
                          }}
                        >
                          <span className="notranslate" translate="no">{item}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="m-card-none">
                    {focus.kind === "species" ? "No states listed yet." : "None in the directory yet."}
                  </p>
                )}
              </>
            ) : (
              <div className="m-card-empty">
                <h2>Tap a state</h2>
                <p>Choose a state on the map, or pick a species or state above.</p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
