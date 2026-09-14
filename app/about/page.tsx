import type { Metadata } from "next";

import {
  AUTHOR_RESEARCH_LINE,
  AUTHOR_TAGLINE,
  JsonLd,
  PERSON_ID,
  contentBreadcrumbEntity,
  contentWebPageEntity
} from "@/lib/seo";

import { ABOUT_ROUTE, contentRouteMetadata, routeHref } from "@/lib/hubs";

import { PUBLIC_LINKS } from "@/lib/links";

import ContentShell from "@/components/content/ContentShell";

import {
  ArticleCard,
  FocusList,
  LinkCardRow,
  Prose,
  Section
} from "@/components/content/ContentBlocks";

import { getBlogMetaList } from "@/lib/blog";

import styles from "@/components/content/content.module.css";

/*
 * /about/ — the entity/author page (v3.1).
 *
 * A real, independently useful document that consolidates who Parsa
 * Tak is: the professional positioning, the research areas (with
 * edges into every topic hub), the selected systems (with an edge
 * into /work/), selected writing, and the real public profiles.
 *
 * Everything on this page is factual and already presented by the
 * site: no employment, awards, credentials, or institutional
 * affiliations are invented. Structured data: one WebPage whose
 * mainEntity references the site-wide Person @id — the Person node
 * itself lives once in the root layout graph.
 */

export const metadata: Metadata = contentRouteMetadata({
  route: ABOUT_ROUTE.slug,
  title: ABOUT_ROUTE.metaTitle,
  description: ABOUT_ROUTE.metaDescription,
  ogAlt: "Parsa Tak — independent AI systems researcher and builder"
});

const RESEARCH_AREAS: readonly { name: string; note: string }[] = [
  {
    name: "AI systems",
    note: "Governance, tools, and verification as one architecture — see the AI systems hub."
  },
  {
    name: "Local AI agents",
    note: "Agents, inference, and memory that run entirely on your machine."
  },
  {
    name: "Reasoning architectures",
    note: "Reasoning treated as a system property, not a model feature."
  },
  {
    name: "AI evaluation",
    note: "Measurement before claims — UHIT, AIST-2026.09, ASI-100-Elite."
  },
  {
    name: "Software engineering",
    note: "Bounded systems, honest tests, and fast static architecture."
  },
  {
    name: "Creative technology",
    note: "The living web and the RED MAGIC line."
  }
];

const SELECTED_SYSTEMS: readonly { name: string; what: string }[] = [
  {
    name: "SHEYTAN Local Agent",
    what: "A local-first desktop AI engineering laboratory: managed llama.cpp inference, a supervised agent loop, and objective verification gates."
  },
  {
    name: "UHIT / AIST",
    what: "The measurement programme for machine intelligence — the AIST-2026.09 standard and the ASI-100-Elite-2026.09 benchmark, published as open specifications."
  },
  {
    name: "FreeIran",
    what: "A free, open-source VPN configuration manager for Windows with a Go multi-core runtime, chunked local storage, and no telemetry of any kind."
  },
  {
    name: "WEB",
    what: "This website: a statically exported Next.js application with a build-verified SEO graph and a living-world interface."
  },
  {
    name: "RED MAGIC",
    what: "The computational-organism experiment and the RED MAGIC book line — technology treated as an expressive medium."
  }
];

const SELECTED_ARTICLE_SLUGS: readonly string[] = [
  "ai-instructions",
  "sheytan-the-local-first-laboratory",
  "measuring-machine-intelligence",
  "reasoning-is-a-system-property",
  "the-anatomy-of-a-fast-static-site"
];

/*
 * Identity profiles only — the same id set the Person entity's
 * sameAs list uses, resolved from lib/links.ts so the page can never
 * drift from what the site actually publishes. Contact endpoints
 * (email, WhatsApp, PayPal) are deliberately excluded: this section
 * mirrors the structured-data identity, not contact channels.
 */
const PROFILE_IDS: readonly string[] = [
  "github",
  "linkedin",
  "x",
  "youtube",
  "instagram",
  "tiktok",
  "telegram-channel",
  "linktree"
];

function profileLink(id: string) {
  return (
    [...PUBLIC_LINKS.social, ...PUBLIC_LINKS.resources, ...PUBLIC_LINKS.meta]
      .find((link) => link.id === id) ?? null
  );
}

