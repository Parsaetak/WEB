/*
 * tests/ts-loader.mjs — resolution hook for `node --test` on the
 * application's TypeScript modules.
 *
 * Node 24 strips TS types natively, but the app is written with
 * bundler-style resolution: extensionless relative imports and the
 * "@/*" path alias. This hook resolves both to real .ts files (the
 * default loader then handles type stripping). Zero dependencies.
 */

import { existsSync, statSync } from "node:fs";

import path from "node:path";

import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const CANDIDATE_SUFFIXES = [
  "",
  ".ts",
  ".tsx",
  "/index.ts"
];

function firstExisting(basePath) {
  for (const suffix of CANDIDATE_SUFFIXES) {
    const candidate = `${basePath}${suffix}`;

    if (
      existsSync(candidate) &&
      statSync(candidate).isFile()
    ) {
      return candidate;
    }
  }

  return null;
}

export async function resolve(
  specifier,
  context,
  nextResolve
) {
  /* "@/*" application alias. */
  if (specifier.startsWith("@/")) {
    const base = path.join(ROOT, specifier.slice(2));

    const resolved = firstExisting(base);

    if (resolved) {
      return {
        url: pathToFileURL(resolved).href,
        shortCircuit: true
      };
    }
  }

  /*
   * Extensionless relative imports — add TypeScript candidates.
   */
  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    context.parentURL?.startsWith("file:")
  ) {
    const parentDir = path.dirname(
      fileURLToPath(context.parentURL)
    );

    const base = path.resolve(parentDir, specifier);

    const resolved = firstExisting(base);

    if (resolved) {
      return {
        url: pathToFileURL(resolved).href,
        shortCircuit: true
      };
    }
  }

  return nextResolve(specifier, context);
}
