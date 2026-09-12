import Link from "next/link";

import PublicLinks from "@/components/PublicLinks";
import RedMagic from "@/components/RedMagic";
import { GITHUB_LINK } from "@/lib/links";

import styles from "./HomeScene.module.css";

/*
 * HOME SCENE (v2.7) — information priority redesign.
 *
 * Section order follows the visitor's information need, not the
 * author's curiosity: identity and capability first (hero), what I
 * can do second (capabilities grid), what I have actually built
 * third (featured projects), how I work fourth (workflow), and only
 * then the conceptual material (frameworks, direction). Every
 * capability is backed by shipped work; every project link is real
 * (GitHub repository, blog field notes, or live scene); every
 * workflow stage is the loop the repository itself demonstrates.
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
};

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
    notesLabel: "Field notes"
  },
  {
    number: "02",
    code: "UHIT",
    title: "Universal Human Intelligence Test",
    category: "INTELLIGENCE MEASUREMENT",
    copy:
      "The measurement programme behind this laboratory: the AIST-2026.09 standard and the ASI-100-Elite benchmark, built on verified operational intelligence.",
    tags: ["AIST", "ASI-100", "VERIFICATION"],
    repository: "https://github.com/Parsaetak/Contents/tree/AI-Tests",
    repositoryLabel: "Specifications ↗",
    notesHref: "/blog/measuring-machine-intelligence/",
    notesLabel: "Field notes"
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
    notesLabel: "Engineering notes"
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
    notesLabel: "Article"
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
    notesLabel: "How it works"
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
 * dedicated deep-dive article (mirroring the Systems scene's
 * convention); REP and USEF point to the Systems scene, which is
 * where their full presentation lives today.
 */
const systems = [
  {
    number: "01",
    title: "AI INSTRUCTIONS",
    copy:
      "A framework for governing intelligent systems.",
    href: "/blog/ai-instructions/",
    scene: false
  },
  {
    number: "02",
    title: "REP",
    copy:
      "A framework for stronger reasoning and verification.",
    href: "#systems",
    scene: true
  },
  {
    number: "03",
    title: "USEF",
    copy:
      "A framework for improving systems over time.",
    href: "#systems",
    scene: true
  }
] as const;

