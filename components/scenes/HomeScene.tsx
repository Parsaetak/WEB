import Link from "next/link";

import PublicLinks from "@/components/PublicLinks";
import HomeOriginOrganism from "@/components/HomeOriginOrganism";
import { GITHUB_LINK } from "@/lib/links";

import { formatBlogDate } from "@/lib/blogFormat";

import type { ReactNode } from "react";

import type { HomeWritingPost } from "@/lib/homeWriting";

import styles from "./HomeScene.module.css";

/*
 * HOME SCENE — the statically rendered home page.
 *
 * The file reads as the page narrative, top to bottom:
 *   Hero → Capabilities → Featured Work → Method → Systems →
 *   Writing → Direction → Connect
 *
 * Static-render law: this component renders synchronously into the
 * exported HTML (see SceneRegistry), so everything below is what
 * crawlers and no-JS visitors receive. Two boundaries keep it that
 * way:
 * - the organism is a CSS seed here; the canvas system loads at
 *   idle time through HomeOriginOrganism, never on the critical
 *   path;
 * - writing metadata arrives as serializable props from the server
 *   (app/page.tsx → lib/homeWriting). This module must never import
 *   lib/blog directly — posts.json contains article HTML and must
 *   never enter the client bundle.
 */

/*
 * Verified capability set: each line names work that actually
 * exists in the public repository ecosystem (SHEYTAN, UHIT/AIST,
 * FreeIran, the framework family, this website, RED MAGIC).
 */
const capabilities = [
  {
    number: "01",
    title: "AI systems",
    copy:
      "Designing and building AI systems end to end: agent loops, controlled tools, context engineering, and verification gates."
  },
  {
    number: "02",
    title: "Reasoning & evaluation",
    copy:
      "Structuring how systems think: decomposition, critique, adversarial checking, and measurable benchmarks like AIST and ASI-100."
  },
  {
    number: "03",
    title: "Software engineering",
    copy:
      "Shipping real software in Go, TypeScript, and React — architecture, tests, regression suites, and maintainable runtimes."
  },
  {
    number: "04",
    title: "Local AI & agents",
    copy:
      "Running intelligence locally: managed llama.cpp inference, supervised agent loops, memory, and isolated workspaces."
  },
  {
    number: "05",
    title: "System architecture",
    copy:
      "Designing systems that hold: process supervision, state, bounded restarts, and deliberate evolution paths."
  },
  {
    number: "06",
    title: "Research frameworks",
    copy:
      "Turning research into frameworks: AI Instructions, REP, and USEF — governance, reasoning, and system improvement."
  },
  {
    number: "07",
    title: "Web engineering",
    copy:
      "Engineering the web: static-first Next.js, performance budgets, accessibility, and honest, crawlable SEO."
  },
  {
    number: "08",
    title: "Creative technology",
    copy:
      "Making technology expressive: canvas organisms, living interfaces, simulation, and generative art."
  }
] as const;

/*
 * Featured projects — the highest-signal public work, verified
 * against the actual repositories. Each card names WHAT IT IS,
 * WHAT PROBLEM IT ADDRESSES, and WHERE TO SEE IT (repository +
 * field notes article). The full portfolio lives in the Work scene.
 */
type FeaturedProject = {
  number: string;
  code: string;
  title: string;
  category: string;
  copy: string;
  tags: readonly string[];
  repository?: string;
  repositoryLabel?: string;
  liveHref?: string;
  liveLabel?: string;
  notesHref: string;
  notesLabel: string;
  image: {
    src: string;
    alt: string;
    width: 1200;
    height: 630;
  };
};

/* Generated artwork is served from the static export. */
const PROJECT_IMAGE_BASE = `${
  process.env.NEXT_PUBLIC_BASE_PATH ?? ""
}/images/projects`;

