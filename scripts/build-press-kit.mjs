// Builds the press kit for /press from the files in public/press/.
//
//   1. Reads the original photos in public/press/photos/ (copied byte for byte from
//      Shared Drive 03_MARKETING/press; never re-encode them).
//   2. Writes grid thumbnails to public/press/thumbs/ (1000px square, sRGB, for display
//      only) and data/press-images.json (file name, pixel size, bytes) for the page.
//   3. Writes public/press/mezcalomano-press-kit.zip with the photos and logos,
//      stored uncompressed so every file inside is identical to the original.
//
// Run after adding or replacing a press photo:  npm run build:press-kit
// Needs Node 22.2+ (zlib.crc32).

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import sharp from "sharp";

const ROOT = process.cwd();
const PRESS_DIR = path.join(ROOT, "public", "press");
const PHOTO_DIR = path.join(PRESS_DIR, "photos");
const LOGO_DIR = path.join(PRESS_DIR, "logos");
const THUMB_DIR = path.join(PRESS_DIR, "thumbs");

// Optional crop centre for a grid thumbnail, as fractions of the photo's width and height
// (0.5 = middle). Use it when the subject is off centre, e.g. a card held high in the frame.
const THUMB_FOCUS = {
  "mezcalomano-press-02-alto-card.jpg": { x: 0.5, y: 0.43 },
};
const PACKSHOT_DIR = path.join(PRESS_DIR, "packshots");
const ZIP_PATH = path.join(PRESS_DIR, "mezcalomano-press-kit.zip");
const MANIFEST_PATH = path.join(ROOT, "data", "press-images.json");
const PACKSHOT_MANIFEST_PATH = path.join(ROOT, "data", "press-packshots.json");

const listFiles = (dir, exts) =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((f) => exts.includes(path.extname(f).toLowerCase()))
        .sort()
    : [];

const photos = listFiles(PHOTO_DIR, [".jpg", ".jpeg", ".png"]);
const logos = listFiles(LOGO_DIR, [".png", ".svg"]);
const packshots = listFiles(PACKSHOT_DIR, [".jpg", ".jpeg", ".png"]);

if (photos.length === 0) {
  console.error("No photos found in public/press/photos/. Copy the originals there first.");
  process.exit(1);
}

fs.rmSync(THUMB_DIR, { recursive: true, force: true });
fs.mkdirSync(THUMB_DIR, { recursive: true });

const manifest = [];
for (const file of photos) {
  const full = path.join(PHOTO_DIR, file);
  const buf = fs.readFileSync(full);
  const meta = await sharp(buf).metadata();
  const width = meta.autoOrient?.width ?? meta.width;
  const height = meta.autoOrient?.height ?? meta.height;
  const thumb = file.replace(/\.(jpe?g|png)$/i, ".jpg");
  const focus = THUMB_FOCUS[file];
  let pipeline = sharp(buf).rotate();
  if (focus) {
    const side = Math.min(width, height);
    const clamp = (v, max) => Math.max(0, Math.min(Math.round(v), max));
    pipeline = pipeline.extract({
      left: clamp(focus.x * width - side / 2, width - side),
      top: clamp(focus.y * height - side / 2, height - side),
      width: side,
      height: side,
    });
  }
  await pipeline
    .resize(1000, 1000, { fit: "cover", position: "centre" })
    .toColorspace("srgb")
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(path.join(THUMB_DIR, thumb));
  manifest.push({ file, thumb, width, height, bytes: buf.length });
  const notes = [];
  if (meta.exif) notes.push("HAS EXIF");
  if (meta.xmp) notes.push("HAS XMP");
  if (meta.iptc) notes.push("HAS IPTC");
  if (!meta.icc) notes.push("NO ICC PROFILE");
  const sha = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
  console.log(`${file}  ${width}x${height}  ${(buf.length / 1e6).toFixed(2)} MB  sha256:${sha}  ${notes.join(", ") || "clean, ICC embedded"}`);
}

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

