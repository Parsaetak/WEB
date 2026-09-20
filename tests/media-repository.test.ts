/*
 * tests/media-repository.test.ts — the app-side Media model
 * (lib/media/normalize.ts): discriminated MediaItem derivation,
 * category mapping, filter grouping, and the Library → Media labels.
 */

import { describe, it } from "node:test";

import assert from "node:assert/strict";

import {
  createGitHubUrl,
  createMediaUrl,
  encodePath,
  getActionLabel,
  getCatalogLabel,
  getCategoryForKind,
  getDownloadLabel,
  getMediaFilterForItem,
  getMediaKind,
  getPreviewGlyph,
  MEDIA_FILTERS,
  normalizeCategory,
  normalizeManifestItems,
  normalizeMediaItem,
  type MediaManifest
} from "../lib/media/normalize";

const BOOK = {
  branch: "Books",
  source: "RED MAGIC.pdf",
  title: "RED MAGIC",
  type: "book",
  featured: true,
  tags: ["RED MAGIC"]
};

const TRACK = {
  branch: "Music",
  source: "Album/01 Song.mp3",
  title: "01 Song",
  type: "music",
  artist: "Parsa Tak",
  album: "Laboratory",
  duration: 12.5,
  metadataSource: "embedded" as const
};

describe("manifest → MediaItem normalization", () => {
  it("derives the discriminated categories", () => {
    const items = normalizeManifestItems({
      version: 3,
      updated: "2026-08-26",
      items: [
        BOOK,
        TRACK,
        { branch: "Video", source: "clip.mp4", title: "clip", type: "video" },
        { branch: "Art", source: "piece.png", title: "piece", type: "art" }
      ]
    });

    assert.deepEqual(
      items.map((item) => item.category),
      ["book", "music", "video", "art"]
    );

    assert.equal(items[0]!.kind, "pdf");
    assert.equal(items[1]!.kind, "mp3");
    assert.equal(items[2]!.kind, "mp4");
    assert.equal(items[3]!.kind, "png");
  });

  it("accepts the legacy audio type as music (compatibility alias)", () => {
    const item = normalizeMediaItem({
      branch: "Books",
      source: "x.mp3",
      title: "x",
      type: "audio"
    });

    assert.ok(item);
    assert.equal(item!.category, "music");
  });

  it("rejects type/extension contradictions (validator guarantees this upstream)", () => {
    assert.equal(
      normalizeMediaItem({
        branch: "Books",
        source: "book.pdf",
        title: "book",
        type: "music"
      }),
      null
    );

    assert.equal(
      normalizeMediaItem({
        branch: "Music",
        source: "song.wav",
        title: "song",
        type: "music"
      }),
      null
    );
  });

  it("builds CDN + provenance URLs and cover URLs", () => {
    const item = normalizeMediaItem(TRACK) ;

    assert.ok(item);

    assert.equal(item.id, "Music:Album/01 Song.mp3");
    assert.equal(
      item.rawUrl,
      "https://cdn.jsdelivr.net/gh/Parsaetak/Contents@Music/Album/01%20Song.mp3"
    );
    assert.equal(
      item.githubUrl,
      "https://github.com/Parsaetak/Contents/blob/Music/Album/01%20Song.mp3"
    );

    const withCover = normalizeMediaItem({
      ...TRACK,
      cover: "Album/01 Song.jpeg"
    });

    assert.equal(
      withCover!.coverUrl,
      "https://cdn.jsdelivr.net/gh/Parsaetak/Contents@Music/Album/01%20Song.jpeg"
    );
  });

  it("carries the Music track contract (embedded metadata only)", () => {
    const item = normalizeMediaItem(TRACK);

    assert.ok(item);
    assert.equal(item!.category, "music");

    if (item!.category !== "music") {
      return;
    }

    const track = item!.track;

    assert.equal(track.title, "01 Song");
    assert.equal(track.artist, "Parsa Tak");
    assert.equal(track.album, "Laboratory");
    assert.equal(track.duration, 12.5);
    assert.equal(track.source, "embedded");

    /* No invented fields: */
    assert.equal(track.genre, undefined);
    assert.equal(track.composer, undefined);
  });

  it("filters the whole manifest without crashing on partial corruption", () => {
    const items = normalizeManifestItems({
      version: 3,
      updated: "2026-08-26",
      items: [
        BOOK,
        { branch: "", source: "x.pdf", title: "broken", type: "book" },
        { branch: "Music", source: "y.txt", title: "broken", type: "music" }
      ] as never[]
    });

    assert.equal(items.length, 1);
    assert.equal(items[0]!.title, "RED MAGIC");
  });
});

