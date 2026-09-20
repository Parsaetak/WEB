/*
 * tests/v404-polish.test.ts — the v4.0.4 polish contract, pinned at
 * the source level:
 *
 * 1. WHATSAPP-FREE REPOSITORY — the contact channel was removed in
 *    v4.0.4; a repository-wide scan fails on any remnant (the
 *    exported-artifact side of this ban lives in verify-seo.mjs).
 * 2. SHARED HERO IDENTITY — About and Contact (and every
 *    ContentShell document) carry ONE shared hero signal mechanism;
 *    no page-specific animation components may exist.
 * 3. FOOTER GRID CONTRACT — the four footer navigation rows share
 *    one deterministic heading column and one link-start position;
 *    the legal block shares the footer rail; the footer never opts
 *    into a route-scoped reveal system (the v4.0.3 visibility bug).
 * 4. ROUTE TRANSITION — one unified route-loading architecture:
 *    pure intent resolution (exclusion matrix), a race-safe host,
 *    honest timing constants, and a non-blocking accessible surface.
 */

import { describe, it } from "node:test";

import assert from "node:assert/strict";

import { readFile, readdir } from "node:fs/promises";

import path from "node:path";

import { fileURLToPath } from "node:url";

import {
  normalizeRoutePath,
  resolveNavigationDestination,
  routeLabel,
  stripBasePath
} from "../lib/routeIntent";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

async function readText(relative: string): Promise<string> {
  return readFile(path.join(ROOT, relative), "utf8");
}

/* ------------------------------------------------------------------ */
/* 1. WhatsApp-free repository                                         */
/* ------------------------------------------------------------------ */

const WHATSAPP_PATTERN = /whatsapp|wa\.me/i;

/*
 * The files below IMPLEMENT or DOCUMENT the WhatsApp ban — their
 * occurrences are the only legitimate ones in the tree: this test and
 * the two export-level verifiers carry the detection patterns, and
 * the three top-level docs record the removal factually in their
 * changelogs. Everything else (code, data, content, fixtures) must be
 * absolutely free of the channel.
 */
const CHECKER_FILES = new Set([
  path.join("tests", "v404-polish.test.ts"),
  path.join("scripts", "verify-seo.mjs"),
  path.join("scripts", "verify-loading.mjs"),
  path.join("README.md"),
  path.join("ROADMAP.md"),
  path.join("AGENTS.md")
]);

const SCANNABLE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".mjs",
  ".js",
  ".json",
  ".md",
  ".css",
  ".scss",
  ".html",
  ".yml",
  ".yaml",
  ".sh",
  ".py",
  ".svg",
  ".xml",
  ".txt"
]);

const SKIPPED_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "out"
]);

async function collectSourceFiles(dir: string, base = dir): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });

  const files: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (SKIPPED_DIRS.has(entry.name)) {
        continue;
      }

      files.push(...(await collectSourceFiles(full, base)));
    } else if (SCANNABLE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(full);
    }
  }

  return files;
}

describe("the repository is WhatsApp-free (removed in v4.0.4)", () => {
  it("no source, doc, data, or generated-data file contains a WhatsApp reference", async () => {
    const files = await collectSourceFiles(ROOT);

    const offenders: string[] = [];

    for (const file of files) {
      const relative = path.relative(ROOT, file);

      if (CHECKER_FILES.has(relative)) {
        continue;
      }

      const content = await readFile(file, "utf8");

      if (WHATSAPP_PATTERN.test(content)) {
        offenders.push(relative);
      }
    }

    assert.deepEqual(
      offenders,
      [],
      `WhatsApp remnants found (the channel was removed in v4.0.4): ${offenders.join(", ")}`
    );
  });

  it("the public-link registry carries no whatsapp icon type, entry, or icon implementation", async () => {
    const links = await readText("lib/links.ts");
    const publicLinks = await readText("components/PublicLinks.tsx");

    assert.doesNotMatch(links, /whatsapp/);
    assert.doesNotMatch(publicLinks, /whatsapp/);

    /*
     * Type-level proof: the icon union no longer admits the removed
     * channel, so a reintroduced entry fails the typecheck too.
     */
    assert.match(links, /export type PublicLinkIcon/);
    assert.doesNotMatch(links, /"whatsapp"/);
  });

  it("the public network totals 14 verified links (7 + 7 footer rows)", async () => {
    const footerLinks = await readText("components/FooterLinks.tsx");

    assert.match(footerLinks, /slice\(\s*0,\s*7\s*\)/);
    assert.match(footerLinks, /slice\(\s*7,\s*14\s*\)/);
  });

  it("the remaining contact architecture keeps its verified channels", async () => {
    const links = await readText("lib/links.ts");

    for (const channel of ['id: "email"', 'id: "github"', 'id: "linkedin"']) {
      assert.ok(
        links.includes(channel),
        `the verified contact channel ${channel} must remain`
      );
    }
  });
});

