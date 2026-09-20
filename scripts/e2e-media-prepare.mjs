#!/usr/bin/env node
/*
 * scripts/e2e-media-prepare.mjs — LOCAL verification helper.
 *
 * Builds the synthetic verification track (tests/fixtures bytes),
 * extracts its embedded metadata through the SAME production
 * extractor the CI sync uses, and writes a TEMPORARY data/media.json
 * containing one E2E music item. The temp manifest is reverted by
 * git after verification — the shipped repository never carries
 * fabricated content.
 */

import { mkdir, writeFile, copyFile } from "node:fs/promises";

import path from "node:path";

import { buildMp3, buildCoverPng } from "../tests/fixtures/audio.mjs";

import { extractAudioMetadata } from "../scripts/media/audioMetadata.mjs";

import { validateMediaManifest } from "../scripts/media/manifestSchema.mjs";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  ".."
);

const E2E_DIR = path.join(ROOT, ".e2e-track");

const TRACK_FILE = path.join(E2E_DIR, "01 Verification Track.mp3");

const bytes = buildMp3({ seconds: 45 });

await mkdir(E2E_DIR, { recursive: true });

await writeFile(TRACK_FILE, bytes);

await writeFile(path.join(E2E_DIR, "cover.png"), buildCoverPng());

/* Extract metadata through the production extractor (file-backed range fetch). */
const extracted = await extractAudioMetadata({
  url: "file://fixture/01 Verification Track.mp3",
  kind: "mp3",
  fetchRange: async (url, start, end) => {
    if (start === 0 && end === 0) {
      return {
        status: 206,
        arrayBuffer: bytes.subarray(0, 1).slice().buffer,
        contentRange: `bytes 0-0/${bytes.length}`,
        acceptRanges: "bytes"
      };
    }

    return {
      status: 206,
      arrayBuffer: bytes.subarray(start, end + 1).slice().buffer,
      contentRange: `bytes ${start}-${end}/${bytes.length}`,
      acceptRanges: "bytes"
    };
  }
});

if (extracted.source !== "embedded") {
  console.error("[e2e] extraction failed — aborting before any manifest change");

  process.exit(1);
}

const manifest = {
  version: 3,
  updated: "2026-08-26",
  items: [
    {
      branch: "Books",
      source: "RED MAGIC.pdf",
      title: "RED MAGIC",
      subtitle: "A living system of intelligence, adaptation, and synthetic life.",
      type: "book",
      description:
        "RED MAGIC begins as a question: what happens when software becomes responsive, adaptive, and capable of exhibiting its own evolving behaviour?",
      year: "2026",
      language: "English",
      author: "Parsa Tak",
      series: "RED MAGIC",
      volume: 1,
      featured: true,
      status: "published",
      readingTime: "Long read",
      tags: [
        "RED MAGIC",
        "AI",
        "intelligence",
        "systems",
        "consciousness",
        "simulation",
        "adaptation",
        "synthetic life"
      ]
    },
    {
      branch: "Books",
      source: "RED MAGIC 0_ MAGIC FOR KIDS.pdf",
      title: "RED MAGIC 0: MAGIC FOR KIDS",
      subtitle: "An accessible introduction to the ideas behind RED MAGIC.",
      type: "book",
      description:
        "An introduction to RED MAGIC for younger readers, using simple language to explore intelligence, systems, change, and the strange idea of software behaving like something alive.",
      year: "2026",
      language: "English",
      author: "Parsa Tak",
      series: "RED MAGIC",
      volume: 0,
      featured: false,
      status: "published",
      readingTime: "Short read",
      tags: ["RED MAGIC", "intelligence", "systems", "introduction", "education"]
    },
    {
      branch: "Books",
      source: "RED MAGIC II_ THE BOOK OF THE DEMIURGE.pdf",
      title: "RED MAGIC II: THE BOOK OF THE DEMIURGE",
      subtitle:
        "Creation, intelligence, systems, and the forces that shape artificial worlds.",
      type: "book",
      description:
        "The second RED MAGIC volume goes deeper into creation, intelligence, systems, and the forces that shape what an artificial world can become.",
      year: "2026",
      language: "English",
      author: "Parsa Tak",
      series: "RED MAGIC",
      volume: 2,
      featured: false,
      status: "published",
      readingTime: "Long read",
      tags: [
        "RED MAGIC",
        "systems",
        "creation",
        "intelligence",
        "synthetic life",
        "demiurge",
        "philosophy"
      ]
    },
    {
      branch: "E2E",
      source: "01 Verification Track.mp3",
      title: "01 Verification Track",
      type: "music",
      cover: "cover.png",
      year: extracted.fields.year ?? "2026",
      trackNumber: extracted.fields.trackNumber,
      trackTotal: extracted.fields.trackTotal,
      artist: extracted.fields.artist,
      album: extracted.fields.album,
      albumArtist: extracted.fields.albumArtist,
      genre: extracted.fields.genre,
      composer: extracted.fields.composer,
      comment: extracted.fields.comment,
      duration: extracted.duration,
      metadataSource: "embedded"
    }
  ]
};

const errors = validateMediaManifest(manifest);

if (errors.length > 0) {
  console.error("[e2e] temp manifest invalid:", errors);

  process.exit(1);
}

await writeFile(
  path.join(ROOT, "data", "media.json"),
  `${JSON.stringify(manifest, null, 2)}\n`
);

console.log(
  `[e2e] temp manifest written (1 synthetic E2E track, metadataSource=embedded, duration=${extracted.duration}s)`
);
