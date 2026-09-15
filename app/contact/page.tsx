import type { Metadata } from "next";

import {
  JsonLd,
  PERSON_ID,
  contentBreadcrumbEntity,
  contentWebPageEntity
} from "@/lib/seo";

import { CONTACT_ROUTE, contentRouteMetadata, routeHref } from "@/lib/hubs";

import { EMAIL_LINK, LINKEDIN_LINK } from "@/lib/links";

import ContentShell from "@/components/content/ContentShell";

import { FocusList, LinkCardRow, Prose, Section } from "@/components/content/ContentBlocks";

import styles from "@/components/content/content.module.css";

/*
 * /contact/ (v3.2) — the single, honest contact document.
 *
 * Design laws:
 * - One primary CTA: Email Parsa Tak. The mailto is resolved from
 *   lib/links.ts (the site's verified link source of truth) — the
 *   address is never duplicated as a separate constant.
 * - Secondary channels: GitHub and LinkedIn. No backend, no form, no
 *   tracking: contact is plain, crawlable anchors.
 * - Collaboration types are separated the way inquiries actually
 *   arrive: academic/research, business/engineering, project
 *   collaboration, and open technical collaboration.
 * - Structured data: one WebPage whose `about` references the
 *   site-wide Person @id — the Person node itself is never
 *   duplicated.
 */

export const metadata: Metadata = contentRouteMetadata({
  route: CONTACT_ROUTE.slug,
  title: CONTACT_ROUTE.metaTitle,
  description: CONTACT_ROUTE.metaDescription,
  ogAlt: "Contact Parsa Tak — research collaboration, engineering engagements, projects"
});

const COLLABORATION_TYPES: readonly { title: string; body: string }[] = [
  {
    title: "Academic / research",
    body: "Reasoning architectures, AI evaluation and benchmarking, local-first AI, AI system governance. Replication attempts, methodological criticism, and joint evaluation work are welcome — the specifications (AIST-2026.09, ASI-100-Elite) are public and open to scrutiny."
  },
  {
    title: "Business / engineering",
    body: "AI systems and local agents, model and system evaluation, fast static web engineering, and architecture reviews before commitments harden. Name the problem, the constraints, and the timeline; a short answer — including 'not a good fit' when true — comes back quickly."
  },
  {
    title: "Project collaboration",
    body: "SHEYTAN, FreeIran, WEB, and the Contents repository accept issue reports, patches, and specification feedback through GitHub. For anything that needs discussion before code, open an issue first, then follow up by email."
  },
  {
    title: "Open technical collaboration",
    body: "Practitioners working on reasoning, evaluation, and local AI infrastructures — comparisons, benchmarks, critiques, and build logs are the useful currency. Public channels (GitHub, the community links on the About page) are the right first stop for open discussion."
  }
];

export default function ContactPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Contact", href: null }
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            contentWebPageEntity({
              route: `${CONTACT_ROUTE.slug}/`,
              name: CONTACT_ROUTE.metaTitle,
              description: CONTACT_ROUTE.metaDescription,
              about: { "@id": PERSON_ID }
            }),
            contentBreadcrumbEntity(`${CONTACT_ROUTE.slug}/`, crumbs)
          ]
        }}
      />

      <ContentShell
        kicker="CONTACT"
        title="Contact"
        crumbs={crumbs}
        activeHref="/contact/"
        lead={[
          "I am an independent software engineer, product builder, and AI systems researcher. Inquiries about research collaboration, engineering engagements, project contributions, and open technical collaboration all reach me in one place — and the fastest one is a direct email.",
          "There is no form and no backend on this page: contact is a plain mailto link you can see and verify, plus the public profiles where the work already lives."
        ]}
      >
        <Section title="Email Parsa Tak">
          <Prose>
            <p>
              Email is the primary channel — every collaboration type below
              starts there. A useful first message says who you are, what
              you want to build or investigate, and what a good outcome
              would look like; anything that can be answered in a short
              reply gets one.
            </p>
          </Prose>

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

          <Prose>
            <p>
              The address is also published in the site footer and in the
              public link hub — it is the same verified channel everywhere,
              never a different inbox.
            </p>
          </Prose>
        </Section>

        <Section title="What the collaboration types are">
          <FocusList items={COLLABORATION_TYPES} />

          <LinkCardRow
            links={[
              {
                label: "Selected Work — what has already been built",
                href: "/work/",
                note: "The systems, the problems they solve, and the repositories",
                external: false
              },
              {
                label: "Research — the specifications and frameworks",
                href: "/research/",
                note: "AIST-2026.09, ASI-100-Elite, REP, AI Instructions, USEF",
                external: false
              },
              {
                label: "About — the working method",
                href: "/about/",
                note: "Research, engineering, product building, and the pipeline",
                external: false
              }
            ]}
          />
        </Section>

        <Section title="Before writing">
          <Prose>
            <p>
              A few things make first messages productive. For research: name
              the specification, benchmark, or claim you want to examine —
              the artifacts are public, so the conversation can start from
              evidence instead of summaries. For engineering: describe the
              system boundary and the constraints (local-first, no telemetry,
              offline behaviour) that matter to you, because those decisions
              shape everything downstream. For projects: open a GitHub issue
              with a reproduction or a spec proposal before writing a patch.
            </p>
            <p>
              Response is manual and human on both ends — there are no
              autoresponders, no sales sequences, and no tracking pixels on
              this site.
            </p>
          </Prose>
        </Section>
      </ContentShell>
    </>
  );
}