const featuredProjects: readonly FeaturedProject[] = [
  {
    number: "01",
    code: "SHEYTAN",
    title: "SHEYTAN Local Agent",
    category: "LOCAL-FIRST AI LABORATORY",
    copy:
      "A desktop AI engineering laboratory: managed llama.cpp inference, a real agent loop, isolated coding workspaces, and objective verification — all running locally.",
    tags: ["GO", "WAILS", "LLAMA.CPP"],
    repository: "https://github.com/Parsaetak/SHEYTAN-local-agent",
    repositoryLabel: "GitHub ↗",
    notesHref: "/blog/sheytan-the-local-first-laboratory/",
    notesLabel: "Field notes",
    image: {
      src: `${PROJECT_IMAGE_BASE}/sheytan-agent-lab.svg`,
      alt: "Abstract diagram of the SHEYTAN local agent laboratory: a framed local workspace containing a four-stage agent loop — plan, act, verify, remember — orbiting a red 13-point core",
      width: 1200,
      height: 630
    }
  },
  {
    number: "02",
    code: "UHIT",
    title: "Universal Human Intelligence Test",
    category: "INTELLIGENCE MEASUREMENT",
    copy:
      "The measurement programme behind this laboratory: UHIT — the Universal Human Intelligence Test — realised as the AIST-2026.09 standard and the ASI-100-Elite benchmark, built on verified operational intelligence.",
    tags: ["AIST", "ASI-100", "VERIFICATION"],
    repository: "https://github.com/Parsaetak/Contents/tree/AI-Tests",
    repositoryLabel: "Specifications ↗",
    notesHref: "/blog/measuring-machine-intelligence/",
    notesLabel: "Field notes",
    image: {
      src: `${PROJECT_IMAGE_BASE}/uhit-intelligence-scale.svg`,
      alt: "Abstract measurement artwork for UHIT: a rising scale of evaluation bars under a dashed elite threshold, one result ringed and marked in red",
      width: 1200,
      height: 630
    }
  },
  {
    number: "03",
    code: "FREEIRAN",
    title: "FreeIran",
    category: "OPEN-SOURCE VPN MANAGER",
    copy:
      "A free, open-source VPN configuration manager for Windows: a Go multi-core runtime that discovers, tests, maintains, and runs public proxy configurations.",
    tags: ["GO", "XRAY", "V2RAY"],
    repository: "https://github.com/Parsaetak/FreeIran",
    repositoryLabel: "GitHub ↗",
    notesHref: "/blog/freeiran-engineering-notes/",
    notesLabel: "Engineering notes",
    image: {
      src: `${PROJECT_IMAGE_BASE}/freeiran-vpn-mesh.svg`,
      alt: "Abstract mesh artwork for FreeIran: a field of proxy network nodes with two bright routing tunnels crossing it toward a highlighted client node",
      width: 1200,
      height: 630
    }
  },
  {
    number: "04",
    code: "RED MAGIC",
    title: "RED MAGIC",
    category: "COMPUTATIONAL ORGANISM",
    copy:
      "A living canvas organism that turns this website into a computational experiment — adaptation, perception, and visible state on every page.",
    tags: ["CANVAS", "ADAPTATION"],
    liveHref: "#magic",
    liveLabel: "Live experiment",
    notesHref: "/blog/why-the-website-is-a-living-system/",
    notesLabel: "Article",
    image: {
      src: `${PROJECT_IMAGE_BASE}/red-magic-organism.svg`,
      alt: "Abstract artwork of the RED MAGIC computational organism: a red nucleus inside three breathing membranes with flow currents and orbiting signal particles",
      width: 1200,
      height: 630
    }
  },
  {
    number: "05",
    code: "WEB",
    title: "This website",
    category: "STATIC LIVING SYSTEM",
    copy:
      "The site you are reading: a statically exported Next.js application that behaves like a living system — six scenes, a markdown-driven blog, and a generated SEO graph.",
    tags: ["NEXT.JS", "REACT", "STATIC EXPORT"],
    repository: "https://github.com/Parsaetak/WEB",
    repositoryLabel: "GitHub ↗",
    notesHref: "/blog/the-anatomy-of-a-fast-static-site/",
    notesLabel: "How it works",
    image: {
      src: `${PROJECT_IMAGE_BASE}/web-static-living-system.svg`,
      alt: "Abstract diagram of this website as a static living system: a red 13-point identity core linking six world scenes and a chained blog route tree",
      width: 1200,
      height: 630
    }
  }
];

/*
 * The working loop, stated in human language. These stages are the
 * discipline the repository's own history demonstrates: understand
 * before building, verify before shipping, evaluate after delivery.
 */