describe("filters and labels (Media vocabulary)", () => {
  it("orders the MEDIA filter group exactly as specified", () => {
    assert.deepEqual(
      MEDIA_FILTERS.map((filter) => filter.label),
      ["ALL", "MUSIC", "BOOKS", "VIDEO", "ART"]
    );
  });

  it("groups items deterministically", () => {
    const items = normalizeManifestItems({
      version: 3,
      updated: "2026-08-26",
      items: [BOOK, TRACK]
    });

    assert.equal(getMediaFilterForItem(items[0]!), "book");
    assert.equal(getMediaFilterForItem(items[1]!), "music");
  });

  it("labels categories and actions without Library-era vocabulary", () => {
    const items = normalizeManifestItems({
      version: 3,
      updated: "2026-08-26",
      items: [
        BOOK,
        TRACK,
        { branch: "Video", source: "clip.mp4", title: "clip", type: "video" },
        { branch: "Art", source: "piece.png", title: "piece", type: "art" }
      ]
    });

    const labels = items.map((item) => getCatalogLabel(item));

    assert.deepEqual(labels, ["BOOK", "MUSIC", "VIDEO", "IMAGE"]);

    const actions = items.map((item) => getActionLabel(item));

    assert.deepEqual(actions, ["READ", "LISTEN", "WATCH", "VIEW"]);

    const glyphs = items.map((item) => getPreviewGlyph(item));

    assert.deepEqual(glyphs, ["BOOK", "MUSIC", "VIDEO", "IMAGE"]);

    const downloads = items.map((item) => getDownloadLabel(item));

    assert.deepEqual(downloads, [
      "DOWNLOAD PDF",
      "DOWNLOAD MP3",
      "DOWNLOAD VIDEO",
      "DOWNLOAD IMAGE"
    ]);
  });
});

describe("category/kind primitives", () => {
  it("maps kinds to categories", () => {
    assert.equal(getCategoryForKind("m4a"), "music");
    assert.equal(getCategoryForKind("flac"), "music");
    assert.equal(getCategoryForKind("jpeg"), "art");
  });

  it("resolves kinds case-insensitively", () => {
    assert.equal(getMediaKind("Song.FLAC"), "flac");
    assert.equal(getMediaKind("book.PDF"), "pdf");
    assert.equal(getMediaKind("nope.exe"), null);
  });

  it("normalizes category types strictly", () => {
    assert.equal(normalizeCategory("music"), "music");
    assert.equal(normalizeCategory("audio"), "music");
    assert.equal(normalizeCategory("pamphlet"), null);
  });

  it("encodes every path segment", () => {
    assert.equal(encodePath("a b/c d.png"), "a%20b/c%20d.png");
  });

  it("builds URLs for covers and tracks from branch + path", () => {
    assert.equal(
      createMediaUrl("Music", "A B/Song.mp3"),
      "https://cdn.jsdelivr.net/gh/Parsaetak/Contents@Music/A%20B/Song.mp3"
    );

    assert.equal(
      createGitHubUrl("Books", "RED MAGIC.pdf"),
      "https://github.com/Parsaetak/Contents/blob/Books/RED%20MAGIC.pdf"
    );
  });
});

describe("manifest typing sanity", () => {
  it("treats the shipped manifest shape as a MediaManifest", () => {
    const manifest: MediaManifest = {
      version: 3,
      updated: "2026-08-26",
      items: [BOOK]
    };

    assert.equal(manifest.items.length, 1);
  });
});
