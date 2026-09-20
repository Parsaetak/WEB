/*
 * tests/media-manifest.test.ts — Media manifest schema + sync
 * normalization tests (the Library → Media data pipeline contract).
 */

import { describe, it } from "node:test";

import assert from "node:assert/strict";

import {
  validateMediaManifest
} from "../scripts/media/manifestSchema.mjs";

import {
  buildMediaManifest,
  normalizeRawItem
} from "../scripts/media/manifestSync.mjs";

import { buildFlac, buildMp3 } from "./fixtures/audio.mjs";

const VALID_BOOK = {
  branch: "Books",
  source: "RED MAGIC.pdf",
  title: "RED MAGIC",
  type: "book"
};

function makeFetcher(files: Record<string, Uint8Array>) {
  const map = new Map<string, Uint8Array>();

  for (const [path, data] of Object.entries(files)) {
    map.set(path, new Uint8Array(data));
  }

  return async (url: string, start: number, end: number) => {
    const path = new URL(url).pathname.replace(/^\//, "");

    const bytes: Uint8Array | undefined =
      map.get(decodeURIComponent(path));

    if (!bytes) {
      return {
        status: 404,
        arrayBuffer: new ArrayBuffer(0),
        contentRange: null,
        acceptRanges: null
      };
    }

    if (start === 0 && end === 0) {
      return {
        status: 206,
        arrayBuffer: bytes.subarray(0, 1).slice().buffer,
        contentRange: `bytes 0-0/${bytes.length}`,
        acceptRanges: "bytes"
      };
    }

    const rangeEnd = end ?? bytes.length - 1;

    return {
      status: 206,
      arrayBuffer: bytes
        .subarray(start, rangeEnd + 1)
        .slice()
        .buffer,
      contentRange: `bytes ${start}-${rangeEnd}/${bytes.length}`,
      acceptRanges: "bytes"
    };
  };
}

describe("manifest schema (data/media.json v3)", () => {
  it("accepts the shipped empty-music state", () => {
    const errors = validateMediaManifest({
      version: 3,
      updated: "2026-08-26",
      items: [VALID_BOOK]
    });

    assert.deepEqual(errors, []);
  });

  it("rejects the legacy audio type with a migration hint", () => {
    const errors = validateMediaManifest({
      version: 3,
      updated: "2026-08-26",
      items: [{ ...VALID_BOOK, type: "audio" }]
    });

    assert.ok(errors.some((error) => error.includes("audio")));
  });

  it("rejects version drift", () => {
    const errors = validateMediaManifest({
      version: 2,
      updated: "2026-08-26",
      items: []
    });

    assert.ok(errors.some((error) => error.includes("version")));
  });

  it("enforces type/extension coherence", () => {
    const errors = validateMediaManifest({
      version: 3,
      updated: "2026-08-26",
      items: [
        { ...VALID_BOOK, type: "music", source: "not-audio.pdf" }
      ]
    });

    assert.ok(
      errors.some((error) => error.includes("does not allow .pdf"))
    );
  });

  it("accepts the music extensions and rejects unknown fields", () => {
    const ok = validateMediaManifest({
      version: 3,
      updated: "2026-08-26",
      items: [
        {
          branch: "Music",
          source: "01 Song.mp3",
          title: "01 Song",
          type: "music",
          artist: "A",
          duration: 12.5,
          metadataSource: "embedded"
        }
      ]
    });

    assert.deepEqual(ok, []);

    const bad = validateMediaManifest({
      version: 3,
      updated: "2026-08-26",
      items: [
        {
          branch: "Music",
          source: "01 Song.mp3",
          title: "01 Song",
          type: "music",
          bogus: true
        }
      ]
    });

    assert.ok(bad.some((error) => error.includes("bogus")));
  });
});

describe("sync normalization (normalizeRawItem)", () => {
  it("maps the legacy audio type to music", () => {
    const result = normalizeRawItem(
      {
        branch: "Books",
        source: "X.mp3",
        title: "X",
        type: "audio"
      },
      "test"
    );

    assert.ok(result.item);
    assert.equal(result.item!.type, "music");
  });

  it("drops malformed records with a reason (no crashes, no inventions)", () => {
    const missing = normalizeRawItem(
      { branch: "Books", title: "X", type: "book" },
      "test"
    );

    assert.ok(missing.error);

    const unknown = normalizeRawItem(
      { branch: "Books", source: "x.txt", title: "X", type: "pamphlet" },
      "test"
    );

    assert.ok(unknown.error);
  });
});

describe("buildMediaManifest (the sync pipeline core)", () => {
  it("merges books + music, extracts embedded metadata, resolves covers", async () => {
    const mp3 = buildMp3({ seconds: 9 });

    const { manifest, warnings } = await buildMediaManifest({
      library: {
        version: 2,
        updated: "2026-08-26",
        items: [VALID_BOOK]
      },
      music: {
        version: 1,
        updated: "2026-09-19",
        items: [
          {
            branch: "Music",
            source: "Album/01 First.mp3",
            title: "01 First"
          }
        ]
      },
      branchBaseUrl: "https://cdn.test",
      fetchRange: makeFetcher({
        "Music/Album/01 First.mp3": mp3,
        "Music/Album/01 First.jpeg": Uint8Array.of(0x00)
      })
    });

    assert.equal(manifest.version, 3);
    assert.equal(manifest.updated, "2026-09-19");
    assert.equal(manifest.items.length, 2);

    const [book, track] = manifest.items;

    assert.equal(book.type, "book");

    assert.equal(track.type, "music");
    assert.equal(track.artist, "Test Artist");
    assert.equal(track.album, "Test Album");
    assert.equal(track.metadataSource, "embedded");
    assert.ok(Math.abs(track.duration! - 9) < 0.5);
    assert.equal(track.cover, "Album/01 First.jpeg");
  });

  it("keeps manifest metadata when extraction finds nothing", async () => {
    const { manifest, warnings } = await buildMediaManifest({
      library: { version: 2, updated: "2026-08-26", items: [] },
      music: {
        version: 1,
        updated: "2026-09-19",
        items: [
          {
            branch: "Music",
            source: "silent.flac",
            title: "silent",
            artist: "Manifest Artist"
          }
        ]
      },
      branchBaseUrl: "https://cdn.test",
      fetchRange: makeFetcher({})
    });

    const track = manifest.items[0];

    assert.equal(track.artist, "Manifest Artist");
    assert.equal(track.metadataSource, "manifest");
    assert.ok(
      warnings.some((warning) => warning.includes("no embedded metadata")),
      "extraction gap is reported in the returned warnings"
    );
  });

  it("produces the documented empty state when no music source exists", async () => {
    const { manifest } = await buildMediaManifest({
      library: {
        version: 2,
        updated: "2026-08-26",
        items: [VALID_BOOK]
      },
      music: null,
      branchBaseUrl: "https://cdn.test",
      fetchRange: makeFetcher({})
    });

    assert.equal(manifest.items.length, 1);
    assert.equal(
      manifest.items.filter((item) => item.type === "music").length,
      0,
      "zero fabricated tracks"
    );
    assert.equal(manifest.updated, "2026-08-26");
  });

  it("never fabricates metadata for fabricated-looking inputs", async () => {
    const { manifest } = await buildMediaManifest({
      library: { version: 2, updated: "2026-08-26", items: [] },
      music: {
        version: 1,
        updated: "2026-09-19",
        items: [
          { branch: "Music", source: "gone.mp3", title: "gone" }
        ]
      },
      branchBaseUrl: "https://cdn.test",
      fetchRange: makeFetcher({})
    });

    const track = manifest.items[0];

    /* The item survives (the publisher listed it) but carries NO
     * invented fields — only its manifest truth. */
    assert.equal(track.title, "gone");
    assert.equal(track.artist, undefined);
    assert.equal(track.duration, undefined);
    assert.equal(track.metadataSource, undefined);
    assert.equal(track.cover, undefined);
  });
});