export default function AboutPage() {
  const metaList = getBlogMetaList();

  const selectedArticles = SELECTED_ARTICLE_SLUGS.map((slug) =>
    metaList.find((post) => post.slug === slug)
  ).filter((post): post is NonNullable<typeof post> => Boolean(post));

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "About", href: null }
  ];

  const profiles = PROFILE_IDS.map(profileLink).filter(
    (link): link is NonNullable<typeof link> => Boolean(link)
  );

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            contentWebPageEntity({
              route: `${ABOUT_ROUTE.slug}/`,
              name: ABOUT_ROUTE.metaTitle,
              description: ABOUT_ROUTE.metaDescription,
              about: RESEARCH_AREAS.map((area) => ({
                "@type": "Thing",
                name: area.name
              })),
              mainEntity: { "@id": PERSON_ID }
            }),
            contentBreadcrumbEntity(`${ABOUT_ROUTE.slug}/`, crumbs)
          ]
        }}
      />

      <ContentShell
        kicker="PROFILE"
        title="Parsa Tak"
        crumbs={crumbs}
        lead={[
          "Independent AI systems researcher and builder, focused on local AI agents, reasoning architectures, software systems, and machine intelligence evaluation.",
          "The work has one shape: research ideas about intelligence, build systems to test them, write about what was learned, and create visual work around the same questions. Everything public — the systems, the frameworks, the benchmarks, this website — is built and documented inside that loop."
        ]}
      >
        <Section title="Research areas">
          <Prose>
            <p>
              Six areas carry the research. Each one has a topic hub on
              this site — a real document that defines the area, lists
              the systems built in it, and connects the related writing.
              The hubs are the fastest way into any part of the work.
            </p>
          </Prose>

          <FocusList
            items={RESEARCH_AREAS.map((area) => ({
              title: area.name,
              body: area.note
            }))}
          />

          <LinkCardRow
            links={RESEARCH_AREAS.map((area) => ({
              label: area.name,
              href: hubHrefForArea(area.name),
              note: "Topic hub — definition, systems, and related writing",
              external: false
            }))}
          />
        </Section>

        <Section title="Selected systems">
          <Prose>
            <p>
              The most significant public systems, each documented in its
              own repository or on this site. The full portfolio — what
              each system addresses, why it matters, and where it lives —
              is collected on the{" "}
              <a href={routeHref("/work/")}>Selected Work page</a>.
            </p>
          </Prose>

          <FocusList
            items={SELECTED_SYSTEMS.map((system) => ({
              title: system.name,
              body: system.what
            }))}
          />

          <LinkCardRow
            links={[
              {
                label: "Selected Work — the project authority page",
                href: "/work/",
                note: "Every system with problem, outcome, and links",
                external: false
              },
              {
                label: "GitHub — the public archive",
                href: "https://github.com/Parsaetak",
                note: "Code, systems, experiments, and public specifications",
                external: true
              }
            ]}
          />
        </Section>

        <Section title="Selected writing">
          <Prose>
            <p>
              Field notes from the laboratory: architecture stories,
              engineering discipline, and the reasoning behind the
              frameworks. These five are the strongest starting points;
              the full catalogue lives in the{" "}
              <a href={routeHref("/blog/")}>blog</a>.
            </p>
          </Prose>

          <div className={styles.articleList}>
            {selectedArticles.map((post) => (
              <ArticleCard
                key={post.slug}
                article={{
                  slug: post.slug,
                  title: post.title,
                  subtitle: post.subtitle,
                  date: post.date,
                  readingTime: post.readingTime,
                  category: post.category
                }}
                note={post.excerpt.slice(0, 160).trimEnd()}
              />
            ))}
          </div>
        </Section>

        <Section title="How the work is organised">
          <Prose>
            <p>
              The practice is one loop, run at different depths. Research
              produces frameworks (AI Instructions, REP, USEF); systems
              execute them (SHEYTAN, FreeIran, WEB); evaluation keeps the
              claims honest (UHIT, AIST, ASI-100); and the creative line
              (RED MAGIC, the living web) explores the same questions
              expressively. Writing holds it all together — every system
              has field notes, and every claim is marked as fact or
              analysis in the house style.
            </p>
            <p>{AUTHOR_RESEARCH_LINE}</p>
            <p>{AUTHOR_TAGLINE}</p>
          </Prose>
        </Section>

        <Section title="Profiles">
          <Prose>
            <p>
              Public profiles and channels — the same identities the
              site&#39;s structured data references. Code and
              specifications live on GitHub; updates and experiments
              across the other channels.
            </p>
          </Prose>

          <div className={styles.profileGrid}>
            {profiles.map((link) => (
              <a
                key={link.id}
                className={styles.profileLink}
                href={link.href}
                target={
                  link.href.startsWith("mailto:") ? undefined : "_blank"
                }
                rel="noreferrer"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </Section>
      </ContentShell>
    </>
  );
}

/*
 * Area name → hub route. Kept as a tiny explicit map (instead of a
 * data-structure join) so the about page's pairing of prose and link
 * stays reviewable at a glance.
 */
function hubHrefForArea(name: string): string {
  switch (name) {
    case "AI systems":
      return "/ai-systems/";
    case "Local AI agents":
      return "/local-ai/";
    case "Reasoning architectures":
      return "/ai-reasoning/";
    case "AI evaluation":
      return "/ai-evaluation/";
    case "Software engineering":
      return "/software-engineering/";
    case "Creative technology":
      return "/creative-technology/";
    default:
      return "/work/";
  }
}
