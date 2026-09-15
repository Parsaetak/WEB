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
  Section,
  type ArticleCardEntry
} from "@/components/content/ContentBlocks";

import { getBlogMetaList } from "@/lib/blog";

import styles from "@/components/content/content.module.css";

/*
 * /work/ — the canonical professional portfolio document (v3.1).
 *
 * The interactive #work scene remains the living experience; this
 * route is its indexable, professional counterpart: every significant
 * system with what it is, what problem it addresses, why it matters,
 * where it lives, and which articles document it. The copy is
 * condensed from the verified Work scene data — nothing here is
 * invented, and nothing is duplicated verbatim.
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
  what: string;
  problem: string;
  why: string;
  tech: string;
  links: readonly { label: string; href: string; external: boolean }[];
  articleSlug: string | null;
};

/*
 * Selected systems, ordered by centrality to the laboratory's
 * mission. Every `what/problem/why` line condenses the verified copy
 * already presented in the Work scene and the field-note articles.
 */
const WORK_ENTRIES: readonly WorkEntry[] = [
  {
    name: "SHEYTAN Local Agent",
    type: "LOCAL-FIRST AI LABORATORY",
    what: "A desktop AI engineering environment: managed llama.cpp inference, a supervised agent loop with seventeen governed tools, isolated coding workspaces, long-context memory and recall, and objective verification gates.",
    problem: "Agent demos end where engineering begins — after the model speaks. Real work needs execution, memory, and a judge that is not the model itself.",
    why: "It proves a serious agent workflow can run entirely locally, with verification — not confidence — deciding whether work succeeded.",
    tech: "GO · WAILS V3 · LLAMA.CPP · REACT",
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
    what: "The laboratory's measurement arm: an adaptive framework for measuring intelligence, reasoning, transfer, and human-AI performance, public today as the AIST-2026.09 standard and the ASI-100-Elite-2026.09 benchmark.",
    problem: "AI capability claims outrun their evidence; most benchmarks can be gamed, so scores stop meaning anything.",
    why: "It makes measurement honest by design — multiplicative scoring, verification as a load-bearing factor, and engineered items instead of vibes.",
    tech: "AIST · ASI-100 · PSYCHOMETRICS",
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
    what: "A lightweight, free, open-source VPN configuration manager for Windows: a Go multi-core runtime that discovers, tests, maintains, and runs publicly available proxy configurations, with checksummed chunked local storage.",
    problem: "Connectivity tools for heavily restricted environments are usually closed, heavy, or careless with local state and telemetry.",
    why: "It is local-first software under the hardest conditions: no account, no cloud, no telemetry, deterministic behaviour, and tests that separate fakes from reality.",
    tech: "GO · XRAY · V2RAY · SING-BOX · C++ ABI",
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
    what: "The site you are reading: a statically exported Next.js application — six hash scenes, a markdown-driven blog, a generated SEO graph, a build-time link verifier, and a canvas organism.",
    problem: "A personal site is usually either expressive or engineered; it is rarely both with the discipline made public.",
    why: "It demonstrates the whole practice in one artifact: living-world UX, static-export performance, and a verified internal graph — every build checks its own SEO.",
    tech: "NEXT.JS 16 · REACT 19 · STATIC EXPORT",
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
    what: "The published framework family: AI Instructions (a five-tier constitutional operating framework for AI systems), REP (the Reasoning Enhancement Protocol), and USEF (the Unified System Enhancement Framework).",
    problem: "AI systems fail without direction: capability needs governance, reasoning needs structure, and improvement needs a repeatable discipline.",
    why: "They are the operating law every other system here runs under — published and versioned as public documents.",
    tech: "GOVERNANCE · REASONING · SYSTEMS",
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
    what: "The multi-branch repository that publishes the specifications, frameworks, and books — and feeds this site's library through a validated manifest.",
    problem: "Specifications and long-form writing drift when they live as loose files.",
    why: "Content is treated as infrastructure: versioned, validated, and pipeline-fed like code.",
    tech: "SPECS · BOOKS · MANIFEST",
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
    what: "A responsive canvas organism that turns the website itself into a computational experiment — perception, adaptation, and visible state — plus the RED MAGIC book line.",
    problem: "The web is mostly brochures; interfaces rarely behave as if they were alive.",
    why: "It is the laboratory's expressive thesis made executable, and it is deliberately kept lazy and reduced-motion-safe so expression never defeats performance.",
    tech: "CANVAS · ADAPTATION · EXPERIMENT",
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

  const articleCards: readonly (ArticleCardEntry | null)[] =
    WORK_ENTRIES.map((entry) => {
      if (!entry.articleSlug) return null;

      const post = metaList.find(
        (candidate) => candidate.slug === entry.articleSlug
      );

      if (!post) return null;

      return {
        slug: post.slug,
        title: post.title,
        subtitle: post.subtitle,
        date: post.date,
        readingTime: post.readingTime,
        category: post.category
      };
    });

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
                description: entry.what
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
        lead={[
          "The significant public systems of the laboratory: local AI agents, machine-intelligence measurement, production software under hostile constraints, static-site engineering, and the creative line. Each entry states what the system is, the problem it addresses, and why it matters — with the repository or destination where the work is real.",
          "The interactive Work scene on the homepage presents the same portfolio as part of the living world; this document is the clean, indexable counterpart. Field notes for each system are linked from its entry."
        ]}
      >
        <Section title="The systems">
          <div className={styles.projectList}>
            {WORK_ENTRIES.map((entry, index) => (
              <article
                key={entry.name}
                className={styles.projectCard}
                aria-label={`${entry.name} — ${entry.type.toLowerCase()}`}
              >
                <div className={styles.projectHead}>
                  <h3 className={styles.projectName}>
                    <span aria-hidden="true" className={styles.projectNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>{" "}
                    {entry.name}
                  </h3>

                  <span className={styles.projectMeta}>{entry.type}</span>
                </div>

                <p className={styles.projectWhat}>{entry.what}</p>

                <p className={styles.projectWhy}>
                  <strong>The problem.</strong> {entry.problem}
                </p>

                <p className={styles.projectWhy}>
                  <strong>Why it matters.</strong> {entry.why}
                </p>

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

                  {articleCards[index] && (
                    <a
                      className={styles.projectLink}
                      href={routeHref(`/blog/${articleCards[index]!.slug}/`)}
                    >
                      {articleCards[index]!.title}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section title="Where to go deeper">
          <Prose>
            <p>
              Each domain of this portfolio has a topic hub — a real
              document that defines the area and connects its systems,
              frameworks, and articles. Start with the domain closest to
              what brought you here.
            </p>
          </Prose>

          <LinkCardRow
            links={[
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