// Packshots (cut-outs and hero shots): thumbnails show the whole image, on white,
// so the transparent cut-out previews the way an editor will use it.
const packshotManifest = [];
for (const file of packshots) {
  const full = path.join(PACKSHOT_DIR, file);
  const buf = fs.readFileSync(full);
  const meta = await sharp(buf).metadata();
  const thumb = "packshot-" + file.replace(/\.(jpe?g|png)$/i, ".jpg");
  await sharp(buf)
    .resize(1000, 1000, { fit: "contain", background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .toColorspace("srgb")
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(THUMB_DIR, thumb));
  packshotManifest.push({ file, thumb, width: meta.width, height: meta.height, bytes: buf.length, transparent: !!meta.hasAlpha });
  console.log(`${file}  ${meta.width}x${meta.height}  ${(buf.length / 1e6).toFixed(2)} MB  ${meta.hasAlpha ? "transparent" : "opaque"}`);
}
fs.writeFileSync(PACKSHOT_MANIFEST_PATH, JSON.stringify(packshotManifest, null, 2) + "\n");
console.log(`Wrote ${path.relative(ROOT, MANIFEST_PATH)}`);

// Minimal ZIP writer, STORE method only (no compression, no re-encoding).
function dosDateTime(d) {
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { time, date };
}

const entries = [
  ...photos.map((f) => ({ name: `mezcalomano-press-kit/photos/${f}`, full: path.join(PHOTO_DIR, f) })),
  ...packshots.map((f) => ({ name: `mezcalomano-press-kit/packshots/${f}`, full: path.join(PACKSHOT_DIR, f) })),
  ...logos.map((f) => ({ name: `mezcalomano-press-kit/logos/${f}`, full: path.join(LOGO_DIR, f) })),
];

const chunks = [];
const central = [];
let offset = 0;
const { time, date } = dosDateTime(new Date());

for (const e of entries) {
  const data = fs.readFileSync(e.full);
  const name = Buffer.from(e.name, "utf8");
  const crc = zlib.crc32(data) >>> 0;

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4); // version needed
  local.writeUInt16LE(0x0800, 6); // UTF-8 names
  local.writeUInt16LE(0, 8); // method: store
  local.writeUInt16LE(time, 10);
  local.writeUInt16LE(date, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(data.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(name.length, 26);
  local.writeUInt16LE(0, 28);
  chunks.push(local, name, data);

  const cen = Buffer.alloc(46);
  cen.writeUInt32LE(0x02014b50, 0);
  cen.writeUInt16LE(20, 4); // version made by
  cen.writeUInt16LE(20, 6);
  cen.writeUInt16LE(0x0800, 8);
  cen.writeUInt16LE(0, 10);
  cen.writeUInt16LE(time, 12);
  cen.writeUInt16LE(date, 14);
  cen.writeUInt32LE(crc, 16);
  cen.writeUInt32LE(data.length, 20);
  cen.writeUInt32LE(data.length, 24);
  cen.writeUInt16LE(name.length, 28);
  cen.writeUInt16LE(0, 30);
  cen.writeUInt16LE(0, 32);
  cen.writeUInt16LE(0, 34);
  cen.writeUInt16LE(0, 36);
  cen.writeUInt32LE(0, 38);
  cen.writeUInt32LE(offset, 42);
  central.push(cen, name);

  offset += local.length + name.length + data.length;
}

const centralBuf = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(entries.length, 8);
end.writeUInt16LE(entries.length, 10);
end.writeUInt32LE(centralBuf.length, 12);
end.writeUInt32LE(offset, 16);

fs.writeFileSync(ZIP_PATH, Buffer.concat([...chunks, centralBuf, end]));
console.log(`Wrote ${path.relative(ROOT, ZIP_PATH)} (${entries.length} files, ${(fs.statSync(ZIP_PATH).size / 1e6).toFixed(1)} MB)`);
