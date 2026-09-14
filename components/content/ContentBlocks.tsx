import type { ReactNode } from "react";

import { routeHref, type HubProject } from "@/lib/hubs";

import styles from "@/components/content/content.module.css";

/*
 * CONTENT BUILDING BLOCKS (v3.1) — small server components shared by
 * the content routes so every document renders the same section,
 * project, article-card and link-row vocabulary. All links are plain
 * anchors resolved through routeHref: external targets carry
 * rel="noreferrer", internal targets are basePath-aware and
 * crawlable without JavaScript.
 */

export function Section({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>

      <hr className={styles.sectionRule} />

      {children}
    </section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className={styles.body}>{children}</div>;
}

export function FocusList({
  items
}: {
  items: readonly { title: string; body: string }[];
}) {
  return (
    <div className={styles.focusList}>
      {items.map((item) => (
        <div key={item.title} className={styles.focusItem}>
          <h3 className={styles.focusItemTitle}>{item.title}</h3>

          <p className={styles.focusItemBody}>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function projectLinkTarget(href: string, external: boolean) {
  return external
    ? { href, target: "_blank", rel: "noreferrer" }
    : { href: routeHref(href) };
}

export function ProjectCardList({
  projects
}: {
  projects: readonly HubProject[];
}) {
  return (
    <div className={styles.projectList}>
      {projects.map((project) => (
        <article key={project.name} className={styles.projectCard}>
          <div className={styles.projectHead}>
            <h3 className={styles.projectName}>{project.name}</h3>

            <span className={styles.projectMeta}>{project.meta}</span>
          </div>

          <p className={styles.projectWhat}>{project.what}</p>

          <p className={styles.projectWhy}>
            <strong>Why it matters.</strong> {project.why}
          </p>

          <div className={styles.projectLinks}>
            {project.links.map((link) => (
              <a
                key={link.href}
                className={styles.projectLink}
                {...projectLinkTarget(link.href, link.external)}
              >
                {link.label}
                {link.external ? " ↗" : ""}
              </a>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

export type ArticleCardEntry = {
  slug: string;
  title: string;
  subtitle: string | null;
  date: string;
  readingTime: string;
  category: string;
};

/**
 * Descriptive card for a related article. The whole card is one
 * anchor whose accessible name is the article title — the anchor
 * text is the article's own name, never "read more".
 */
export function ArticleCard({
  article,
  note
}: {
  article: ArticleCardEntry;
  note?: string;
}) {
  return (
    <a
      className={styles.articleCard}
      href={routeHref(`/blog/${article.slug}/`)}
    >
      <h3 className={styles.articleCardTitle}>{article.title}</h3>

      {note && <p className={styles.articleCardNote}>{note}</p>}

      <p className={styles.articleCardMeta}>
        {article.category} · {article.date} · {article.readingTime}
      </p>
    </a>
  );
}

export type ContentLink = {
  label: string;
  href: string;
  note: string;
  external: boolean;
};

export function LinkCardRow({ links }: { links: readonly ContentLink[] }) {
  return (
    <div className={styles.linkRow}>
      {links.map((link) => (
        <a
          key={link.href}
          className={styles.linkCard}
          {...projectLinkTarget(link.href, link.external)}
        >
          <p className={styles.linkLabel}>
            {link.label}
            {link.external ? " ↗" : ""}
          </p>

          <p className={styles.linkNote}>{link.note}</p>
        </a>
      ))}
    </div>
  );
}

export function NextStep({
  text,
  links
}: {
  text: string;
  links: readonly ContentLink[];
}) {
  return (
    <div className={styles.nextStep}>
      <p className={styles.nextStepText}>{text}</p>

      <div className={styles.nextStepLinks}>
        {links.map((link) => (
          <a
            key={link.href}
            className={styles.nextStepLink}
            {...projectLinkTarget(link.href, link.external)}
          >
            {link.label}
            {link.external ? " ↗" : ""}

            <span className={styles.nextStepNote}> — {link.note}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
