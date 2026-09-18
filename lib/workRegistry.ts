/*
 * WORK REGISTRY (v3.9) — the canonical data behind /work/.
 *
 * Single source of truth for the selected-systems entries the
 * Selected Work document renders: name, classification, scannable
 * summary, deep what/problem/why copy, stack, key signal, the Blog
 * project-filter value, the cover article, and the outbound links.
 *
 * WHY A SHARED MODULE: the lateral content graph needs the same
 * truth the Work page renders. When an article's `project` matches
 * a registry entry's `blogProject`, the article page can link the
 * canonical Work document with the entry's real name — one
 * relationship model, zero duplicated project tables. The registry
 * is static data consumed only by server components and build-time
 * rendering; it never enters a client bundle.
 *
 * Laws carried over from the inline table (v3.7):
 * - Every entry condenses verified copy from the Work scene and the
 *   field-note articles. Nothing is fabricated.
 * - Covers reuse the Blog's committed article artwork (resolved by
 *   the Work page from the content index), never new fabrications.
 * - `signal` states a measured or structural fact, never a claim.
 */

export type WorkEntry = {
  name: string;
  type: string;
  /** One-sentence purpose — the scannable summary above the fold. */
  purpose: string;
  what: string;
  problem: string;
  why: string;
  tech: string;
  /** Key mono signal — measured or structural fact, never a claim. */
  signal: string;
  /**
   * Blog project filter value — links the card into the Blog's
   * project-filtered content (/blog/?project=…) and the article
   * lateral graph into this registry. Null when the system has no
   * project-tagged writing yet.
   */
  blogProject: string | null;
  /**
   * Additional Blog project values (v3.9) that document this same
   * system under a distinct filter stream. Used only by the lateral
   * graph lookup — the Blog's project filters keep the author's own
   * vocabulary, and the Work document keeps one entry per system.
   * Example: the RED MAGIC line is written about both as the
   * organism (project "red-magic") and as the RED THEORY model
   * (project "red-theory"); both streams belong to the same
   * Selected Work entry.
   */
  blogProjectAliases?: readonly string[];
  /**
   * Article slug whose committed cover becomes the card visual.
   * Null renders the truthful geometric identity card instead.
   */
  coverSlug: string | null;
  links: readonly { label: string; href: string; external: boolean }[];
  articleSlug: string | null;
};

/*
 * Selected systems, ordered by centrality to the laboratory's
 * mission (unchanged from v3.7 — the order the Work document and
 * its ItemList structured data present).
 */