/* ------------------------------------------------------------------ */
/* 2. Shared hero identity animation                                   */
/* ------------------------------------------------------------------ */

describe("About and Contact share the hero identity animation", () => {
  it("the shared ContentShell renders the hero signal for every document", async () => {
    const shell = await readText("components/content/ContentShell.tsx");

    assert.match(shell, /styles\.heroSignal/);
    assert.match(shell, /styles\.heroSignalRing/);
    assert.match(shell, /styles\.heroSignalCore/);

    assert.equal(
      (shell.match(/styles\.heroSignal\b/g) ?? []).length >= 1,
      true,
      "the signal markup is declared once, inside the shared shell"
    );
  });

  it("no page-specific hero animation components exist", async () => {
    for (const banned of [
      "components/AboutAnimation.tsx",
      "components/ContactAnimation.tsx",
      "components/content/AboutAnimation.tsx",
      "components/content/ContactAnimation.tsx"
    ]) {
      await assert.rejects(
        () => readText(banned),
        /ENOENT/,
        `${banned} must not exist — the signal is one shared mechanism`
      );
    }

    const about = await readText("app/about/page.tsx");
    const contact = await readText("app/contact/page.tsx");

    for (const page of [about, contact]) {
      assert.doesNotMatch(
        page,
        /Animation|heroSignal|heroField/,
        "documents compose the shared shell; they never implement hero animation themselves"
      );
    }
  });

  it("the signal animates compositor-only (transform/opacity) and rests under reduced motion", async () => {
    const css = await readText("components/content/content.module.css");

    /* The orbit keyframes touch transform ONLY; the breathe, opacity ONLY. */
    const orbitBlock = css.match(
      /@keyframes\s+heroSignalOrbit\s*\{([\s\S]*?)\}/
    );

    assert.ok(orbitBlock, "the orbit keyframes exist");
    assert.match(orbitBlock[1], /rotate/);
    assert.ok(
      !/width|height|top|left|margin|padding/.test(orbitBlock[1]),
      "orbit is transform-only"
    );

    const breatheBlock = css.match(
      /@keyframes\s+heroSignalBreathe\s*\{[\s\S]*?\{[\s\S]*?\}[\s\S]*?\{[\s\S]*?\}\s*\}/
    );

    assert.ok(breatheBlock, "the breathe keyframes exist");
    assert.match(breatheBlock[0], /opacity/);

    /* Reduced motion: the arc collapses to a static ring. */
    const reduced = css.slice(css.indexOf("prefers-reduced-motion: reduce"));
    assert.match(
      reduced.slice(0, reduced.indexOf("}") + 4000),
      /heroSignal::after/,
      "the reduced-motion block restyles the hero signal"
    );
  });

  it("the signal is positioned by the shared rail contract, not text-overlapping hacks", async () => {
    const css = await readText("components/content/content.module.css");

    const signalBlock = css.slice(
      css.indexOf(".heroSignal {"),
      css.indexOf(".heroSignalRing")
    );

    assert.match(signalBlock, /position: absolute/, "zero layout impact");
    assert.match(signalBlock, /bottom: calc\(100% \+ 8px\)/, "anchored above the title block");
    assert.match(signalBlock, /pointer-events: none/, "never intercepts interaction");
    assert.match(signalBlock, /--page-accent/, "carries the per-tab accent identity");
  });
});

/* ------------------------------------------------------------------ */
/* 3. Footer grid contract                                             */
/* ------------------------------------------------------------------ */

