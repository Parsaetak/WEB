/*
 * SITE NAVIGATION (v3.6) — the single source of truth for the
 * site-wide navigation labels and destinations.
 *
 * v3.6 orders the professional primary navigation as a clear
 * identity-first flow:
 *
 *   HOME · ABOUT · WORK · RESEARCH · BLOG · CONTACT
 *
 * identity → capability/work → research → writing → contact.
 * The public label for the writing archive is BLOG (the canonical
 * /blog/ URL and the internal blog article routes are unchanged).
 *
 * The six-scene world stays intact: the scene ids
 * (home / about / systems / magic / work / library) are internal
 * interaction states and are NOT renamed. The experimental
 * destinations — Systems, RED MAGIC, Library — remain secondary
 * "world" navigation, carried by the same unified renderer
 * (UnifiedSiteNav) on every surface — world HUD, blog header,
 * content-shell header, footer — with quieter styling instead of
 * numbered labels.
 *
 * Every surface renders from these two lists, so the navigation can
 * never drift between the world shell, the blog, the content
 * documents, and the footer.
 */

export type NavigationEntry = {
  /** Stable internal id — scene ids stay unchanged (v3.2 law). */
  id: string;
  /** Accessible name (spoken form). */
  label: string;
  /** Visible uppercase form (typography handles the casing). */
  shortLabel: string;
  /** Root-relative destination (basePath applied by the renderer). */
  href: string;
};

/*
 * PRIMARY NAVIGATION (v3.6) — professional destinations lead, in
 * the identity-first order: who (ABOUT) → what (WORK) → how it is
 * investigated (RESEARCH) → what is published (BLOG) → how to
 * reach me (CONTACT).
 * HOME is special-cased inside the world shell as a scene action
 * (in-shell transition); from every other surface it is a plain
 * link to "/". All other primary entries are real, indexable routes.
 */
export const PRIMARY_NAV: readonly NavigationEntry[] = [
  {
    id: "home",
    label: "Home",
    shortLabel: "HOME",
    href: "/"
  },
  {
    id: "about",
    label: "About",
    shortLabel: "ABOUT",
    href: "/about/"
  },
  {
    id: "work",
    label: "Selected Work",
    shortLabel: "WORK",
    href: "/work/"
  },
  {
    id: "research",
    label: "Research",
    shortLabel: "RESEARCH",
    href: "/research/"
  },
  {
    id: "blog",
    label: "Blog",
    shortLabel: "BLOG",
    href: "/blog/"
  },
  {
    id: "contact",
    label: "Contact",
    shortLabel: "CONTACT",
    href: "/contact/"
  }
];

/*
 * WORLD NAVIGATION (v3.2) — the experimental scenes, secondary and
 * contextual. These are interaction states of the world shell
 * ("#/systems", "#/magic", "#/library"), reachable from every
 * surface but visually quieter than the primary track.
 */
export const WORLD_NAV: readonly NavigationEntry[] = [
  {
    id: "systems",
    label: "Systems",
    shortLabel: "SYSTEMS",
    href: "/#systems"
  },
  {
    id: "magic",
    label: "RED Magic",
    shortLabel: "RED MAGIC",
    href: "/#magic"
  },
  {
    id: "library",
    label: "Library",
    shortLabel: "LIBRARY",
    href: "/#library"
  }
];
