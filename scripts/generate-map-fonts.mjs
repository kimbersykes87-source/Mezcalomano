import { buildFonts } from "maplibre-font-maker-node";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const font = path.join(root, "tmp-fonts", "OpenSans.ttf");
const output = path.join(root, "public", "map-fonts");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

// Match site-wide Open Sans Condensed (wdth 75, weight 400).
const summary = await buildFonts({
  output,
  fontstacks: [
    {
      font,
      fontstack: "Open Sans Condensed Regular",
      ranges: "latin",
      axes: { wght: 400, wdth: 75 },
    },
  ],
});

console.log(summary);
