/*
 * SITE NAVIGATION (v3.2) — the single source of truth for the
 * site-wide navigation labels and destinations.
 *
 * v3.2 replaces the numbered HUD navigation (01 HOME … 06 LIBRARY)
 * with a professional primary navigation:
 *
 *   HOME · WORK · RESEARCH · WRITING · ABOUT · CONTACT
 *
 * The six-scene world stays intact: the scene ids
 * (home / about / systems / magic / work / library) are internal
 * interaction states and are NOT renamed. The experimental
 * destinations — Systems, RED MAGIC, Library — become secondary
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
 * PRIMARY NAVIGATION (v3.2) — professional destinations lead.
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
    id: "writing",
    label: "Writing",
    shortLabel: "WRITING",
    href: "/blog/"
  },
  {
    id: "about",
    label: "About",
    shortLabel: "ABOUT",
    href: "/about/"
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
