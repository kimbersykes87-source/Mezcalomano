import { buildFonts, generateGlyphPbfFiles, latinRanges } from "maplibre-font-maker-node";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = path.join(root, "tmp-fonts");
const output = path.join(root, "public", "map-fonts");

const openSansBytes = await readFile(path.join(tmp, "OpenSans.ttf"));
const notoSansBytes = await readFile(path.join(tmp, "NotoSans.ttf"));

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

// Individual stacks (for debugging / direct use)
const individuals = await buildFonts({
  output,
  fontstacks: [
    {
      font: path.join(tmp, "OpenSans.ttf"),
      fontstack: "Open Sans Semibold",
      ranges: "latin",
      axes: { wght: 600, wdth: 100 },
    },
    {
      font: path.join(tmp, "NotoSans.ttf"),
      fontstack: "Noto Sans Regular",
      ranges: "latin",
      axes: { wght: 400, wdth: 100 },
    },
  ],
});

// MapLibre requests comma-joined fontstacks for text-font arrays
const compositeStack = "Open Sans Semibold,Noto Sans Regular";
const compositeFiles = await generateGlyphPbfFiles({
  fontstack: compositeStack,
  fonts: [
    {
      name: "Open Sans Semibold",
      bytes: openSansBytes,
      settings: { wght: 600, wdth: 100 },
    },
    {
      name: "Noto Sans Regular",
      bytes: notoSansBytes,
      settings: { wght: 400, wdth: 100 },
    },
  ],
  ranges: latinRanges(),
});

for (const file of compositeFiles) {
  const dest = path.join(output, file.filename);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, file.bytes);
}

console.log({ individuals, composite: { fontstack: compositeStack, fileCount: compositeFiles.length } });