const workflowStages = [
  {
    label: "UNDERSTAND",
    copy:
      "Read the problem, the constraints, and the real goal before anything else."
  },
  {
    label: "COMPILE",
    copy:
      "Gather the material: sources, prior work, and the actual current state."
  },
  {
    label: "ASSESS",
    copy:
      "Judge what is true, what is missing, and where the real risks are."
  },
  {
    label: "PLAN",
    copy:
      "Define the smallest change that produces a verifiable result."
  },
  {
    label: "ACT",
    copy:
      "Implement it as one coherent, reviewable step."
  },
  {
    label: "VERIFY",
    copy:
      "Test the result against reality: build, run, inspect, measure."
  },
  {
    label: "SYNTHESIZE",
    copy:
      "Fold what was learned back into the system and its documentation."
  },
  {
    label: "DELIVER",
    copy:
      "Ship it clean: static build, verified export, documented state."
  },
  {
    label: "EVALUATE",
    copy:
      "Check the outcome after delivery and feed the next cycle."
  }
] as const;

/*
 * Each framework row links somewhere real: AI INSTRUCTIONS has a
 * dedicated deep-dive article (a real /blog route); REP and USEF
 * point to the Systems scene, which is where their full
 * presentation lives today. `scene` marks which kind of link it is —
 * scene hashes are plain anchors handled by the world shell, routes
 * are next/link clients.
 */
type HomeSystem = {
  number: string;
  title: string;
  copy: string;
  href: string;
  scene: boolean;
};

const systems: readonly HomeSystem[] = [
  {
    number: "01",
    title: "AI INSTRUCTIONS",
    copy: "A framework for governing intelligent systems.",
    href: "/blog/ai-instructions/",
    scene: false
  },
  {
    number: "02",
    title: "REP",
    copy: "A framework for stronger reasoning and verification.",
    href: "#systems",
    scene: true
  },
  {
    number: "03",
    title: "USEF",
    copy: "A framework for improving systems over time.",
    href: "#systems",
    scene: true
  }
];

const directionStages = [
  {
    label: "RESEARCH",
    copy: "Explore intelligence, reasoning, and systems."
  },
  {
    label: "EXPERIMENT",
    copy:
      "Turn research into software, frameworks, simulations, and art."
  },
  {
    label: "BETTER INTELLIGENCE",
    copy:
      "Build systems that are measurable, testable, and improvable."
  }
] as const;

/*
 * Shared section intro: kicker + section title on the left, section
 * lead on the right. The Systems section uses a tighter variant,
 * selected through the optional class overrides.
 */
function HomeSectionIntro({
  kicker,
  title,
  lead,
  className = styles.homeSectionIntro,
  leadClassName = `body-large ${styles.homeSectionLead}`
}: {
  kicker: string;
  title: ReactNode;
  lead: ReactNode;
  className?: string;
  leadClassName?: string;
}) {
  return (
    <div className={className}>
      <div>
        <p className="kicker">{kicker}</p>

        <h2 className="section-title">{title}</h2>
      </div>

      <p className={leadClassName}>{lead}</p>
    </div>
  );
}

/*
 * One featured-project card. Kept as a unit because the meta row,
 * the body, the link set, and the artwork describe one coherent
 * thing: a project. The artwork carries intrinsic 1200×630
 * dimensions (no layout shift), lazy-loads because the section is
 * below the hero, and its alt text describes exactly what is drawn —
 * the images are generated diagrams, never fake screenshots.
 */
function HomeProjectCard({ project }: { project: FeaturedProject }) {
  return (
    <article className={styles.homeProject} key={project.number}>
      <div className={styles.homeProjectMeta}>
        <span className={styles.homeProjectNumber}>{project.number}</span>

        <span className={styles.homeProjectCategory}>{project.category}</span>
      </div>

      <div className={styles.homeProjectMain}>
        <h3 className={styles.homeProjectTitle}>{project.title}</h3>

        <p className={styles.homeProjectCopy}>{project.copy}</p>

        <div className={styles.homeProjectTags}>
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <div className={styles.homeProjectLinks}>
          {project.repository && (
            <a
              className={styles.homeProjectLink}
              href={project.repository}
              target="_blank"
              rel="noreferrer"
            >
              {project.repositoryLabel}
            </a>
          )}

          {project.liveHref && (
            <a className={styles.homeProjectLink} href={project.liveHref}>
              {project.liveLabel}
              <span aria-hidden="true"> →</span>
            </a>
          )}

          <Link
            className={styles.homeProjectLink}
            href={project.notesHref}
            prefetch={false}
          >
            {project.notesLabel}
            <span aria-hidden="true"> →</span>
          </Link>
        </div>
      </div>

      <div className={styles.homeProjectVisual}>
        <img
          src={project.image.src}
          alt={project.image.alt}
          width={project.image.width}
          height={project.image.height}
          loading="lazy"
          decoding="async"
        />
      </div>
    </article>
  );
}

