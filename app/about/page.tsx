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

import { EMAIL_LINK, LINKEDIN_LINK, PUBLIC_LINKS } from "@/lib/links";

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
 * /about/ — the entity/author page (v3.2, ProfilePage).
 *
 * The first screen answers the four questions a professional profile
 * must answer immediately: who Parsa Tak is, what he builds, what he
 * researches, and how someone can work with him. The document then
 * walks the full identity in order: what I do, how I work (the
 * research → product direction → architecture → implementation →
 * testing → verification → delivery pipeline), research, engineering,
 * product building, selected systems, current direction, the two
 * collaboration tracks, writing, profiles, and contact.
 *
 * Everything on this page is factual and already presented by the
 * site: no employment, awards, credentials, or institutional
 * affiliations are invented. Structured data: one ProfilePage whose
 * mainEntity references the site-wide Person @id — the Person node
 * itself lives once in the root layout graph, never duplicated.
 */

export const metadata: Metadata = contentRouteMetadata({
  route: ABOUT_ROUTE.slug,
  title: ABOUT_ROUTE.metaTitle,
  description: ABOUT_ROUTE.metaDescription,
  ogAlt: "Parsa Tak — independent software engineer, product builder, and AI systems researcher"
});

/*
 * The working pipeline (v3.2). The same chain the home scene leads
 * with, stated once here as the answer to "how I work".
 */
const WORKING_PIPELINE: readonly { title: string; body: string }[] = [
  {
    title: "Research",
    body: "Explore the problem space before committing: prior work, evidence, and the real question underneath the request."
  },
  {
    title: "Product direction",
    body: "Decide what to build and for whom — scope, constraints, and the smallest useful outcome, including what not to build."
  },
  {
    title: "Architecture",
    body: "Design components, state, boundaries, and failure handling before writing feature code."
  },
  {
    title: "Implementation",
    body: "Build in coherent, reviewable steps — mostly Go, TypeScript, and React — with the runtimes kept maintainable."
  },
  {
    title: "Testing",
    body: "Automated tests, honest fixtures, and regression suites that separate real behaviour from fakes."
  },
  {
    title: "Verification",
    body: "Objective checks — build, run, inspect, measure — decide whether work succeeded; never the model's or the author's confidence."
  },
  {
    title: "Delivery",
    body: "Ship clean: verified build, documented state, and an outcome that can be evaluated honestly afterwards."
  }
];

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

const ENGINEERING_EVIDENCE: readonly { title: string; body: string }[] = [
  {
    title: "Local-first discipline",
    body: "SHEYTAN and FreeIran run with no account, no cloud backend, and no telemetry — state lives in checksummed local files, and the network is treated as an enemy, not an assumption."
  },
  {
    title: "Verification gates",
    body: "In SHEYTAN, work is judged by objective checks rather than model confidence; in this website, every build re-verifies its own SEO graph, routes, and links."
  },
  {
    title: "Bounded runtimes",
    body: "Managed llama.cpp lifecycle, process supervision, bounded restarts, and isolated workspaces — systems designed to fail safely and recover deterministically."
  },
  {
    title: "Performance budgets",
    body: "Static export, zero route JavaScript on content documents, compositor-only motion, and no layout shift — measured, not asserted."
  }
];