describe("the footer shares one alignment grid", () => {
  it("the four navigation rows use a fixed shared heading column", async () => {
    const css = await readText("components/SiteDocNav.module.css");

    assert.match(
      css,
      /--docnav-heading-width:\s*\d+px/,
      "one shared heading width token exists"
    );

    const rowBlock = css.slice(css.indexOf(".row {"), css.indexOf(".heading {"));

    assert.match(
      rowBlock,
      /grid-template-columns:\s*var\(--docnav-heading-width\)\s*minmax\(0, 1fr\)/,
      "every row resolves to the SAME two-column grid: fixed heading, flexible links"
    );

    const headingBlock = css.slice(
      css.indexOf(".heading {"),
      css.indexOf(".list {")
    );

    assert.doesNotMatch(
      headingBlock,
      /min-width/,
      "the variable-width heading hack is gone — the column owns the width"
    );
  });

  it("the row markup renders heading + list as the two grid children", async () => {
    const nav = await readText("components/SiteDocNav.tsx");

    assert.match(nav, /className=\{styles\.row\}/);
    assert.match(nav, /className=\{styles\.heading\}/);
    assert.match(nav, /className=\{styles\.list\}/);

    const rows = ["Site", "Collections", "World", "Topics"];

    for (const heading of rows) {
      assert.match(
        nav,
        new RegExp(`heading="${heading}"`),
        `the ${heading} row exists`
      );
    }
  });

  it("the legal block shares the footer rail and baseline contract", async () => {
    const css = await readText("components/LivingShell.module.css");

    const bottomBlock = css.slice(
      css.indexOf(".livingShellLegalBottom {"),
      css.indexOf(".livingShellLegalLinks {")
    );

    assert.match(bottomBlock, /grid-template-columns/, "one grid contract");
    assert.match(bottomBlock, /align-items: end/);

    const linkAnchorBlock = css.slice(
      css.indexOf(".livingShellLegalLinks a {"),
      css.indexOf(".livingShellLegalLinks a:hover")
    );

    assert.match(
      linkAnchorBlock,
      /line-height: 1\.7/,
      "the links share the paragraph's line box — one baseline, no pixel offsets"
    );
  });

  it("the footer is site chrome and never opts into a route-scoped reveal system", async () => {
    const footer = await readText("components/SiteFooter.tsx");

    assert.doesNotMatch(
      footer,
      /data-reveal=/,
      "reveal controllers mount only on the world shell and blog — an opt-in here hides the footer on every content route (the v4.0.3 bug)"
    );
  });
});

/* ------------------------------------------------------------------ */
/* 4. Unified route transition                                         */
/* ------------------------------------------------------------------ */

describe("route intent resolution excludes everything that is not a route navigation", () => {
  const local = { basePath: "", origin: null };

  it("tracks internal route changes (root-relative, trailing-slash agnostic)", () => {
    assert.equal(
      resolveNavigationDestination({
        href: "/about/",
        currentPathname: "/",
        ...local
      }),
      "/about"
    );

    assert.equal(
      resolveNavigationDestination({
        href: "/",
        currentPathname: "/about",
        ...local
      }),
      "/"
    );

    assert.equal(
      resolveNavigationDestination({
        href: "/blog/some-article/",
        currentPathname: "/work",
        ...local
      }),
      "/blog/some-article"
    );
  });

  it("ignores external links", () => {
    assert.equal(
      resolveNavigationDestination({
        href: "https://github.com/Parsaetak",
        currentPathname: "/",
        basePath: "",
        origin: "https://parsaetak.github.io"
      }),
      null
    );
  });

  it("ignores mailto, tel, and other non-http schemes", () => {
    for (const href of [
      "mailto:Parsaetak@gmail.com",
      "tel:+1234567890",
      "javascript:void(0)",
      "data:text/plain,hi"
    ]) {
      assert.equal(
        resolveNavigationDestination({ href, currentPathname: "/", ...local }),
        null,
        `${href} must never track`
      );
    }
  });

  it("ignores in-page fragments and hash-scene navigation", () => {
    for (const href of ["#top", "#magic", "#library"]) {
      assert.equal(
        resolveNavigationDestination({ href, currentPathname: "/", ...local }),
        null
      );
    }
  });

  it("ignores same-route clicks (hash scenes and view state belong to their owners)", () => {
    assert.equal(
      resolveNavigationDestination({
        href: "/#systems",
        currentPathname: "/",
        ...local
      }),
      null,
      "a scene hash on the world shell is scene-system territory"
    );

    assert.equal(
      resolveNavigationDestination({
        href: "/blog/",
        currentPathname: "/blog",
        ...local
      }),
      null,
      "a same-document click is not a route change"
    );
  });

  it("strips the deployment basePath before comparing routes", () => {
    assert.equal(stripBasePath("/WEB/about/", "/WEB"), "/about/");
    assert.equal(stripBasePath("/WEB", "/WEB"), "/");
    assert.equal(stripBasePath("/about/", ""), "/about/");

    assert.equal(
      resolveNavigationDestination({
        href: "/WEB/about/",
        currentPathname: "/",
        basePath: "/WEB",
        origin: null
      }),
      "/about"
    );
  });

  it("normalizes trailing slashes and labels destinations", () => {
    assert.equal(normalizeRoutePath("/about/"), "/about");
    assert.equal(normalizeRoutePath("/"), "/");
    assert.equal(normalizeRoutePath(""), "/");

    assert.equal(routeLabel("/"), "HOME");
    assert.equal(routeLabel("/about"), "ABOUT");
    assert.equal(routeLabel("/local-ai"), "LOCAL AI");
    assert.equal(routeLabel("/blog/some-article"), "ARTICLE");
  });
});

