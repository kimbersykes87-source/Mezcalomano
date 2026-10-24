// Copies the MapLibre GL worker into public/ so the browser can load it.
// MapLibre 6 runs its worker from a separate file; bundlers cannot resolve
// its default URL, so src/app/map/page.tsx calls setWorkerUrl() with this path.
// Runs automatically before `npm run dev` and `npm run build`.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "maplibre-gl", "dist", "maplibre-gl-worker.mjs");
const destDir = join(root, "public", "maplibre");
mkdirSync(destDir, { recursive: true });
copyFileSync(src, join(destDir, "maplibre-gl-worker.mjs"));
console.log("Copied MapLibre worker to public/maplibre/");
