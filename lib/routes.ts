/*
 * CANONICAL ROUTE REGISTRY — typed app-side loader (SEO v2).
 *
 * data/routes.json is the single source of truth for route identity on
 * WEB: every public route's path, kind, SEO metadata, sitemap policy,
 * structured-data expectations, navigation surfaces and hub
 * relationships are declared there — once.
 *
 * Consumers:
 * - scripts/build-blog.mjs   → derives the sitemap URL list
 * - scripts/verify-seo.mjs   → derives the verified route table and
 *                              the graph-depth thresholds
 * - lib/hubs.ts              → derives route metaTitle/metaDescription
 *                              and hub topic facts (this module)
 *
 * Before this registry existed, route facts were maintained in three
 * places (build-blog's STATIC_CONTENT_ROUTES, verify-seo's
 * CONTENT_ROUTES, lib/hubs' route definitions) and could drift; the
 * registry removes the duplication while keeping the same emitted
 * values. Articles are deliberately NOT listed in the registry — they
 * derive from content/blog/*.md through the blog pipeline.
 *
 * Server-side data module: no client component imports this file.
 */

import routesJson from "@/data/routes.json";

export type RouteKind =
  | "home"
  | "identity"
  | "collection"
  | "topic-hub"
  | "blog-index";

export type RegistryRoute = {
  /** Route path segment; "" for the home document. */
  path: string;

  kind: RouteKind;

  /** The page's own content-type vocabulary (profile, portfolio, …). */
  contentType: string;

  /** schema.org `about` concept name — topic hubs only. */
  topicName?: string;

  /** Full <title> — unique per route, ends with the site name. */
  title: string;

  /** Unique meta description / WebPage.description. */
  description: string;

  sitemap: {
    include: boolean;

    /**
     * Content-revision date, null (never invented), or the literal
     * "latest-article" (blog index — derived from the content index).
     */
    lastmod: string | null | "latest-article";
  };

  /** JSON-LD types expected on the route's exported document. */
  structuredData: string[];

  /** Navigation surfaces carrying this route (documentation + verifier). */
  nav: string[];

  /** Minimum inbound pages the SEO verifier requires. */
  inboundMinimum: number;
};

export type RouteRegistry = {
  site: {
    name: string;
    origin: string;
    basePath: string;
    basePathEnv: string;
    titleSuffix: string;
  };

  routes: RegistryRoute[];

  dynamicFamilies: {
    pathPattern: string;
    source: string;
    registry: string;
    kind: string;
    contentType: string[];
    titleSuffixFrom: string;
    sitemap: { include: boolean; lastmod: string };
    structuredData: string[];
    inboundMinimum: number;
  }[];

  scenes: {
    $comment: string;
    names: string[];
  };
};

/*
 * The JSON is authored once and validated by the SEO verifier; the
 * cast keeps the app-side shape strict without duplicating a schema.
 */
export const ROUTE_REGISTRY =
  routesJson as unknown as RouteRegistry;

/** Registry order is sitemap order: home is "" and handled separately. */
export const REGISTRY_ROUTES: RegistryRoute[] =
  ROUTE_REGISTRY.routes;

/** Look up a route's registry entry by path segment ("" = home). */
export function getRegistryRoute(
  path: string
): RegistryRoute | null {
  return (
    REGISTRY_ROUTES.find(
      (route) =>
        route.path === path
    ) ?? null
  );
}

/**
 * Route meta for the static content documents — the values
 * lib/hubs.ts renders into <title>/description/canonical metadata.
 * A missing registry entry throws at module init: a content route
 * without registry facts must fail the build, never ship thin.
 */
export function requireRouteMeta(
  path: string
): RegistryRoute {
  const route =
    getRegistryRoute(path);

  if (!route) {
    throw new Error(
      `Route "${path}" is missing from data/routes.json — every content route must be registered.`
    );
  }

  return route;
}

/**
 * Hub variant: like requireRouteMeta but additionally guarantees the
 * route is a topic hub carrying a topicName (the schema.org `about`
 * concept). Used by lib/hubs.ts for the six HUB_ROUTES entries.
 */
export function requireHubMeta(
  path: string
): RegistryRoute & {
  topicName: string;
} {
  const route =
    requireRouteMeta(path);

  if (
    route.kind !==
      "topic-hub" ||
    !route.topicName
  ) {
    throw new Error(
      `Route "${path}" must be registered as a topic hub with topicName in data/routes.json.`
    );
  }

  return route as RegistryRoute & {
    topicName: string;
  };
}

/** All topic-hub paths, registry order. */
export function getHubPaths(): string[] {
  return REGISTRY_ROUTES.filter(
    (route) =>
      route.kind === "topic-hub"
  ).map((route) => route.path);
}

/** World-shell scene names (interaction states, never documents). */
export function getSceneNames(): string[] {
  return ROUTE_REGISTRY.scenes.names;
}