const directionStages = [
  {
    label: "RESEARCH",
    copy:
      "Explore intelligence, reasoning, and systems."
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

export default function HomeScene() {
  const github = GITHUB_LINK;

  return (
    <div className={styles.homeScene}>
      <section
        className={`hero ${styles.homeOrigin}`}
      >
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
          <div
            className={styles.homeOriginMagicVignette}
          />

          <div
            className={styles.homeOriginMagicOrganism}
          >
            <RedMagic />
          </div>
        </div>

        <div
          className={`page-container hero-grid ${styles.homeOriginContent}`}
        >
          <div
            className={`hero-copy ${styles.homeOriginCopy}`}
          >
            <div className="hero-status">
              <span
                className="status-dot"
                aria-hidden="true"
              />

              <span>
                ACTIVE
              </span>
            </div>

            <p className="kicker">
              PARSA TAK — RESEARCHER ·
              BUILDER · PROGRAMMER ·
              WRITER · ARTIST
            </p>

            <h1
              className={`hero-title ${styles.homeIdentityTitle}`}
            >
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
              I research intelligence, build{" "}
              reasoning frameworks and local AI
              agents, engineer software, and turn
              the work into research, writing,
              experiments, and art.
            </p>

            <div
              className={`hero-actions ${styles.homeOriginActions}`}
            >
              <a
                className="button button-primary"
                href="#work"
              >
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

        <div
          className={styles.homeOriginFoot}
        >
          <span>
            SCROLL TO EXPLORE
          </span>

          <span
            className={styles.homeOriginFootLine}
            aria-hidden="true"
          />
        </div>
      </section>

      <section
        className={`section ${styles.homeCapabilities}`}
      >
        <div className="page-container">
          <div className={styles.homeSectionIntro}>
            <div>
              <p className="kicker">
                CAPABILITIES
              </p>

              <h2 className="section-title">
                What I can do
              </h2>
            </div>

            <p
              className={`body-large ${styles.homeSectionLead}`}
            >
              Capabilities backed by shipped
              systems — not aspirations. Each
              one is demonstrated by public
              work you can inspect.
            </p>
          </div>

          <div
            className={styles.homeCapabilityGrid}
            aria-label="Core capabilities"
          >
            {capabilities.map(
              (capability) => (
                <div
                  className={
                    styles.homeCapability
                  }
                  key={capability.number}
                >
                  <span
                    className={
                      styles.homeCapabilityNumber
                    }
                  >
                    {capability.number}
                  </span>

                  <h3>
                    {capability.title}
                  </h3>

                  <p>
                    {capability.copy}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section
        className={`section ${styles.homeProjects}`}
      >
        <div className="page-container">
          <div className={styles.homeSectionIntro}>
            <div>
              <p className="kicker">
                FEATURED WORK
              </p>

              <h2 className="section-title">
                What I have
                <br />
                actually built
              </h2>
            </div>

            <p
              className={`body-large ${styles.homeSectionLead}`}
            >
              Real projects with real
              destinations — every repository,
              article, and experiment below
              exists and is publicly reachable.
            </p>
          </div>

          <div
            className={styles.homeProjectList}
            aria-label="Featured projects"
          >
            {featuredProjects.map(
              (project) => (
                <article
                  className={
                    styles.homeProject
                  }
                  key={project.number}
                >
                  <div
                    className={
                      styles.homeProjectMeta
                    }
                  >
                    <span
                      className={
                        styles.homeProjectNumber
                      }
                    >
                      {project.number}
                    </span>

                    <span
                      className={
                        styles.homeProjectCategory
                      }
                    >
                      {project.category}
                    </span>
                  </div>

                  <div
                    className={
                      styles.homeProjectMain
                    }
                  >
                  <h3
                    className={
                      styles.homeProjectTitle
                    }
                  >
                    {project.title}
                  </h3>

                  <p
                    className={
                      styles.homeProjectCopy
                    }
                  >
                    {project.copy}
                  </p>

                  <div
                    className={
                      styles.homeProjectTags
                    }
                  >
                    {project.tags.map(
                      (tag) => (
                        <span
                          key={tag}
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>

                  <div
                    className={
                      styles.homeProjectLinks
                    }
                  >
                    {project.repository && (
                      <a
                        className={
                          styles.homeProjectLink
                        }
                        href={
                          project.repository
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        {
                          project.repositoryLabel
                        }
                      </a>
                    )}

                    {project.liveHref && (
                      <a
                        className={
                          styles.homeProjectLink
                        }
                        href={
                          project.liveHref
                        }
                      >
                        {
                          project.liveLabel
                        }
                        <span
                          aria-hidden="true"
                        >
                          {" "}
                          →
                        </span>
                      </a>
                    )}

                    <Link
                      className={
                        styles.homeProjectLink
                      }
                      href={
                        project.notesHref
                      }
                      prefetch={false}
                    >
                      {
                        project.notesLabel
                      }
                      <span
                        aria-hidden="true"
                      >
                        {" "}
                        →
                      </span>
                    </Link>
                  </div>
                  </div>
                </article>
              )
            )}
          </div>

          <a
            className={styles.homeProjectArchive}
            href="#work"
          >
            <span>
              FULL PORTFOLIO
            </span>

            <strong>
              Open the Work scene
              <span aria-hidden="true">
                {" "}
                →
              </span>
            </strong>
          </a>
        </div>
      </section>

      <section
        className={`section ${styles.homeWorkflow}`}
      >
        <div className="page-container">
          <div className={styles.homeSectionIntro}>
            <div>
              <p className="kicker">
                METHOD
              </p>

              <h2 className="section-title">
                How I work
              </h2>
            </div>

            <p
              className={`body-large ${styles.homeSectionLead}`}
            >
              One disciplined loop, applied to
              research, software, and art —
              understand before building, verify
              before shipping, evaluate after
              delivery.
            </p>
          </div>

          <div
            className={styles.homeWorkflowGrid}
            aria-label="Working method"
          >
            {workflowStages.map(
              (
                stage,
                index
              ) => (
                <div
                  className={
                    styles.homeWorkflowStage
                  }
                  key={stage.label}
                >
                  <div
                    className={
                      styles.homeWorkflowStageHead
                    }
                  >
                    <span
                      className={
                        styles.homeWorkflowStageIndex
                      }
                    >
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <strong>
                      {stage.label}
                    </strong>

                    {index <
                      workflowStages.length -
                        1 && (
                      <span
                        className={
                          styles.homeWorkflowStageArrow
                        }
                        aria-hidden="true"
                      >
                        →
                      </span>
                    )}
                  </div>

                  <p
                    className={
                      styles.homeWorkflowStageCopy
                    }
                  >
                    {stage.copy}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section
        className={`section ${styles.homeSystems}`}
      >
        <div className="page-container">
          <div className={styles.homeSystemsIntro}>
            <div>
              <p className="kicker">
                WHAT I BUILD
              </p>

              <h2 className="section-title">
                Ideas
                <br />
                made concrete
              </h2>
            </div>

            <p
              className={`body ${styles.homeSystemsCopy}`}
            >
              I turn research into frameworks,{" "}
              software, experiments, simulations,{" "}
              and other working systems.
            </p>
          </div>

          <div className={styles.homeSystemsOverview}>
            <a
              className={
                styles.homeSystemsOverviewLink
              }
              href="#systems"
              aria-label="Open the Systems scene"
            >
              <div
                className={
                  styles.homeSystemsOverviewLabel
                }
              >
                <span>
                  SYSTEMS
                </span>

                <span>
                  03
                </span>
              </div>

              <strong>
                <span>
                  AI
                </span>

                <i>
                  ·
                </i>

                <span>
                  REASONING
                </span>

                <i>
                  ·
                </i>

                <span>
                  SYSTEMS
                </span>
              </strong>

              <span
                className={
                  styles.homeSystemsOverviewArrow
                }
                aria-hidden="true"
              >
                →
              </span>
            </a>
          </div>

          <div className={styles.homeSystemList}>
            {systems.map(
              (system) =>
                system.scene ? (
                  <a
                    className={styles.homeSystemItem}
                    key={system.number}
                    href={system.href}
                  >
                    <span
                      className={
                        styles.homeSystemItemNumber
                      }
                    >
                      {system.number}
                    </span>

                    <div>
                      <h3>
                        {system.title}
                      </h3>

                      <p>
                        {system.copy}
                      </p>
                    </div>

                    <span
                      className={
                        styles.homeSystemItemArrow
                      }
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </a>
                ) : (
                  <Link
                    className={styles.homeSystemItem}
                    key={system.number}
                    href={system.href}
                    prefetch={false}
                  >
                    <span
                      className={
                        styles.homeSystemItemNumber
                      }
                    >
                      {system.number}
                    </span>

                    <div>
                      <h3>
                        {system.title}
                      </h3>

                      <p>
                        {system.copy}
                      </p>
                    </div>

                    <span
                      className={
                        styles.homeSystemItemArrow
                      }
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </Link>
                )
            )}
          </div>
        </div>
      </section>

      <section
        className={`section ${styles.homeDirection}`}
      >
        <div className="page-container">
          <div className={styles.homeDirectionGrid}>
            <div
              className={
                styles.homeDirectionHeading
              }
            >
              <p className="kicker">
                DIRECTION
              </p>

              <h2 className="section-title">
                Understand
                <br />
                intelligence
                <br />
                Build better systems
              </h2>
            </div>

            <div
              className={styles.homeDirectionCopy}
            >
              <p className="body-large">
                The work is an ongoing attempt to{" "}
                understand intelligence, strengthen{" "}
                reasoning, and turn ideas into systems{" "}
                that can be tested and improved.
              </p>

              <div
                className={
                  styles.homeDirectionStages
                }
              >
                {directionStages.map(
                  (
                    stage,
                    index
                  ) => (
                    <div
                      className={
                        styles.homeDirectionStage
                      }
                      key={stage.label}
                    >
                      <div
                        className={
                          styles.homeDirectionStageMain
                        }
                      >
                        <div
                          className={
                            styles.homeDirectionStageIndex
                          }
                        >
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div>
                          <strong>
                            {stage.label}
                          </strong>

                          <p>
                            {stage.copy}
                          </p>
                        </div>
                      </div>

                      {index <
                        directionStages.length -
                          1 && (
                        <span
                          className={
                            styles.homeDirectionStageArrow
                          }
                          aria-hidden="true"
                        >
                          →
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`section ${styles.homeFinal}`}
      >
        <div className="page-container">
          <div className={styles.homeFinalFrame}>
            <div>
              <p className="kicker">
                KEEP EXPLORING
              </p>

              <h2 className="section-title">
                Research
                <br />
                Build
                <br />
                Repeat
              </h2>
            </div>

            <p className="body-large">
              The website is a living index of the{" "}
              systems, experiments, writing, and art{" "}
              that come out of that process.
            </p>
          </div>
        </div>
      </section>

      <PublicLinks
        compact
        title="CONNECT"
      />
    </div>
  );
}
