import type { Metadata } from "next";

import {
  JsonLd,
  SITE_URL,
  contentBreadcrumbEntity,
  contentWebPageEntity
} from "@/lib/seo";

import { WORK_ROUTE, contentRouteMetadata, routeHref } from "@/lib/hubs";

import ContentShell from "@/components/content/ContentShell";

import {
  LinkCardRow,
  Prose,
  Section
} from "@/components/content/ContentBlocks";

import { getBlogMetaList } from "@/lib/blog";

import { BRAND_STAR } from "@/lib/brand";

import styles from "@/components/content/content.module.css";

/*
 * /work/ — the canonical professional portfolio document (v3.7).
 *
 * ROLE (v3.7): Work is no longer a primary-navigation tab — it is
 * the CANONICAL DEEP LANDING PAGE of the Blog content ecosystem: a
 * search-engine landing document and detailed reference, while
 * discovery increasingly happens through the Blog's content modes
 * (see /blog/?type=work). This route stays indexable, crawlable,
 * and cross-linked in both directions.
 *
 * PRESENTATION (v3.7): visual-first project cards. Every card leads
 * with a real visual — the project's committed article cover, or a
 * truthful geometric identity card built from its own technology
 * labels (never a fake screenshot) — then the scannable summary:
 * name, type, tech stack, one-sentence purpose, key signal, links.
 * The longer what/problem/why prose follows BELOW the visual
 * summary, inside the same card. Covers come from the generated
 * content index (the same assets the Blog cards use).
 *
 * Structured data: one WebPage plus an ItemList of the selected
 * systems (truthful — the page is genuinely an ordered list of
 * projects) referencing the same entity graph.
 */

export const metadata: Metadata = contentRouteMetadata({
  route: WORK_ROUTE.slug,
  title: WORK_ROUTE.metaTitle,
  description: WORK_ROUTE.metaDescription,
  ogAlt: "Selected work by Parsa Tak — AI systems, evaluation, software, and creative technology"
});