describe("one race-safe route-transition host, mounted once", () => {
  it("the root layout mounts GlobalRouteTransition exactly once", async () => {
    const layout = await readText("app/layout.tsx");

    assert.match(layout, /GlobalRouteTransition/);
    assert.equal(
      (layout.match(/<GlobalRouteTransition \/>/g) ?? []).length,
      1,
      "exactly ONE route-transition host mount site-wide"
    );
  });

  it("the host is a client island that never blocks navigation", async () => {
    const host = await readText("components/GlobalRouteTransition.tsx");

    assert.match(host, /"use client"/);
    assert.doesNotMatch(
      host,
      /\.preventDefault\(/,
      "the click listener is observational — navigation always proceeds"
    );
    assert.match(
      host,
      /capture: true, passive: true/,
      "intent is captured at the document level without interfering"
    );
  });

  it("the DOM-level exclusion guards exist (modifiers, new-tab, downloads)", async () => {
    const host = await readText("components/GlobalRouteTransition.tsx");

    for (const guard of [
      "event.metaKey",
      "event.ctrlKey",
      "event.shiftKey",
      "event.altKey",
      "event.button !== 0",
      "anchor.hasAttribute",
      "anchor.target"
    ]) {
      assert.ok(
        host.includes(guard),
        `missing intent guard: ${guard}`
      );
    }
  });

  it("race safety: monotonic tokens guard every timer and dismissal", async () => {
    const host = await readText("components/GlobalRouteTransition.tsx");

    assert.match(host, /tokenRef/);
    assert.match(host, /\+\+tokenRef\.current/);
    assert.match(
      host,
      /pendingRef\.current\?\.token !==\s*\n?\s*token/,
      "stale timers and dismissals must no-op against the latest intent"
    );
    assert.match(host, /startedFrom/, "commits are compared against the intent's origin path");
  });

  it("timing constants live in loadPhase (grace period + safety cap, no fake durations)", async () => {
    const loadPhase = await readText("lib/loadPhase.ts");
    const host = await readText("components/GlobalRouteTransition.tsx");

    assert.match(loadPhase, /export const ROUTE_OVERLAY_DELAY_MS = 180/);
    assert.match(loadPhase, /export const ROUTE_TRANSITION_CAP_MS = 12000/);

    assert.match(host, /ROUTE_OVERLAY_DELAY_MS/);
    assert.match(host, /ROUTE_TRANSITION_CAP_MS/);
    assert.doesNotMatch(
      host,
      /setTimeout\(\s*\d/,
      "no inline magic durations — both bounds are registry constants"
    );
  });

  it("the loading surface is the shared SceneLoadingScreen route variant", async () => {
    const host = await readText("components/GlobalRouteTransition.tsx");
    const screen = await readText("components/SceneLoadingScreen.tsx");
    const css = await readText("components/SceneLoadingScreen.module.css");

    assert.match(host, /variant="route"/);
    assert.match(host, /phase="LOADING"/);
    assert.match(host, /ariaLabel=/, "the announcement names the destination");
    assert.match(screen, /"boot" \| "scene" \| "route"/);
    assert.match(screen, /role="status"/);
    assert.match(screen, /aria-live="polite"/);
    assert.match(screen, /renderMark\?: boolean/);

    /* Non-blocking: pointer-events none in EVERY route-variant state. */
    const routeBlock = css.slice(
      css.indexOf('[data-variant="route"]'),
      css.indexOf('[data-variant="route"] .backdrop')
    );

    assert.match(routeBlock, /pointer-events: none/);

    /* Reduced motion collapses the route variant's arc to a static ring. */
    const reduced = css.slice(css.indexOf("prefers-reduced-motion: reduce"));
    assert.match(reduced, /\[data-variant="route"\] \.mark::after/);

    /* No-JS safety: the visible rule rides the reveal-js gate. */
    assert.match(
      css,
      /:global\(html\.reveal-js\) \.sceneLoadingScreen\[data-variant="route"\]\[data-visible="true"\]/
    );
  });

  it("the star image mounts only at first real engagement", async () => {
    const host = await readText("components/GlobalRouteTransition.tsx");

    assert.match(host, /renderMark=\{engaged\}/);
    assert.match(
      host,
      /setEngaged\(true\)/,
      "engagement flips only when the overlay genuinely shows"
    );
  });

  it("browser back/forward is deliberately not intercepted", async () => {
    const host = await readText("components/GlobalRouteTransition.tsx");

    assert.doesNotMatch(
      host,
      /addEventListener\("popstate"|addEventListener\("pageshow"|window\.history\./,
      "no fragile history hacks — a committed popstate dismisses through the pathname effect"
    );
  });
});

/* ------------------------------------------------------------------ */
/* Suite hygiene                                                       */
/* ------------------------------------------------------------------ */

describe("canonical source filenames (generated files are never sources)", () => {
  it("no duplicate/legacy source-name patterns exist in app/, components/, or lib/", async () => {
    /*
     * One canonical source file per implementation: stable names, no
     * renamed copies, no AI-agent temp files. Next's own hashed build
     * chunks live in out/_next and are build output, never source.
     */
    const LEGACY_PATTERN =
      /(-final|-new|-v[0-9]+|-copy|-backup|-old|-temp|-tmp|\.bak)\.(tsx?|css|mjs|js)$/i;

    const offenders: string[] = [];

    for (const dir of ["app", "components", "lib", "scripts"]) {
      const files = await collectSourceFiles(path.join(ROOT, dir));

      for (const file of files) {
        if (LEGACY_PATTERN.test(path.basename(file))) {
          offenders.push(path.relative(ROOT, file));
        }
      }
    }

    assert.deepEqual(
      offenders,
      [],
      `legacy/duplicate source names found: ${offenders.join(", ")} — one canonical file per implementation`
    );
  });
});

describe("v4.0.4 release wiring", () => {
  it("package.json declares version 4.0.4", async () => {
    const pkg = JSON.parse(await readText("package.json"));

    assert.equal(pkg.version, "4.0.4");
  });

  it("verify-seo carries the export-level WhatsApp ban and metadata-quality census", async () => {
    const seo = await readText("scripts/verify-seo.mjs");

    for (const check of [
      "verifyNoWhatsAppRemnants",
      "verifyMetadataQuality",
      "verifyCanonicalUniqueness",
      "verifyEntityGraphIntegrity"
    ]) {
      assert.match(seo, new RegExp(`async function ${check}`));
      assert.match(seo, new RegExp(`await ${check}\\(`));
    }
  });

  it("verify-loading carries the hero-signal skeleton and inert route-host checks", async () => {
    const loading = await readText("scripts/verify-loading.mjs");

    assert.match(loading, /heroSignal/);
    assert.match(loading, /data-variant="route"/);
    assert.match(loading, /ships VISIBLE/);
  });
});
