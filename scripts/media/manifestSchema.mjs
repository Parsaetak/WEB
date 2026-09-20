/*
 * manifestSchema.mjs — structural contract for data/media.json (v3).
 *
 * Shared by scripts/validate-media-manifest.mjs (the CI gate), the
 * sync writer, and the media test suite. Zero dependencies.
 *
 * Schema (version 3, the Media migration):
 *   {
 *     version: 3,
 *     updated: "YYYY-MM-DD",
 *     items: [
 *       {
 *         branch:  string  — Contents repository branch
 *         source:  string  — file path inside that branch
 *         title:   string
 *         type:    "book" | "music" | "video" | "art"
 *         ...optional descriptive fields (subtitle, description, year,
 *            language, author, series, volume, featured, status,
 *            readingTime, tags, cover)
 *         ...music-only fields (artist, album, albumArtist, year, genre,
 *            trackNumber, discNumber, composer, comment, duration,
 *            trackTotal, discTotal, metadataSource)
 *       }
 *     ]
 *   }
 *
 * The legacy type "audio" is NOT accepted here: the sync step
 * normalises it to "music" before the manifest is ever written.
 */

const CANONICAL_TYPES = new Set([
  "book",
  "music",
  "video",
  "art"
]);

const TYPE_EXTENSIONS = {
  book: new Set(["pdf"]),
  music: new Set(["mp3", "m4a", "flac"]),
  video: new Set(["mp4"]),
  art: new Set(["png", "jpg", "jpeg", "webp", "gif"])
};

const OPTIONAL_STRINGS = new Set([
  "subtitle",
  "description",
  "year",
  "language",
  "author",
  "series",
  "status",
  "readingTime",
  "cover",
  "artist",
  "album",
  "albumArtist",
  "genre",
  "composer",
  "comment"
]);

const OPTIONAL_NUMBERS = new Set([
  "volume",
  "trackNumber",
  "trackTotal",
  "discNumber",
  "discTotal",
  "duration"
]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

/**
 * Validate a parsed manifest object.
 * Returns an array of error strings (empty = valid).
 */
export function validateMediaManifest(manifest) {
  const errors = [];

  if (
    typeof manifest !== "object" ||
    manifest === null ||
    Array.isArray(manifest)
  ) {
    return ["manifest must be a JSON object"];
  }

  if (manifest.version !== 3) {
    errors.push(
      `manifest field \`version\` must be 3 (got ${JSON.stringify(manifest.version)})`
    );
  }

  if (!isNonEmptyString(manifest.updated)) {
    errors.push("manifest field `updated` must be a non-empty string");
  }

  if (!Array.isArray(manifest.items)) {
    errors.push("manifest field `items` must be an array");

    return errors;
  }

  manifest.items.forEach((item, index) => {
    const label = `items[${index}]`;

    if (
      typeof item !== "object" ||
      item === null ||
      Array.isArray(item)
    ) {
      errors.push(`${label} must be an object`);
      return;
    }

    for (const field of ["branch", "source", "title", "type"]) {
      if (!isNonEmptyString(item[field])) {
        errors.push(`${label} is missing a valid \`${field}\` string`);
      }
    }

    if (!CANONICAL_TYPES.has(item.type)) {
      if (item.type === "audio") {
        errors.push(
          `${label} uses legacy type \`audio\` — the sync step must normalise it to \`music\``
        );
      } else if (isNonEmptyString(item.type)) {
        errors.push(
          `${label} has unknown type ${JSON.stringify(item.type)} — expected one of book, music, video, art`
        );
      }

      return;
    }

    const extension = isNonEmptyString(item.source)
      ? item.source.split(".").pop()?.toLowerCase()
      : null;

    if (extension) {
      const allowed = TYPE_EXTENSIONS[item.type];

      if (allowed && !allowed.has(extension)) {
        errors.push(
          `${label} type \`${item.type}\` does not allow .${extension} sources (allowed: ${[...allowed].join(", ")})`
        );
      }
    }

    if (typeof item.featured !== "undefined" && typeof item.featured !== "boolean") {
      errors.push(`${label} field \`featured\` must be a boolean when present`);
    }

    if (Array.isArray(item.tags)) {
      if (
        item.tags.some((tag) => !isNonEmptyString(tag))
      ) {
        errors.push(`${label} field \`tags\` must contain non-empty strings`);
      }
    } else if (typeof item.tags !== "undefined") {
      errors.push(`${label} field \`tags\` must be an array when present`);
    }

    for (const [key, value] of Object.entries(item)) {
      if (OPTIONAL_STRINGS.has(key)) {
        if (value !== undefined && !isNonEmptyString(value)) {
          errors.push(`${label} field \`${key}\` must be a non-empty string`);
        }

        continue;
      }

      if (OPTIONAL_NUMBERS.has(key)) {
        if (
          value !== undefined &&
          (typeof value !== "number" || !Number.isFinite(value))
        ) {
          errors.push(`${label} field \`${key}\` must be a finite number`);
        }

        if (
          key === "duration" &&
          typeof value === "number" &&
          value < 0
        ) {
          errors.push(`${label} field \`duration\` must not be negative`);
        }

        continue;
      }

      if (
        key !== "branch" &&
        key !== "source" &&
        key !== "title" &&
        key !== "type" &&
        key !== "tags" &&
        key !== "featured" &&
        key !== "metadataSource"
      ) {
        errors.push(`${label} has unknown field \`${key}\``);
      }
    }

    if (
      typeof item.metadataSource !== "undefined" &&
      item.metadataSource !== "embedded" &&
      item.metadataSource !== "manifest"
    ) {
      errors.push(
        `${label} field \`metadataSource\` must be "embedded" or "manifest"`
      );
    }
  });

  return errors;
}
