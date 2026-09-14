import type { Metadata } from "next";

import {
  JsonLd,
  contentBreadcrumbEntity,
  contentWebPageEntity
} from "@/lib/seo";

import { RESEARCH_ROUTE, contentRouteMetadata, routeHref } from "@/lib/hubs";

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
 * /research/ (v3.2) — the research programme document.
 *
 * The primary-navigation RESEARCH destination. It is NOT a thin SEO
 * page: it states the research questions, the method, the frameworks,
 * the measurement programme, and — critically — it maps the six topic
 * hubs as the research territory, so every hub is one hop from the
 * primary navigation. Every claim links to a real artifact: a public
 * specification, a repository, or a field-note article.
 *
 * Structured data: one WebPage about the research topics, referencing
 * the stable site-wide @id anchors (never a duplicate Person).
 */

export const metadata: Metadata = contentRouteMetadata({
  route: RESEARCH_ROUTE.slug,
  title: RESEARCH_ROUTE.metaTitle,
  description: RESEARCH_ROUTE.metaDescription,
  ogAlt: "The research programme of Parsa Tak — reasoning, evaluation, local AI, AI systems"
});

/*
 * The research map: the six topic hubs, each paired with what the
 * programme actually does in that territory. These are the same six
 * hubs carried by the footer and the About page — listed here as the
 * primary way into the work.
 */
const RESEARCH_TERRITORY: readonly {
  name: string;
  href: string;
  what: string;
}[] = [
  {
    name: "AI systems",
    href: "/ai-systems/",
    what: "Governance, tools, and verification as one architecture — the AI Instructions constitution, governed agents, and engineering under constraints."
  },
  {
    name: "Local AI",
    href: "/local-ai/",
    what: "The whole intelligence stack on your own machine — managed llama.cpp inference, supervised agent loops, memory discipline, and local-first software beyond AI."
  },
  {
    name: "AI reasoning",
    href: "/ai-reasoning/",
    what: "Reasoning as a system property: the REP protocol, verification-first agent design, and reasoning claims that feed measurement instead of trusting themselves."
  },
  {
    name: "AI evaluation",
    href: "/ai-evaluation/",
    what: "Measurement before claims — the UHIT programme, the AIST-2026.09 standard, and the ASI-100-Elite benchmark, designed to be honest by construction."
  },
  {
    name: "Software engineering",
    href: "/software-engineering/",
    what: "The engineering the research depends on: bounded runtimes, honest tests, static architecture, and performance treated as a budget rather than a wish."
  },
  {
    name: "Creative technology",
    href: "/creative-technology/",
    what: "The expressive branch: the living web, the RED MAGIC organism, and technology treated as a medium rather than only a tool."
  }
];

const FRAMEWORKS: readonly { title: string; body: string }[] = [
  {
    title: "AI Instructions",
    body: "A five-tier constitutional operating framework for AI systems: instruction hierarchy, evidence handling, tools, context, security, memory, and self-governance — the governing layer above every other system here."
  },
  {
    title: "REP — Reasoning Enhancement Protocol",
    body: "Structures reasoning through decomposition, verification, critique, adversarial checking, uncertainty handling, and iterative refinement — a protocol the system enforces, independent of which model is attached."
  },
  {
    title: "USEF — Unified System Enhancement Framework",
    body: "The repeatable improvement loop: find weaknesses, redesign components, test consequences, measure results, and iterate systems over time."
  }
];

const MEASUREMENT: readonly { title: string; body: string }[] = [
  {
    title: "UHIT — Universal Human Intelligence Test",
    body: "The measurement programme behind the laboratory: an adaptive framework for measuring intelligence, reasoning, transfer, and human-AI performance."
  },
  {
    title: "AIST-2026.09",
    body: "The published standard realising UHIT — engineered items, multiplicative scoring, and verification as a load-bearing factor, so scores resist gaming."
  },
  {
    title: "ASI-100-Elite-2026.09",
    body: "The frontier benchmark of the programme — the elite band where claimed capability has to survive engineered verification."
  }
];

const SELECTED_ARTICLE_SLUGS: readonly string[] = [
  "reasoning-is-a-system-property",
  "measuring-machine-intelligence",
  "ai-instructions",
  "building-under-constraints"
];

