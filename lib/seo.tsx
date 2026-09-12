import { PUBLIC_LINKS } from "@/lib/links";

/*
 * SITE IDENTITY + STRUCTURED DATA — SERVER SIDE.
 *
 * One coherent entity model for the whole site. Every JSON-LD object
 * on every page resolves its author/publisher references back to the
 * @id values defined here, so the site never emits two conflicting
 * WebSite or Person objects.
 *
 * Laws (see worklog.md — SEO Architecture):
 * - Production URL is the ONLY canonical base: absolute, HTTPS,
 *   stable, /WEB-aware. No localhost, no repository URLs, no
 *   alternate hosts ever appear in metadata or structured data.
 * - sameAs contains ONLY real public profile URLs that the site
 *   already links through lib/links.ts. Nothing invented.
 * - Every structured-data object must describe something that
 *   actually exists on the page it is emitted into.
 *
 * This module imports no generated content and stays server-side:
 * it is consumed by app/ layouts and pages only.
 */

export const SITE_URL =
  "https://parsaetak.github.io/WEB";

export const SITE_NAME =
  "Parsa Tak";

/*
 * The person behind the site. One name, shared by metadata authors,
 * publisher entities, and BlogPosting author objects so identity is
 * spelled identically everywhere.
 */
export const PERSON_NAME = "Parsa Tak";

export const SITE_DESCRIPTION =
  "An evolving laboratory for AI systems, reasoning architecture, software engineering, and creative technology — home of SHEYTAN, UHIT, FreeIran, and RED MAGIC.";

export const SITE_IN_LANGUAGE = "en";

/*
 * Home route title. One wording, shared by <title>, og:title, and
 * the WebPage structured data, so every representation of the home
 * route names it identically. "Software" joined the capability set
 * in v2.7: the hero, the capabilities grid, and the featured
 * projects all visibly present software engineering work.
 */
export const HOME_TITLE =
  "Parsa Tak — AI Systems, Reasoning, Software & RED MAGIC";

/*
 * Stable @id anchors. Referenced from structured data emitted on
 * other routes (blog index, article pages) so all graphs interlock
 * into one site-wide entity model.
 */
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const PERSON_ID = `${SITE_URL}/#person`;

/*
 * Site-level Open Graph image (1200×630 PNG, committed at
 * public/og-default.png). Existence is validated by the build
 * pipeline. Root-relative on purpose: Next resolves metadata URLs
 * against metadataBase, which already carries /WEB.
 */
export const SITE_OG_IMAGE_PATH = "/og-default.png";

export const SITE_OG_IMAGE_WIDTH = 1200;
export const SITE_OG_IMAGE_HEIGHT = 630;

/*
 * Public profile URLs that legitimately identify "Parsa Tak" on
 * external services. Selected by id from lib/links.ts (the site's
 * link source of truth) so this list can never drift from what the
 * site actually publishes. Contact channels (email, WhatsApp,
 * PayPal, Discord invites) are deliberately excluded — sameAs is
 * for identity profiles, not contact endpoints.
 */
const PROFILE_LINK_IDS: ReadonlySet<string> = new Set([
  "github",
  "x",
  "linkedin",
  "instagram",
  "youtube",
  "tiktok",
  "telegram-channel",
  "pinterest",
  "linktree"
]);

const PROFILE_URLS: readonly string[] = [
  ...PUBLIC_LINKS.social,
  ...PUBLIC_LINKS.resources,
  ...PUBLIC_LINKS.meta
]
  .filter((link) => PROFILE_LINK_IDS.has(link.id))
  .map((link) => link.href);

/*
 * Person entity — the author/creator identity of the site.
 * No image field: the site publishes a brand mark, not a photo,
 * and structured data must stay truthful.
 *
 * Identity terms (AI Instructions, REP, USEF, SHEYTAN, RED MAGIC)
 * each appear exactly once and correspond to real marks the site
 * owner claims in TRADEMARKS.md and to work actually presented on
 * this site. Nothing here is a keyword list.
 */
export function personEntity() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Parsa Tak",
    url: `${SITE_URL}/`,
    description:
      "Architect of the AI Instructions, REP, and USEF framework family, the SHEYTAN local-agent experiments, and the RED MAGIC interface experiments.",
    sameAs: PROFILE_URLS
  };
}

/*
 * WebSite entity — the site itself. Emitted exactly once, in the
 * root layout, so every page shares the same site identity object.
 */
export function websiteEntity() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: SITE_IN_LANGUAGE,
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID }
  };
}

/*
 * WebPage entity for the home route (the world shell). The home
 * page is a single canonical document — the six hash scenes are an
 * interaction architecture inside it, not separate SEO documents.
 * Since v2.7 the home scene is server-rendered, so the entity
 * carries the same description the page visibly leads with, and
 * names the featured projects the page actually presents.
 */
export function homeWebPageEntity() {
  return {
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    url: `${SITE_URL}/`,
    name: HOME_TITLE,
    description:
      "Parsa Tak — researcher, builder, programmer, writer, and artist working on AI systems, reasoning frameworks, local AI agents, software engineering, and creative technology. Featured systems: SHEYTAN Local Agent, UHIT, FreeIran, and RED MAGIC.",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
    inLanguage: SITE_IN_LANGUAGE
  };
}

/*
 * JSON-LD script component — the single emission point for
 * structured data across the site. Serialised at build time into
 * static HTML; no client JavaScript involved.
 */
export function JsonLd({
  data
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
}
