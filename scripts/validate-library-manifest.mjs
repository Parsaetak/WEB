#!/usr/bin/env node
/*
 * validate-library-manifest.mjs — Library manifest gate.
 *
 * The Library scene renders from data/library.json, fetched in CI
 * from the Contents repository's Projects branch. Before the site
 * builds, the manifest must be structurally sound:
 *
 *   - top level: numeric `version`, string `updated`, array `items`
 *   - every item: string `branch`, `source`, `title`, `type`
 *
 * A malformed manifest fails the build BEFORE any expensive work,
 * with a message naming the first offending field. Zero runtime
 * dependencies, checked in so the same gate runs locally and in CI.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const MANIFEST_PATH = path.join(ROOT, "data", "library.json");

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function fail(message) {
  console.error(`[library] ${message}`);
  process.exit(1);
}

let manifest;

try {
  manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
} catch (error) {
  fail(`data/library.json is not parseable JSON: ${error.message}`);
}

if (typeof manifest.version !== "number") {
  fail("manifest field `version` must be a number");
}

if (!isNonEmptyString(manifest.updated)) {
  fail("manifest field `updated` must be a non-empty string");
}

if (!Array.isArray(manifest.items)) {
  fail("manifest field `items` must be an array");
}

for (const [index, item] of manifest.items.entries()) {
  for (const field of ["branch", "source", "title", "type"]) {
    if (!isNonEmptyString(item?.[field])) {
      fail(
        `items[${index}] is missing a valid \`${field}\` string — check the manifest in the Contents repository`
      );
    }
  }
}

console.log(`[library] Manifest valid: ${manifest.items.length} item(s).`);