type WorkEntry = {
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
   * project-filtered content (/blog/?project=…). Null when the
   * system has no project-tagged writing yet.
   */
  blogProject: string | null;
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
 * mission. Every `what/problem/why` line condenses the verified copy
 * already presented in the Work scene and the field-note articles.
 * Covers reuse the Blog's committed article artwork — the same
 * images readers meet in the content grid, never new fabrications.
 */
const WORK_ENTRIES: readonly WorkEntry[] = [
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

export default function WorkPage() {
  const metaList = getBlogMetaList();

  const bySlug = new Map(metaList.map((post) => [post.slug, post]));

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Work", href: null }
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            contentWebPageEntity({
              route: `${WORK_ROUTE.slug}/`,
              name: WORK_ROUTE.metaTitle,
              description: WORK_ROUTE.metaDescription,
              about: {
                "@type": "Thing",
                name: "Selected systems and projects by Parsa Tak"
              }
            }),
            {
              "@type": "ItemList",
              "@id": `${SITE_URL}/work/#projects`,
              name: "Selected systems and projects",
              itemListElement: WORK_ENTRIES.map((entry, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: entry.name,
                description: entry.purpose
              }))
            },
            contentBreadcrumbEntity(`${WORK_ROUTE.slug}/`, crumbs)
          ]
        }}
      />

      <ContentShell
        kicker="SELECTED WORK"
        title="Selected Work"
        crumbs={crumbs}
        activeHref="/work/"
        lead={[
          "The significant public systems of the laboratory: local AI agents, machine-intelligence measurement, production software under hostile constraints, static-site engineering, and the creative line. Each card leads with the system's real visual identity, its stack, and its purpose — the deep documentation follows inside the card.",
          "This document is the canonical, indexable counterpart of the living Work scene; ongoing discovery of the writing behind these systems happens in the Blog — browse the work documentation stream there."
        ]}
      >
        <Section title="The systems">
          <div className={styles.projectVisualList}>
            {WORK_ENTRIES.map((entry, index) => {
              const article = entry.articleSlug
                ? bySlug.get(entry.articleSlug) ?? null
                : null;

              const coverPost = entry.coverSlug
                ? bySlug.get(entry.coverSlug) ?? null
                : null;

              return (
                <article
                  key={entry.name}
                  className={styles.projectVisualCard}
                  aria-label={`${entry.name} — ${entry.type.toLowerCase()}`}
                >
                  {/*
                   * THE VISUAL — the system's real identity: the
                   * committed article cover when one exists, or a
                   * truthful geometric card built from the 13-point
                   * star identity and the system's own technology
                   * labels. Never a fabricated screenshot.
                   */}
                  {coverPost?.cover ? (
                    <a
                      className={styles.projectVisualMedia}
                      href={routeHref(
                        `/blog/${article?.slug ?? coverPost.slug}/`
                      )}
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <img
                        src={coverPost.cover.src}
                        alt=""
                        width={coverPost.cover.width}
                        height={coverPost.cover.height}
                        loading={index < 2 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    </a>
                  ) : (
                    <div
                      className={`${styles.projectVisualMedia} ${styles.projectVisualIdentity}`}
                      aria-hidden="true"
                    >
                      <img
                        src={BRAND_STAR.red}
                        alt=""
                        width={54}
                        height={54}
                        loading="lazy"
                        decoding="async"
                      />

                      <span className={styles.projectVisualIdentityLabel}>
                        CONTENT
                        <br />
                        INFRASTRUCTURE
                      </span>
                    </div>
                  )}

                  <div className={styles.projectVisualContent}>
                    <div className={styles.projectVisualHead}>
                      <h3 className={styles.projectVisualName}>
                        <span
                          aria-hidden="true"
                          className={styles.projectNumber}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>{" "}
                        {entry.name}
                      </h3>

                      <span className={styles.projectMeta}>{entry.type}</span>
                    </div>

                    {/*
                     * SCANNABLE SUMMARY — purpose, signal, stack. The
                     * card is understood in seconds; depth follows.
                     */}
                    <p className={styles.projectPurpose}>{entry.purpose}</p>

                    <p className={styles.projectSignal}>{entry.signal}</p>

                    <p className={styles.projectMeta}>{entry.tech}</p>

                    <div className={styles.projectLinks}>
                      {entry.links.map((link) => (
                        <a
                          key={link.href}
                          className={styles.projectLink}
                          href={link.external ? link.href : routeHref(link.href)}
                          target={link.external ? "_blank" : undefined}
                          rel={link.external ? "noreferrer" : undefined}
                        >
                          {link.label}
                          {link.external ? " ↗" : ""}
                        </a>
                      ))}

                      {article && (
                        <a
                          className={styles.projectLink}
                          href={routeHref(`/blog/${article.slug}/`)}
                        >
                          {article.title}
                        </a>
                      )}

                      {entry.blogProject && (
                        <a
                          className={styles.projectLink}
                          href={routeHref(
                            `/blog/?project=${encodeURIComponent(
                              entry.blogProject
                            )}`
                          )}
                        >
                          All {entry.name.split(" — ")[0].split(" · ")[0]}{" "}
                          writing in the Blog
                        </a>
                      )}
                    </div>
                  </div>

                  {/*
                   * THE DEEP DOCUMENTATION — what/problem/why, below
                   * the visual summary, inside the same card.
                   */}
                  <div className={styles.projectVisualDetail}>
                    <p className={styles.projectWhat}>{entry.what}</p>

                    <p className={styles.projectWhy}>
                      <strong>The problem.</strong> {entry.problem}
                    </p>

                    <p className={styles.projectWhy}>
                      <strong>Why it matters.</strong> {entry.why}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </Section>

        <Section title="Where to go deeper">
          <Prose>
            <p>
              Each domain of this portfolio has a topic hub — a real
              document that defines the area and connects its systems,
              frameworks, and articles. The Blog carries the ongoing
              writing behind every system, and the research programme
              document maps the questions the systems exist to answer.
            </p>
          </Prose>

          <LinkCardRow
            links={[
              {
                label: "Work documentation in the Blog",
                href: "/blog/?type=work",
                note: "Every system's engineering notes, one stream",
                external: false
              },
              {
                label: "Research — the programme behind the systems",
                href: "/research/",
                note: "Questions, frameworks, measurement",
                external: false
              },
              {
                label: "Local AI systems & agents",
                href: "/local-ai/",
                note: "SHEYTAN, managed inference, verification gates",
                external: false
              },
              {
                label: "AI systems engineering",
                href: "/ai-systems/",
                note: "AI Instructions, REP, USEF, governed agents",
                external: false
              },
              {
                label: "AI evaluation & benchmarks",
                href: "/ai-evaluation/",
                note: "UHIT, AIST-2026.09, ASI-100-Elite",
                external: false
              },
              {
                label: "Software engineering",
                href: "/software-engineering/",
                note: "FreeIran, WEB, static architecture, honest tests",
                external: false
              },
              {
                label: "Creative technology",
                href: "/creative-technology/",
                note: "RED MAGIC, the living web, computational identity",
                external: false
              },
              {
                label: "About Parsa Tak",
                href: "/about/",
                note: "Who I am, how I work, and what I build",
                external: false
              }
            ]}
          />
        </Section>
      </ContentShell>
    </>
  );
}
