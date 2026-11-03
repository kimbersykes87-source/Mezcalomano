import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAliasTable } from "../lib/aliases.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, "../../..");
export const csvText = fs.readFileSync(path.join(repoRoot, "data", "Species_Final - Website.csv"), "utf8");
export const table = buildAliasTable(csvText);
export const fixture = (name) => fs.readFileSync(path.join(here, "fixtures", name), "utf8");