/*
 * One framework row. Scene hashes render as plain anchors — the
 * world shell owns hash navigation; real routes render as
 * next/link with prefetch disabled (blog payloads load on intent,
 * not on hover past).
 */
function HomeSystemItem({ system }: { system: HomeSystem }) {
  const body = (
    <>
      <span className={styles.homeSystemItemNumber}>{system.number}</span>

      <div>
        <h3>{system.title}</h3>

        <p>{system.copy}</p>
      </div>

      <span className={styles.homeSystemItemArrow} aria-hidden="true">
        →
      </span>
    </>
  );

  if (system.scene) {
    return (
      <a className={styles.homeSystemItem} href={system.href}>
        {body}
      </a>
    );
  }

  return (
    <Link className={styles.homeSystemItem} href={system.href} prefetch={false}>
      {body}
    </Link>
  );
}

/*
 * One writing entry — the server-selected article metadata rendered
 * as a single link to its real /blog route.
 */
function HomeWritingItem({
  post,
  index
}: {
  post: HomeWritingPost;
  index: number;
}) {
  return (
    <Link
      className={styles.homeWritingItem}
      href={`/blog/${post.slug}/`}
      prefetch={false}
    >
      <span className={styles.homeWritingMeta}>
        <span className={styles.homeWritingNumber}>
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className={styles.homeWritingCategory}>{post.category}</span>

        <span className={styles.homeWritingDate}>
          {formatBlogDate(post.date)}
        </span>
      </span>

      <span className={styles.homeWritingMain}>
        <strong className={styles.homeWritingTitle}>{post.title}</strong>

        <span className={styles.homeWritingExcerpt}>{post.excerpt}</span>

        <span className={styles.homeWritingFoot}>
          <span>{post.readingTime}</span>

          {post.inbound > 0 && (
            <span>
              ↩ {post.inbound}{" "}
              {post.inbound === 1 ? "reference" : "references"}
            </span>
          )}
        </span>
      </span>

      <span className={styles.homeWritingArrow} aria-hidden="true">
        →
      </span>
    </Link>
  );
}