export const WORK_ENTRIES: readonly WorkEntry[] = [
  {
    name: "SHEYTAN Local Agent",
    type: "LOCAL-FIRST AI LABORATORY",
    purpose: "A desktop AI engineering environment where the model proposes, governed tools execute, and objective verification decides success.",
    what: "A desktop AI engineering environment: managed llama.cpp inference, a supervised agent loop with seventeen governed tools, isolated coding workspaces, long-context memory and recall, and objective verification gates.",
    problem: "Agent demos end where engineering begins — after the model speaks. Real work needs execution, memory, and a judge that is not the model itself.",
    why: "It proves a serious agent workflow can run entirely locally, with verification — not confidence — deciding whether work succeeded.",
    tech: "GO · WAILS V3 · LLAMA.CPP · REACT",
    signal: "17 GOVERNED TOOLS · PLAN → EXECUTE → VERIFY",
    blogProject: "sheytan-local-agent",
    coverSlug: "sheytan-the-local-first-laboratory",
    links: [
      {
        label: "SHEYTAN repository on GitHub",
        href: "https://github.com/Parsaetak/SHEYTAN-local-agent",
        external: true
      },
      {
        label: "The local AI topic hub",
        href: "/local-ai/",
        external: false
      }
    ],
    articleSlug: "sheytan-the-local-first-laboratory"
  },
  {
    name: "UHIT — Universal Human Intelligence Test",
    type: "INTELLIGENCE MEASUREMENT",
    purpose: "The laboratory's measurement arm: an adaptive framework measuring intelligence, reasoning, transfer, and human-AI performance.",
    what: "The laboratory's measurement arm: an adaptive framework for measuring intelligence, reasoning, transfer, and human-AI performance, public today as the AIST-2026.09 standard and the ASI-100-Elite-2026.09 benchmark.",
    problem: "AI capability claims outrun their evidence; most benchmarks can be gamed, so scores stop meaning anything.",
    why: "It makes measurement honest by design — multiplicative scoring, verification as a load-bearing factor, and engineered items instead of vibes.",
    tech: "AIST · ASI-100 · PSYCHOMETRICS",
    signal: "MULTIPLICATIVE SCORING · VERIFICATION IS LOAD-BEARING",
    blogProject: "uhit",
    coverSlug: "measuring-machine-intelligence",
    links: [
      {
        label: "UHIT specifications on GitHub (AI-Tests branch)",
        href: "https://github.com/Parsaetak/Contents/tree/AI-Tests",
        external: true
      },
      {
        label: "AIST-2026.09 specification",
        href: "https://github.com/Parsaetak/Contents/blob/AI-Tests/AIST-2026.09.md",
        external: true
      },
      {
        label: "ASI-100-Elite-2026.09 benchmark",
        href: "https://github.com/Parsaetak/Contents/blob/AI-Tests/ASI-100-Elite-2026.09.md",
        external: true
      },
      {
        label: "The AI evaluation topic hub",
        href: "/ai-evaluation/",
        external: false
      }
    ],
    articleSlug: "measuring-machine-intelligence"
  },
  {
    name: "FreeIran",
    type: "OPEN-SOURCE VPN MANAGER",
    purpose: "A free, open-source VPN configuration manager for Windows built around a Go multi-core runtime and local-first storage.",
    what: "A lightweight, free, open-source VPN configuration manager for Windows: a Go multi-core runtime that discovers, tests, maintains, and runs publicly available proxy configurations, with checksummed chunked local storage.",
    problem: "Connectivity tools for heavily restricted environments are usually closed, heavy, or careless with local state and telemetry.",
    why: "It is local-first software under the hardest conditions: no account, no cloud, no telemetry, deterministic behaviour, and tests that separate fakes from reality.",
    tech: "GO · XRAY · V2RAY · SING-BOX · C++ ABI",
    signal: "NO ACCOUNT · NO CLOUD · NO TELEMETRY",
    blogProject: "freeiran",
    coverSlug: "freeiran-engineering-notes",
    links: [
      {
        label: "FreeIran repository on GitHub",
        href: "https://github.com/Parsaetak/FreeIran",
        external: true
      },
      {
        label: "The software engineering topic hub",
        href: "/software-engineering/",
        external: false
      }
    ],
    articleSlug: "freeiran-engineering-notes"
  },
  {
    name: "WEB — this website",
    type: "STATIC LIVING SYSTEM",
    purpose: "The site you are reading: a statically exported Next.js application that behaves like an organism and verifies its own SEO every build.",
    what: "The site you are reading: a statically exported Next.js application — six hash scenes, a markdown-driven blog, a generated SEO graph, a build-time link verifier, and a canvas organism.",
    problem: "A personal site is usually either expressive or engineered; it is rarely both with the discipline made public.",
    why: "It demonstrates the whole practice in one artifact: living-world UX, static-export performance, and a verified internal graph — every build checks its own SEO.",
    tech: "NEXT.JS 16 · REACT 19 · STATIC EXPORT",
    signal: "STATIC EXPORT · BUILD-TIME SEO VERIFICATION",
    blogProject: "web-platform",
    coverSlug: "the-anatomy-of-a-fast-static-site",
    links: [
      {
        label: "WEB repository on GitHub",
        href: "https://github.com/Parsaetak/WEB",
        external: true
      },
      {
        label: "The live site",
        href: "https://parsaetak.github.io/WEB/",
        external: true
      }
    ],
    articleSlug: "the-anatomy-of-a-fast-static-site"
  },
  {
    name: "AI Instructions · REP · USEF",
    type: "FRAMEWORK FAMILY",
    purpose: "The published framework family governing how AI systems reason, verify, use tools, and improve — one constitution above the runtime.",
    what: "The published framework family: AI Instructions (a five-tier constitutional operating framework for AI systems), REP (the Reasoning Enhancement Protocol), and USEF (the Unified System Enhancement Framework).",
    problem: "AI systems fail without direction: capability needs governance, reasoning needs structure, and improvement needs a repeatable discipline.",
    why: "They are the operating law every other system here runs under — published and versioned as public documents.",
    tech: "GOVERNANCE · REASONING · SYSTEMS",
    signal: "5-TIER CONSTITUTION · PROTOCOL-ENFORCED REASONING",
    blogProject: "ai-frameworks",
    coverSlug: "ai-instructions",
    links: [
      {
        label: "The AI systems topic hub",
        href: "/ai-systems/",
        external: false
      },
      {
        label: "The AI reasoning topic hub",
        href: "/ai-reasoning/",
        external: false
      },
      {
        label: "The Systems scene",
        href: "/#systems",
        external: false
      }
    ],
    articleSlug: "ai-instructions"
  },
  {
    name: "Contents",
    type: "CONTENT INFRASTRUCTURE",
    purpose: "The multi-branch repository that publishes the specifications, frameworks, and books — and feeds this site's library.",
    what: "The multi-branch repository that publishes the specifications, frameworks, and books — and feeds this site's library through a validated manifest.",
    problem: "Specifications and long-form writing drift when they live as loose files.",
    why: "Content is treated as infrastructure: versioned, validated, and pipeline-fed like code.",
    tech: "SPECS · BOOKS · MANIFEST",
    signal: "VERSIONED · VALIDATED · PIPELINE-FED",
    blogProject: null,
    coverSlug: null,
    links: [
      {
        label: "Contents repository on GitHub",
        href: "https://github.com/Parsaetak/Contents",
        external: true
      }
    ],
    articleSlug: null
  },
  {
    name: "RED MAGIC",
    type: "COMPUTATIONAL ORGANISM",
    purpose: "A responsive canvas organism that turns the website itself into a computational experiment — perception, adaptation, visible state.",
    what: "A responsive canvas organism that turns the website itself into a computational experiment — perception, adaptation, and visible state — plus the RED MAGIC book line.",
    problem: "The web is mostly brochures; interfaces rarely behave as if they were alive.",
    why: "It is the laboratory's expressive thesis made executable, and it is deliberately kept lazy and reduced-motion-safe so expression never defeats performance.",
    tech: "CANVAS · ADAPTATION · EXPERIMENT",
    signal: "5 COMPUTED LAYERS · REDUCED-MOTION-SAFE",
    blogProject: "red-magic",
    blogProjectAliases: ["red-theory"],
    coverSlug: "why-the-website-is-a-living-system",
    links: [
      {
        label: "The Magic scene — experience the organism",
        href: "/#magic",
        external: false
      },
      {
        label: "The creative technology topic hub",
        href: "/creative-technology/",
        external: false
      }
    ],
    articleSlug: "red-theory-and-the-living-web"
  }
];

/*
 * LATERAL GRAPH LOOKUP (v3.9): the Work entry documenting a given
 * Blog project value, or null. Deterministic — a plain registry
 * scan in fixed order, first match wins; the match tests the
 * entry's primary blogProject value first, then its explicit
 * aliases. Alias membership means the project's writing documents
 * this system (declared here, never inferred from keywords).
 */
export function getWorkEntryForProject(
  project: string | null | undefined
): WorkEntry | null {
  if (!project) {
    return null;
  }

  return (
    WORK_ENTRIES.find(
      (entry) =>
        entry.blogProject === project ||
        entry.blogProjectAliases?.includes(project) === true
    ) ?? null
  );
}
