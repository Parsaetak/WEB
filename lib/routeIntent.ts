/*
 * ROUTE INTENT RESOLUTION (v4.0.4) — the pure decision layer of the
 * unified route transition (GlobalRouteTransition).
 *
 * The site has TWO navigation systems with ONE visual language:
 * - hash scenes (/#systems, /#magic, /#media) are interaction states
 *   of the world shell, owned by the scene loading system;
 * - real document routes (/about/, /blog/…) are App Router
 *   navigations, owned by the route transition host.
 *
 * This module decides which clicks belong to WHICH system, so the
 * host never fires for: external links, downloads, mailto/tel,
 * same-route clicks, or hash-scene navigation — and never fights the
 * scene state machine. It is deliberately pure (no DOM, no window)
 * so the exclusion matrix is unit-testable without a browser.
 *
 * The host layers DOM-only guards on top (primary button, modifier
 * keys for new-tab behavior, target="_blank", download attribute)
 * before consulting this module.
 */

/**
 * Normalize a route path for comparison: "/" stays "/", trailing
 * slashes collapse ("/about/" → "/about"). basePath-free paths only.
 */
export function normalizeRoutePath(
  pathname: string
): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  const trimmed = pathname.replace(/\/+$/, "");

  return trimmed === "" ? "/" : trimmed;
}

/**
 * Strip the deployment basePath ("/WEB" in production) from a URL
 * pathname, exactly mirroring next.config.ts / app/layout.tsx. Links
 * inside the exported HTML carry the basePath; usePathname() does
 * not — this makes the two comparable.
 */
export function stripBasePath(
  pathname: string,
  basePath: string
): string {
  if (basePath === "") {
    return pathname;
  }

  if (pathname === basePath) {
    return "/";
  }

  if (pathname.startsWith(`${basePath}/`)) {
    return pathname.slice(basePath.length) || "/";
  }

  return pathname;
}

export type NavigationInput = {
  /**
   * The anchor's raw href attribute (null when the attribute is
   * missing entirely).
   */
  href: string | null;
  /**
   * The CURRENT route from usePathname() — basePath-free.
   */
  currentPathname: string;
  /** Deployment basePath ("" locally, "/WEB" in CI). */
  basePath: string;
  /**
   * window.location.origin. Pass null in non-browser tests to skip
   * the same-origin check.
   */
  origin: string | null;
};

/**
 * Resolve a clicked anchor into a trackable internal navigation.
 *
 * Returns the normalized, basePath-free DESTINATION route path
 * (e.g. "/", "/about/") when the click is a real route change the
 * transition host should track, or null when the click belongs to
 * something else:
 *
 * - null href / empty href
 * - in-page fragments and scene hashes ("#magic", "#top") — and any
 *   href whose PATH equals the current route (hash-only or
 *   query-only view-state navigation on the same document)
 * - non-http(s) schemes: mailto:, tel:, javascript:
 * - cross-origin URLs (external links)
 *
 * Relative hrefs resolve against `origin`; anchors always render
 * absolute or root-relative hrefs in this app, but the resolution is
 * defensive by construction.
 */
export function resolveNavigationDestination({
  href,
  currentPathname,
  basePath,
  origin
}: NavigationInput): string | null {
  if (!href) {
    return null;
  }

  const trimmed = href.trim();

  if (trimmed === "") {
    return null;
  }

  /* In-page fragment or scene hash — never a route change. */
  if (trimmed.startsWith("#")) {
    return null;
  }

  /*
   * Non-http(s) schemes are not App Router navigations (mailto:, tel:,
   * javascript:, data:…). Relative and root-relative hrefs carry no
   * scheme and fall through to URL resolution below.
   */
  const scheme = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(trimmed);

  if (scheme && scheme[1].toLowerCase() !== "http" && scheme[1].toLowerCase() !== "https") {
    return null;
  }

  let url: URL;

  try {
    url = new URL(trimmed, origin ?? "http://route-intent.invalid");
  } catch {
    return null;
  }

  /* External destination — the transition host never tracks it. */
  if (origin && url.origin !== origin) {
    return null;
  }

  const destination = normalizeRoutePath(
    stripBasePath(url.pathname, basePath)
  );

  const current = normalizeRoutePath(currentPathname);

  /*
   * Same-route click: hash-scene navigation on the world shell,
   * blog filter view state, or a redundant tab click — the scene
   * system / view owns it, no route transition exists.
   */
  if (destination === current) {
    return null;
  }

  return destination;
}

/**
 * A short human-readable destination label for the loading surface's
 * announcement and meta row ("/" → "HOME", "/about/" → "ABOUT",
 * "/blog/<slug>/" → "ARTICLE", "/local-ai/" → "LOCAL AI").
 */
export function routeLabel(destination: string): string {
  const segments = destination
    .split("/")
    .filter((segment) => segment !== "");

  if (segments.length === 0) {
    return "HOME";
  }

  if (segments[0] === "blog" && segments.length > 1) {
    return "ARTICLE";
  }

  return segments[segments.length - 1]
    .replace(/-/g, " ")
    .toUpperCase();
}