export default function HomeScene({
  writingPosts = []
}: {
  /*
   * SERVER-SIDE WRITING SELECTION: serializable article metadata
   * computed in app/page.tsx. See the module comment for the import
   * boundary this props bridge exists to protect.
   */
  writingPosts?: readonly HomeWritingPost[];
}) {
  const github = GITHUB_LINK;

  return (
    <div className={styles.homeScene}>
      {/* ---------------------------------------------------- HERO */}
      <section className={`hero ${styles.homeOrigin}`}>
        <div
          className={styles.homeOriginGrid}
          aria-hidden="true"
        >
          <span
            className={`${styles.homeOriginRing} ${styles.homeOriginRingOne}`}
          />

          <span
            className={`${styles.homeOriginRing} ${styles.homeOriginRingTwo}`}
          />

          <span
            className={`${styles.homeOriginRing} ${styles.homeOriginRingThree}`}
          />

          <span
            className={`${styles.homeOriginAxis} ${styles.homeOriginAxisX}`}
          />

          <span
            className={`${styles.homeOriginAxis} ${styles.homeOriginAxisY}`}
          />

          <span
            className={`${styles.homeOriginCross} ${styles.homeOriginCrossOne}`}
          />

          <span
            className={`${styles.homeOriginCross} ${styles.homeOriginCrossTwo}`}
          />

          <span
            className={`${styles.homeOriginCross} ${styles.homeOriginCrossThree}`}
          />
        </div>

        <div
          className={styles.homeOriginMagicBackground}
          aria-hidden="true"
        >
          <div className={styles.homeOriginMagicVignette} />

          <div className={styles.homeOriginMagicOrganism}>
            {/*
              * The organism loads lazily at idle time through
              * HomeOriginOrganism; the exported HTML carries the
              * CSS-only seed instead of a canvas dependency.
              */}
            <HomeOriginOrganism />
          </div>
        </div>

        <div
          className={`page-container hero-grid ${styles.homeOriginContent}`}
        >
          <div className={`hero-copy ${styles.homeOriginCopy}`}>
            <div className="hero-status">
              <span className="status-dot" aria-hidden="true" />

              <span>ACTIVE</span>
            </div>

            <p className="kicker">
              PARSA TAK — RESEARCHER · BUILDER · PROGRAMMER · WRITER · ARTIST
            </p>

            <h1 className={`hero-title ${styles.homeIdentityTitle}`}>
              AI systems
              <br />
              Reasoning
              <br />
              Software
              <br />
              Art
            </h1>

            <p
              className={`body-large hero-description ${styles.homeIdentityLead}`}
            >
              I research intelligence, build reasoning frameworks and local
              AI agents, engineer software, and turn the work into research,
              writing, experiments, and art.
            </p>

            <div className={`hero-actions ${styles.homeOriginActions}`}>
              <a className="button button-primary" href="#work">
                Explore the work ↓
              </a>

              {github && (
                <a
                  className="button button-secondary"
                  href={github.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub ↗
                </a>
              )}
            </div>
          </div>
        </div>

        <div className={styles.homeOriginFoot}>
          <span>SCROLL TO EXPLORE</span>

          <span
            className={styles.homeOriginFootLine}
            aria-hidden="true"
          />
        </div>
      </section>

      {/* -------------------------------------------- CAPABILITIES */}
      <section className={`section ${styles.homeCapabilities}`}>
        <div className="page-container">
          <HomeSectionIntro
            kicker="CAPABILITIES"
            title="What I can do"
            lead="Capabilities backed by shipped systems — not aspirations. Each one is demonstrated by public work you can inspect."
          />

          <div
            className={styles.homeCapabilityGrid}
            aria-label="Core capabilities"
          >
            {capabilities.map((capability) => (
              <div
                className={styles.homeCapability}
                key={capability.number}
              >
                <span className={styles.homeCapabilityNumber}>
                  {capability.number}
                </span>

                <h3>{capability.title}</h3>

                <p>{capability.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------- FEATURED WORK */}
      <section className={`section ${styles.homeProjects}`}>
        <div className="page-container">
          <HomeSectionIntro
            kicker="FEATURED WORK"
            title={
              <>
                What I have
                <br />
                actually built
              </>
            }
            lead="Real projects with real destinations — every repository, article, and experiment below exists and is publicly reachable."
          />

          <div
            className={styles.homeProjectList}
            aria-label="Featured projects"
          >
            {featuredProjects.map((project) => (
              <HomeProjectCard
                key={project.number}
                project={project}
              />
            ))}
          </div>

          <a className={styles.homeProjectArchive} href="#work">
            <span>FULL PORTFOLIO</span>

            <strong>
              Open the Work scene
              <span aria-hidden="true"> →</span>
            </strong>
          </a>
        </div>
      </section>

      {/* ------------------------------------------------- METHOD */}
      <section className={`section ${styles.homeWorkflow}`}>
        <div className="page-container">
          <HomeSectionIntro
            kicker="METHOD"
            title="How I work"
            lead="One disciplined loop, applied to research, software, and art — understand before building, verify before shipping, evaluate after delivery."
          />

          <div
            className={styles.homeWorkflowGrid}
            aria-label="Working method"
          >
            {workflowStages.map((stage, index) => (
              <div
                className={styles.homeWorkflowStage}
                key={stage.label}
              >
                <div className={styles.homeWorkflowStageHead}>
                  <span className={styles.homeWorkflowStageIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <strong>{stage.label}</strong>

                  {index < workflowStages.length - 1 && (
                    <span
                      className={styles.homeWorkflowStageArrow}
                      aria-hidden="true"
                    >
                      →
                    </span>
                  )}
                </div>

                <p className={styles.homeWorkflowStageCopy}>{stage.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ SYSTEMS */}
      <section className={`section ${styles.homeSystems}`}>
        <div className="page-container">
          <HomeSectionIntro
            kicker="WHAT I BUILD"
            title={
              <>
                Ideas
                <br />
                made concrete
              </>
            }
            lead="I turn research into frameworks, software, experiments, simulations, and other working systems."
            className={styles.homeSystemsIntro}
            leadClassName={`body ${styles.homeSystemsCopy}`}
          />

          <div className={styles.homeSystemsOverview}>
            <a
              className={styles.homeSystemsOverviewLink}
              href="#systems"
              aria-label="Open the Systems scene"
            >
              <div className={styles.homeSystemsOverviewLabel}>
                <span>SYSTEMS</span>

                <span>03</span>
              </div>

              <strong>
                <span>AI</span>

                <i>·</i>

                <span>REASONING</span>

                <i>·</i>

                <span>SYSTEMS</span>
              </strong>

              <span
                className={styles.homeSystemsOverviewArrow}
                aria-hidden="true"
              >
                →
              </span>
            </a>
          </div>

          <div className={styles.homeSystemList}>
            {systems.map((system) => (
              <HomeSystemItem key={system.number} system={system} />
            ))}
          </div>
        </div>
      </section>

      {/*
        * WRITING — the home scene's bridge into the knowledge graph.
        * The entries are selected on the server from the real content
        * index: the featured article first, then the most internally
        * referenced. Everything links to a real route.
        */}
      {writingPosts.length > 0 && (
        <section className={`section ${styles.homeWriting}`}>
          <div className="page-container">
            <HomeSectionIntro
              kicker="WRITING"
              title={
                <>
                  Field notes
                  <br />
                  from the laboratory
                </>
              }
              lead="Research, engineering, and the reasoning behind the systems — written down and connected, not left in commit logs."
            />

            <div
              className={styles.homeWritingList}
              aria-label="Selected writing"
            >
              {writingPosts.map((post, index) => (
                <HomeWritingItem key={post.slug} post={post} index={index} />
              ))}
            </div>

            <Link
              className={styles.homeWritingArchive}
              href="/blog/"
              prefetch={false}
            >
              <span>ALL WRITING</span>

              <strong>
                Open the Blog
                <span aria-hidden="true"> →</span>
              </strong>
            </Link>
          </div>
        </section>
      )}

      {/* ---------------------------------------------- DIRECTION */}
      <section className={`section ${styles.homeDirection}`}>
        <div className="page-container">
          <div className={styles.homeDirectionGrid}>
            <div className={styles.homeDirectionHeading}>
              <p className="kicker">DIRECTION</p>

              <h2 className="section-title">
                Understand
                <br />
                intelligence
                <br />
                Build better systems
              </h2>
            </div>

            <div className={styles.homeDirectionCopy}>
              <p className="body-large">
                The work is an ongoing attempt to understand intelligence,
                strengthen reasoning, and turn ideas into systems that can
                be tested and improved.
              </p>

              <div className={styles.homeDirectionStages}>
                {directionStages.map((stage, index) => (
                  <div
                    className={styles.homeDirectionStage}
                    key={stage.label}
                  >
                    <div className={styles.homeDirectionStageMain}>
                      <div className={styles.homeDirectionStageIndex}>
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div>
                        <strong>{stage.label}</strong>

                        <p>{stage.copy}</p>
                      </div>
                    </div>

                    {index < directionStages.length - 1 && (
                      <span
                        className={styles.homeDirectionStageArrow}
                        aria-hidden="true"
                      >
                        →
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- CONNECT */}
      <section className={`section ${styles.homeFinal}`}>
        <div className="page-container">
          <div className={styles.homeFinalFrame}>
            <div>
              <p className="kicker">KEEP EXPLORING</p>

              <h2 className="section-title">
                Research
                <br />
                Build
                <br />
                Repeat
              </h2>
            </div>

            <p className="body-large">
              The website is a living index of the systems, experiments,
              writing, and art that come out of that process.
            </p>
          </div>
        </div>
      </section>

      <PublicLinks compact title="CONNECT" />
    </div>
  );
}