const PRODUCT_EVIDENCE: readonly { title: string; body: string }[] = [
  {
    title: "Direction",
    body: "SHEYTAN exists because agent demos stopped where engineering begins; FreeIran exists because connectivity tools under hostile networks were closed, heavy, or careless. Each product starts from a real, named problem."
  },
  {
    title: "Scoping and restraint",
    body: "The products ship with deliberate boundaries — no accounts, no telemetry, no subscription logic — because the products are for people who need them to work, not for a metrics dashboard."
  },
  {
    title: "Interface decisions",
    body: "This website's six-scene world, the compact touch menu, the reduced-motion contracts, and the reader-first blog layout are product design decisions, documented and versioned like code."
  },
  {
    title: "Delivery and support",
    body: "Releases are cut with changelogs, verification checklists, and public repositories — the boring parts of product work that decide whether software is actually usable."
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
 * (email, WhatsApp, PayPal) are deliberately excluded here: they are
 * presented in the Contact section below, while this section mirrors
 * the structured-data identity.
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
              /*
               * ProfilePage (v3.2): this document is a profile whose
               * mainEntity is the site-wide Person @id — a subtype of
               * WebPage, so no entity is duplicated.
               */
              pageType: "ProfilePage",
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
        activeHref="/about/"
        lead={[
          `${AUTHOR_TAGLINE} He builds local-first AI systems and the frameworks that govern them — the SHEYTAN local-agent laboratory, the UHIT/AIST machine-intelligence measurement programme, the FreeIran VPN manager, and this website — and researches how intelligence systems can be structured, measured, and verified.`,
          "The work follows one pipeline: research → product direction → architecture → implementation → testing → verification → delivery. Every system in that chain is public — the repositories, the specifications, the benchmarks, the writing — so the claims can be checked against the artifacts.",
          "To work together — research collaboration on reasoning and evaluation, or an engineering engagement on AI systems and products — write to the email on the contact page or start from the Contact section below."
        ]}
      >
        <Section title="What I do">
          <Prose>
            <p>
              Three tracks, one practice. The research track asks how
              intelligence systems should be structured, measured, and
              governed — and publishes its answers as frameworks and
              specifications. The engineering track builds the systems those
              answers describe: local AI agents, network software, and this
              statically engineered website. The product track turns both
              into things people can actually run — scoping the problem,
              shaping the interface, and carrying the work through delivery.
            </p>
            <p>
              The tracks are deliberately not separated: a framework that has
              never run a real task is a draft, a system without measurement
              is a demo, and a product without engineering is a landing page.
              {AUTHOR_RESEARCH_LINE}
            </p>
          </Prose>
        </Section>

        <Section title="How I work">
          <Prose>
            <p>
              One pipeline from research to delivery, applied to research
              papers, products, and experiments alike. The stages are visible
              in the repository history of every system below — direction
              before architecture, testing before verification, verification
              before shipping.
            </p>
          </Prose>

          <FocusList items={WORKING_PIPELINE} />
        </Section>

        <Section title="Research">
          <Prose>
            <p>
              Six areas carry the research. Each one has a topic hub on
              this site — a real document that defines the area, lists
              the systems built in it, and connects the related writing.
              The hubs are the fastest way into any part of the work, and
              the{" "}
              <a href={routeHref("/research/")}>Research page</a> maps them
              onto the frameworks and the measurement programme.
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

        <Section title="Engineering">
          <Prose>
            <p>
              The engineering practice is easiest to describe through what
              the shipped systems enforce. The examples below are not
              aspirations — each one is a contract the public repositories
              and this website&#39;s own build pipeline demonstrate.
            </p>
          </Prose>

          <FocusList items={ENGINEERING_EVIDENCE} />
        </Section>

        <Section title="Product building">
          <Prose>
            <p>
              Product building is treated as a discipline of its own, not a
              side effect of coding. The evidence is in the shipped products:
              each one states the problem it addresses, the audience it
              refuses to serve, and the decisions that kept it small enough
              to finish.
            </p>
          </Prose>

          <FocusList items={PRODUCT_EVIDENCE} />
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

        <Section title="Current direction">
          <Prose>
            <p>
              The near-term work continues along the same lines: deepening
              the SHEYTAN agent loop (more governed tools, stronger
              verification gates), extending the UHIT/AIST measurement
              programme as an open specification, iterating the framework
              family (AI Instructions, REP, USEF) against real engineering
              tasks, and keeping the RED MAGIC creative line alive as the
              expressive counterpart to the systems work.
            </p>
            <p>
              This page is updated as the work ships; the{" "}
              <a href={routeHref("/blog/")}>writing index</a> is the honest
              record of what changed and when.
            </p>
          </Prose>
        </Section>

        <Section title="Academic and research collaboration">
          <Prose>
            <p>
              Researchers and practitioners working on reasoning
              architectures, AI evaluation and benchmarking, local-first AI,
              or AI system governance are welcome to get in touch. Useful
              starting points: the AIST-2026.09 specification and
              ASI-100-Elite benchmark (both public, both open to scrutiny),
              the REP protocol and its argument that reasoning is a system
              property, and the field notes that document how these ideas
              survive contact with real tasks.
            </p>
            <p>
              Replication attempts, methodological criticism, and joint
              evaluation work are all interesting; email is the fastest
              channel and every specification is linked from the{" "}
              <a href={routeHref("/research/")}>Research page</a>.
            </p>
          </Prose>
        </Section>

        <Section title="Business and engineering collaboration">
          <Prose>
            <p>
              The same pipeline — research, product direction, architecture,
              implementation, testing, verification, delivery — is available
              for engagements: building AI systems and local agents,
              evaluating models and systems, engineering fast static web
              products, or reviewing architecture before commitments harden.
            </p>
            <p>
              A useful first email names the problem, the constraints, and
              the deadline; a short answer comes back quickly, including
              &quot;this is not a good fit&quot; when it is true. Start
              from the{" "}
              <a href={routeHref("/contact/")}>Contact page</a>.
            </p>
          </Prose>
        </Section>

        <Section title="Writing">
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

        <Section title="Contact">
          <Prose>
            <p>
              The primary channel is email — every collaboration type
              (academic, business, project, open technical) starts there.
              Secondary channels are GitHub and LinkedIn. What each channel
              is for, and what to include in a first message, is written on
              the{" "}
              <a href={routeHref("/contact/")}>Contact page</a>.
            </p>
          </Prose>

          {/*
            * The mailto is used verbatim (never routeHref-ed — the
            * basePath prefix applies to routes, not schemes). The same
            * EMAIL_LINK source of truth as the /contact/ page.
            */}
          <div className={styles.contactCtaRow}>
            <a
              className="button button-primary"
              href={EMAIL_LINK?.href ?? "mailto:Parsaetak@gmail.com"}
            >
              Email Parsa Tak
            </a>

            {LINKEDIN_LINK && (
              <a
                className="button button-secondary"
                href={LINKEDIN_LINK.href}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn ↗
              </a>
            )}

            <a
              className="button button-secondary"
              href="https://github.com/Parsaetak"
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
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
