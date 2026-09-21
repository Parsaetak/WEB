/*
 * tests/footer.test.ts — the v4.0.5 FOOTER contract: one compact,
 * professional, responsive footer that preserves every important
 * link. Verified as BEHAVIOR (which groups exist, what stays
 * crawlable, who owns the styles) — not pixel trivia.
 */

import { describe, it } from "node:test";

import assert from "node:assert/strict";

import { readFile } from "node:fs/promises";

import path from "node:path";

import { fileURLToPath } from "node:url";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

async function readText(relative: string): Promise<string> {
  return readFile(path.join(ROOT, relative), "utf8");
}

/* ------------------------------------------------------------------ */
/* 1. The four logical navigation groups                               */
/* ------------------------------------------------------------------ */

describe("the footer carries the four logical navigation groups", () => {
  it("SiteDocNav renders Site, Collections, World, and Topics", async () => {
    const nav = await readText("components/SiteDocNav.tsx");

    for (const heading of ["Site", "Collections", "World", "Topics"]) {
      assert.match(
        nav,
        new RegExp(`heading="${heading}"`),
        `the ${heading} group exists`
      );
    }

    /* The groups are data-driven from the navigation source of truth. */
    assert.match(nav, /PRIMARY_NAV/);
    assert.match(nav, /CONTENT_NAV/);
    assert.match(nav, /WORLD_NAV/);
  });

  it("every destination the old footer carried is still reachable", async () => {
    const nav = await readText("components/SiteDocNav.tsx");
    const navigation = await readText("lib/navigation.ts");

    /* Primary: HOME / ABOUT / BLOG / CONTACT. */
    for (const href of ["/", "/about/", "/blog/", "/contact/"]) {
      assert.ok(
        navigation.includes(`href: "${href}"`),
        `primary destination ${href} remains in the navigation source`
      );
    }

    /* Collections: WORK / RESEARCH. */
    for (const href of ["/work/", "/research/"]) {
      assert.ok(navigation.includes(`href: "${href}"`));
    }

    /* World scenes: SYSTEMS / RED MAGIC / MEDIA. */
    for (const href of ["/#systems", "/#magic", "/#media"]) {
      assert.ok(navigation.includes(`href: "${href}"`));
    }

    /* Topics: all six hubs, rendered by the footer itself. */
    for (const href of [
      "/local-ai/",
      "/ai-systems/",
      "/ai-reasoning/",
      "/ai-evaluation/",
      "/software-engineering/",
      "/creative-technology/"
    ]) {
      assert.ok(
        nav.includes(`href: "${href}"`),
        `topic hub ${href} remains footer-crawlable`
      );
    }
  });

  it("footer links stay crawlable soft navigations", async () => {
    const nav = await readText("components/SiteDocNav.tsx");

    assert.match(
      nav,
      /import Link from "next\/link"/,
      "footer links render through next/link (crawlable anchors in the export)"
    );

    assert.match(nav, /prefetch=\{false\}/, "viewport prefetch stays off");
  });
});

/* ------------------------------------------------------------------ */
/* 2. The public network — data-driven, no hardcoded row splits        */
/* ------------------------------------------------------------------ */

describe("the public network is one data-driven wrapping group", () => {
  it("FooterLinks renders the registry directly — no fixed row slicing", async () => {
    const links = await readText("components/FooterLinks.tsx");

    assert.match(links, /ALL_PUBLIC_LINKS/);
    assert.doesNotMatch(
      links,
      /slice\(\s*\d+\s*\)/,
      "no hardcoded row sizes — the layout decides how many lines it needs"
    );

    assert.match(
      links,
      /ALL_PUBLIC_LINKS\.map/,
      "every registry entry renders"
    );
  });

  it("the wrapping contract is owned by the flow, not by row containers", async () => {
    const css = await readText("components/FooterLinks.module.css");

    assert.match(css, /flex-wrap: wrap/, "the group wraps naturally");
    assert.doesNotMatch(
      css,
      /\.linkRow/,
      "no presentation-only row containers"
    );
  });

  it("the verified contact channels remain in the registry", async () => {
    const registry = await readText("lib/links.ts");

    for (const channel of ['id: "email"', 'id: "github"', 'id: "linkedin"']) {
      assert.ok(
        registry.includes(channel),
        `the verified contact channel ${channel} must remain`
      );
    }
  });
});

