/*
 * BLOG SHARED LAYER — safe for client bundles.
 *
 * This module is the ONLY blog module that client components may
 * import. It contains types and pure formatting helpers and imports
 * no generated content data, so nothing from data/blog/posts.json can
 * leak into a client bundle through it.
 *
 * Boundary law (see worklog.md — Blog Data Access):
 * - lib/blog.ts      server-side data access (imports posts.json)
 * - lib/blogFormat.ts  types + formatters (zero data, client-safe)
 *
 * Client components receive article metadata as serialized props from
 * server components; they never import the content file themselves.
 */

export type BlogPostCover = {
  src: string;
  alt: string;
  width: number;
  height: number;

  /*
   * Social-image twin for og:image / twitter:image (a PNG at the
   * same path as the SVG cover). ROOT-RELATIVE and never
   * basePath-prefixed: it is metadata-only, resolved against the
   * production metadataBase. Optional for backward compatibility
   * with older generated data.
   */
  ogSrc?: string;
};

export type BlogPostMeta = {
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  description: string;
  date: string;
  updated: string | null;
  author: string;
  category: string;
  tags: string[];

  /*
   * Optional relationship metadata (v2.5): the project/system the
   * article belongs to and the editorial topics it covers. Both feed
   * the deterministic related-content model at build time; they are
   * also available to the UI for context.
   */
  project: string | null;
  topics: string[];
  readingMinutes: number;
  readingTime: string;
  featured: boolean;
  cover: BlogPostCover | null;
  wordCount: number;

  /*
   * Precomputed at build time: every searchable field joined and
   * lowercased, so client-side search never re-derives the haystack
   * per keystroke. Present in generated data from v2.1 onward.
   */
  search?: string;
};

/*
 * One entry of the build-time related-content index (v2.5). `explicit`
 * entries are author-declared relationships from frontmatter (their
 * score is null — the author's ordering is the authority); scored
 * entries come from the deterministic signal model.
 *
 * `shared` (v2.5.5) carries the strongest concrete overlap signals
 * behind a scored entry (project / tags / topics / significant terms,
 * in that authority order, capped at 3 at build time) so the page can
 * show WHY the match happened. Explicit entries carry an empty array.
 */
export type RelatedPostEntry = {
  slug: string;
  score: number | null;
  explicit: boolean;
  shared?: readonly string[];
};

export type BlogPost = BlogPostMeta & {
  html: string;
  headings: { id: string; text: string; level: number }[];
};

/*
 * Format an ISO date (YYYY-MM-DD) for display without depending on
 * the runtime locale — deterministic static output.
 */
export function formatBlogDate(
  isoDate: string
): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const match = isoDate.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!match) {
    return isoDate;
  }

  const [, year, month, day] = match;

  return `${months[Number(month) - 1]} ${Number(day)}, ${year}`;
}

/*
 * Compact variant for card meta rows.
 */
export function formatBlogDateShort(
  isoDate: string
): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];

  const match = isoDate.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!match) {
    return isoDate;
  }

  const [, year, month, day] = match;

  return `${months[Number(month) - 1]} ${Number(day)}, ${year}`;
}
