"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import centroid from "@turf/centroid";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SearchOverlay } from "@/components/SearchOverlay";
import { getStatesInData, parseStatesForGeo } from "@/lib/map-utils";
import { toSlug } from "@/lib/slug";
import type { Species } from "@/types/species";

const AGAVE_YELLOW = "#a29037";
const AGAVE_YELLOW_DARK = "#7a6c2a";
const MAP_CENTER: [number, number] = [-102, 23];
const MAP_ZOOM = 4.5;

const DEBUG = true;
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

export default function MapPage() {
  const mapAreaRef = useRef<HTMLElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const containerReadyObserverRef = useRef<ResizeObserver | null>(null);

  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommonName, setSelectedCommonName] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [geoJson, setGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    debug("mounted=true");
  }, []);

  useEffect(() => {
    const el = mapAreaRef.current;
    if (!mounted || !el) return;

    function setMapAreaSize() {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const top = rect.top;
      const height = window.innerHeight - top;
      const width = window.innerWidth;
      el.style.height = `${Math.max(0, height)}px`;
      el.style.width = `${width}px`;
      debug("mapAreaSize set", { width, height, top });
    }

    const raf = requestAnimationFrame(setMapAreaSize);
    window.addEventListener("resize", setMapAreaSize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setMapAreaSize);
    };
  }, [mounted]);

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
  const mapInitializedRef = useRef(false);
  const mapLibRef = useRef<typeof maplibregl | null>(null);

  const initMap = useCallback((MapLibre: typeof maplibregl) => {
    const hasContainer = !!mapContainerRef.current;
    const hasGeoJson = !!geoJson;
    const hasMap = !!mapRef.current;
    const alreadyInit = mapInitializedRef.current;
    if (!hasContainer || !hasGeoJson || hasMap || alreadyInit) {
      debug("initMap early return", { hasContainer, hasGeoJson, hasMap, alreadyInit });
      return;
    }
    mapInitializedRef.current = true;
    debug("initMap starting");
    mapLibRef.current = MapLibre;
    const container = mapContainerRef.current;
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
      map.addLayer({
        id: "states-fill",
        type: "fill",
        source: "mexico-states-all",
        paint: {
          "fill-color": [
            "case",
            ["in", ["get", "state_name"], ["literal", selectedList]],
            AGAVE_YELLOW,
            ["in", ["get", "state_name"], ["literal", statesInDataList]],
            "rgba(255,255,255,0.25)",
            "rgba(100,100,100,0.12)",
          ],
          "fill-opacity": 1,
          "fill-antialias": true,
        },
      });

      map.addLayer({
        id: "states-line",
        type: "line",
        source: "mexico-states-all",
        paint: {
          "line-color": [
            "case",
            ["in", ["get", "state_name"], ["literal", selectedList]],
            AGAVE_YELLOW_DARK,
            ["in", ["get", "state_name"], ["literal", statesInDataList]],
            "#ffffff",
            "rgba(140,140,140,0.5)",
          ],
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

      map.setPaintProperty("states-fill", "fill-color", [
        "case",
        ["in", ["get", "state_name"], ["literal", selectedList]],
        AGAVE_YELLOW,
        ["in", ["get", "state_name"], ["literal", statesInDataList]],
        "rgba(255,255,255,0.25)",
        "rgba(100,100,100,0.12)",
      ]);
      map.setPaintProperty("states-line", "line-color", [
        "case",
        ["in", ["get", "state_name"], ["literal", selectedList]],
        AGAVE_YELLOW_DARK,
        ["in", ["get", "state_name"], ["literal", statesInDataList]],
        "#ffffff",
        "rgba(140,140,140,0.5)",
      ]);

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

        const currentSpecies = speciesRef.current;
        const speciesInState = currentSpecies.filter((s) => {
          const states = parseStatesForGeo(s.states);
          return states.includes(stateName);
        });
        const commonNamesInState = [...new Set(speciesInState.map((s) => s.common_name))].sort((a, b) => a.localeCompare(b, "en"));

        if (popupRef.current) popupRef.current.remove();
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
        const stateTitle = "<p class=\"text-sm font-bold text-[var(--agave-yellow)]\">" + escapeHtml(stateName) + "</p>";
        let body = "";
        if (selName && selSet.has(stateName)) {
          const sp = selSpecies[0];
          if (sp) {
            const terrain = parseHabitatTerrain(sp.habitat);
            const slug = toSlug(sp.common_name);
            body =
              "<p class=\"mt-2 font-semibold text-white/95\"><a href=\"/directory/" + escapeHtml(slug) + "\" class=\"text-[var(--agave-yellow)] underline hover:no-underline\" target=\"_self\">" + escapeHtml(sp.common_name) + "</a></p>" +
              (sp.geo_region ? "<p class=\"mt-1 text-sm text-white/90\"><span class=\"text-white/60\">Region:</span> " + escapeHtml(sp.geo_region) + "</p>" : "") +
              (terrain ? "<p class=\"mt-1 text-sm text-white/90\"><span class=\"text-white/60\">Terrain:</span> " + escapeHtml(terrain) + "</p>" : "");
          }
        } else {
          const listHtml = commonNamesInState.length
            ? commonNamesInState.map((n) => "<li><a href=\"/directory/" + escapeHtml(toSlug(n)) + "\" class=\"text-[var(--agave-yellow)] underline hover:no-underline\" target=\"_self\">" + escapeHtml(n) + "</a></li>").join("")
            : "<li class=\"text-white/60\">None in directory</li>";
          body = "<p class=\"mt-2 text-sm text-white/80\">Mezcals in this state:</p><ul class=\"mt-1 list-inside list-disc text-sm text-white/90\">" + listHtml + "</ul>";
        }
        popup.setHTML(
          "<div class=\"rounded-lg border border-white/20 bg-[#272926] p-3 text-white shadow-lg\" style=\"min-width: 180px;\">" + stateTitle + body + "</div>"
        );

        popup.on("close", () => {
          setSelectedCommonNameRef.current("");
          setSelectedStateRef.current("");
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
  }, [geoJson, statesInData, selectedStatesList]);

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
      mapRef.current.setPaintProperty("states-fill", "fill-color", [
        "case",
        ["in", ["get", "state_name"], ["literal", list]],
        AGAVE_YELLOW,
        ["in", ["get", "state_name"], ["literal", statesInDataList]],
        "rgba(255,255,255,0.25)",
        "rgba(100,100,100,0.12)",
      ]);
      mapRef.current.setPaintProperty("states-line", "line-color", [
        "case",
        ["in", ["get", "state_name"], ["literal", list]],
        AGAVE_YELLOW_DARK,
        ["in", ["get", "state_name"], ["literal", statesInDataList]],
        "#ffffff",
        "rgba(140,140,140,0.5)",
      ]);
      return;
    }
    let cancelled = false;
    (async () => {
      debug("loading maplibre-gl...");
      const mod = await import("maplibre-gl");
      const lib = mod.default ?? mod;
      if (cancelled || !mapContainerRef.current) {
        debug("async init cancelled or no container");
        return;
      }
      const container = mapContainerRef.current;
      function tryInit() {
        const rect = container.getBoundingClientRect();
        debug("tryInit container rect", rect.width, "x", rect.height);
        if (rect.width > 0 && rect.height > 0) {
          initMapRef.current(lib);
          return true;
        }
        return false;
      }
      requestAnimationFrame(() => {
        if (cancelled) return;
        if (tryInit()) {
          debug("tryInit succeeded on first RAF");
          return;
        }
        debug("container had 0 size, waiting for ResizeObserver");
        containerReadyObserverRef.current = new ResizeObserver(() => {
          if (cancelled) return;
          if (tryInit() && containerReadyObserverRef.current) {
            debug("tryInit succeeded via ResizeObserver");
            containerReadyObserverRef.current.disconnect();
            containerReadyObserverRef.current = null;
          }
        });
        containerReadyObserverRef.current?.observe(container);
      });
    })();
    return () => {
      cancelled = true;
      containerReadyObserverRef.current?.disconnect();
      containerReadyObserverRef.current = null;
    };
  }, [mounted, geoJson, statesInData, selectedStatesList, selectedState, initMap]);

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
    <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden">
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by common name…"
      />

      <div className="flex flex-nowrap items-center gap-2 border-b border-white/10 bg-[#272926] px-3 py-2 sm:px-4">
        {loading && (
          <p className="text-sm text-white/70">Loading species…</p>
        )}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="rounded p-2 text-white/80 hover:bg-white/10 hover:text-white"
          aria-label="Open search"
        >
          <Search className="size-5" />
        </button>
        <select
          id="map-common-name"
          aria-label="Select a mezcal"
          value={selectedCommonName}
          onChange={(e) => setSelectedCommonName(e.target.value)}
          className="map-page-select min-w-0 flex-1 rounded-lg border border-white/20 bg-[#32342f] px-2 py-2 text-sm text-white focus:border-[var(--agave-yellow)] focus:outline-none focus:ring-1 focus:ring-[var(--agave-yellow)] sm:px-3"
        >
          <option value="">Select a mezcal…</option>
          {commonNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select
          id="map-state"
          aria-label="Select a state"
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="map-page-select min-w-0 flex-1 rounded-lg border border-white/20 bg-[#32342f] px-2 py-2 text-sm text-white focus:border-[var(--agave-yellow)] focus:outline-none focus:ring-1 focus:ring-[var(--agave-yellow)] sm:px-3"
        >
          <option value="">Select a state…</option>
          {stateNamesList.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <main
        ref={mapAreaRef}
        className="relative w-full flex-1 overflow-hidden"
        style={{ background: "#272926" }}
      >
        {mounted && (
          <div
            ref={mapContainerRef}
            className="absolute inset-0 h-full w-full"
            style={{ background: "#272926" }}
          />
        )}
      </main>
    </div>
  );
}