/* ------------------------------------------------------------------ */
/* 3. Legal block — wording preserved, compact presentation            */
/* ------------------------------------------------------------------ */

describe("the legal block keeps its wording and links", () => {
  it("copyright, trademark notice, legal text, LICENSE and TRADEMARKS remain", async () => {
    const footer = await readText("components/SiteFooter.tsx");

    assert.match(footer, /© 2026 Parsa Tak\. All rights reserved\./);
    assert.match(footer, /Parsa Tak™/);
    assert.match(
      footer,
      /Original website design, visual identity/,
      "the legal notice keeps its meaning — only the presentation changed"
    );
    assert.match(footer, /LICENSE\.md/);
    assert.match(footer, /TRADEMARKS\.md/);
  });

  it("the legal row top-aligns without baseline hacks", async () => {
    const css = await readText("components/SiteFooter.module.css");

    const legalBlock = css.slice(
      css.indexOf(".footerLegal {"),
      css.indexOf(".footerLegal > p")
    );

    assert.match(
      legalBlock,
      /align-items: start/,
      "top-aligned — no end-alignment or negative-margin tricks"
    );
  });
});

/* ------------------------------------------------------------------ */
/* 4. Style ownership + responsiveness                                 */
/* ------------------------------------------------------------------ */

describe("footer styles live in the footer's own module", () => {
  it("SiteFooter imports its dedicated stylesheet", async () => {
    const footer = await readText("components/SiteFooter.tsx");

    assert.match(
      footer,
      /from "@\/components\/SiteFooter\.module\.css"/,
      "the footer owns SiteFooter.module.css"
    );
  });

  it("the living-world shell no longer carries footer styles", async () => {
    const living = await readText("components/LivingShell.module.css");

    assert.doesNotMatch(
      living,
      /livingShellLegal|livingShellFooter/,
      "LivingShell.module.css owns the world shell only — footer styles moved out"
    );

    /* The world HUD's own responsive rules survive the split. */
    assert.match(living, /\.livingShellHudInner/);
    assert.match(living, /\.livingShellHudActions/);
  });

  it("the footer grid responds 4 → 2 → 1 without overflow", async () => {
    const docNav = await readText("components/SiteDocNav.module.css");

    /* Desktop: a multi-column grid (four fractional tracks). */
    const desktop = docNav.slice(0, docNav.indexOf("@media"));
    assert.match(
      desktop,
      /grid-template-columns:[\s\S]*?fr[\s\S]*?fr[\s\S]*?fr[\s\S]*?fr/,
      "desktop renders the groups as a four-column grid"
    );

    /* Tablet (≤980px): two columns. */
    const tabletBlock = docNav.slice(
      docNav.indexOf("max-width: 980px"),
      docNav.indexOf("max-width: 560px")
    );
    assert.match(
      tabletBlock,
      /repeat\(\s*\n?\s*2\s*,/,
      "tablet collapses to two columns"
    );

    /* Phone (≤560px): one column; lists flow horizontally. */
    const phoneBlock = docNav.slice(docNav.indexOf("max-width: 560px"));
    assert.match(
      phoneBlock,
      /grid-template-columns:\s*\n?\s*minmax\(0, 1fr\)/,
      "phone collapses to one column"
    );
  });

  it("the footer never opts into a route-scoped reveal system", async () => {
    const footer = await readText("components/SiteFooter.tsx");

    assert.doesNotMatch(
      footer,
      /data-reveal=/,
      "reveal controllers mount only on the world shell and blog — an opt-in here hides the footer on every content route (the v4.0.3 bug)"
    );
  });
});