export default function ResearchPage() {
  const metaList = getBlogMetaList();

  const selectedArticles = SELECTED_ARTICLE_SLUGS.map((slug) =>
    metaList.find((post) => post.slug === slug)
  ).filter((post): post is NonNullable<typeof post> => Boolean(post));

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Research", href: null }
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            contentWebPageEntity({
              route: `${RESEARCH_ROUTE.slug}/`,
              name: RESEARCH_ROUTE.metaTitle,
              description: RESEARCH_ROUTE.metaDescription,
              about: RESEARCH_TERRITORY.map((area) => ({
                "@type": "Thing",
                name: `${area.name} research`
              }))
            }),
            contentBreadcrumbEntity(`${RESEARCH_ROUTE.slug}/`, crumbs)
          ]
        }}
      />

      <ContentShell
        kicker="RESEARCH"
        title="Research"
        crumbs={crumbs}
        activeHref="/research/"
        lead={[
          "The research programme asks four questions: how should reasoning be structured so a system can inspect and correct it, how can AI capability be measured honestly, what does local-first AI make possible that cloud AI cannot, and how do AI systems stay governable as they grow?",
          "The programme is independent and artifact-first: research is answered with public specifications, working systems, and benchmarks rather than only papers — and every claim is marked as fact or analysis. The method is the same pipeline the systems follow: research → product direction → architecture → implementation → testing → verification → delivery."
        ]}
      >
        <Section title="The research map — six topic hubs">
          <Prose>
            <p>
              The territory is organised into six topic hubs. Each hub is a
              real document — it defines the area, lists the systems built
              in it, and connects the genuinely related writing. Start with
              the question that brought you here.
            </p>
          </Prose>

          <FocusList
            items={RESEARCH_TERRITORY.map((area) => ({
              title: area.name,
              body: area.what
            }))}
          />

          <LinkCardRow
            links={RESEARCH_TERRITORY.map((area) => ({
              label: `${area.name} topic hub`,
              href: area.href,
              note: "Definition, systems, and related writing",
              external: false
            }))}
          />
        </Section>

        <Section title="Frameworks">
          <Prose>
            <p>
              The frameworks are the programme&#39;s published answers so far.
              Each one is versioned as a public document and executed inside
              real systems — a framework that has never run a real task is a
              draft, and none of these stay drafts.
            </p>
          </Prose>

          <FocusList items={FRAMEWORKS} />

          <LinkCardRow
            links={[
              {
                label: "AI Instructions: the constitutional operating framework — article",
                href: "/blog/ai-instructions/",
                note: "The governing document and why systems need one",
                external: false
              },
              {
                label: "Reasoning Is a System Property — the REP article",
                href: "/blog/reasoning-is-a-system-property/",
                note: "The core argument behind the reasoning protocol",
                external: false
              },
              {
                label: "The Systems scene — the frameworks in one presentation",
                href: "/#systems",
                note: "The interactive view inside the living world",
                external: false
              }
            ]}
          />
        </Section>

        <Section title="Measurement">
          <Prose>
            <p>
              Evaluation is the programme&#39;s honesty mechanism. Capability
              claims outrun their evidence by default, so the measurement
              arm builds instruments before it publishes results: the
              specifications below are public, versioned, and open to
              replication.
            </p>
          </Prose>

          <FocusList items={MEASUREMENT} />

          <LinkCardRow
            links={[
              {
                label: "The AIST-2026.09 specification on GitHub",
                href: "https://github.com/Parsaetak/Contents/blob/AI-Tests/AIST-2026.09.md",
                note: "The published standard — items, scoring, verification",
                external: true
              },
              {
                label: "The ASI-100-Elite-2026.09 benchmark on GitHub",
                href: "https://github.com/Parsaetak/Contents/blob/AI-Tests/ASI-100-Elite-2026.09.md",
                note: "The elite band of the measurement programme",
                external: true
              },
              {
                label: "The AI evaluation topic hub",
                href: "/ai-evaluation/",
                note: "How the instruments fit the wider programme",
                external: false
              }
            ]}
          />
        </Section>

        <Section title="Selected research writing">
          <Prose>
            <p>
              The arguments, in long form. These four articles carry the
              programme&#39;s core positions and their engineering consequences;
              the full catalogue lives in the{" "}
              <a href={routeHref("/blog/")}>writing index</a>.
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

        <Section title="Where research goes next">
          <Prose>
            <p>
              The programme continues on two fronts: extending the
              measurement instruments (more engineered items, harder
              elite bands, replication tooling) and deepening the systems
              that execute the frameworks — SHEYTAN&#39;s verification gates
              above all. Collaboration on either front is welcome; the
              contact page separates the academic and business channels.
            </p>
          </Prose>

          <LinkCardRow
            links={[
              {
                label: "Contact — research collaboration",
                href: "/contact/",
                note: "Academic/research and business/engineering channels",
                external: false
              },
              {
                label: "Selected Work — the systems behind the research",
                href: "/work/",
                note: "What is built, why it matters, where it lives",
                external: false
              }
            ]}
          />
        </Section>
      </ContentShell>
    </>
  );
}
