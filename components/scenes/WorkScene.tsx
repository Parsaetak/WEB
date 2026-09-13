import {
  GITHUB_LINK
} from "@/lib/links";

import styles from "./WorkScene.module.css";

/*
 * WORK SCENE (v2.7) — full portfolio / research index.
 *
 * The scene presents the verified public project ecosystem in a
 * two-tier hierarchy: FEATURED SYSTEMS (the four highest-signal
 * projects, presented as rich cards with repository, notes, and
 * live destinations) followed by grouped coverage of everything
 * else that matters — AI + reasoning frameworks, the UHIT
 * measurement programme's public specifications, RED THEORY, the
 * content infrastructure, and the RED MAGIC creative line.
 *
 * Destination law (unchanged): a link exists ONLY where a real
 * destination exists. Featured cards carry several destinations
 * (repository / notes / live), so they are panels of individual
 * links — never a full-card anchor with nested anchors inside.
 * Single-destination cards remain full-card links (data-linked),
 * exactly like the v2.6.1 behaviour.
 *
 * Internal routes carry the deployment basePath explicitly via
 * routeHref() — plain anchors, the same convention the v2.6.1
 * WorkScene used. Scene hashes (#magic, #systems, #library) are
 * same-document and must never be prefixed. NEXT_PUBLIC_BASE_PATH
 * is inlined at build time ("" locally, "/WEB" on GitHub Pages).
 */
const BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function routeHref(
  path: string
): string {
  return `${BASE_PATH}${path}`;
}

/*
 * Destination descriptors — one per real external or internal
 * target. External repositories open in a new tab; internal notes
 * routes and scene hashes navigate in-page.
 */
type ProjectLink = {
  label: string;
  href: string;
  external: boolean;
};

type FeaturedProject = {
  number: string;
  code: string;
  title: string;
  type: string;
  status: string;
  copy: string;
  tags: readonly string[];
  links: readonly ProjectLink[];
};

type GroupProject = {
  number: string;
  code: string;
  title: string;
  type: string;
  status: string;
  copy: string;
  tags: readonly string[];
  /** Primary destination — full-card link when present. */
  href: string | null;
  ariaLabel?: string;
  /** Visible mono line naming the destination of a linked card. */
  notes?: string;
  /** Optional secondary repository link (never nested — rendered as a sibling row). */
  links?: readonly ProjectLink[];
};

type ProjectGroup = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  projects: readonly GroupProject[];
};

/*
 * FEATURED SYSTEMS — the highest-signal public work, verified
 * against the actual repositories:
 * - SHEYTAN Local Agent (github.com/Parsaetak/SHEYTAN-local-agent)
 * - UHIT measurement programme (Contents/AI-Tests branch)
 * - FreeIran (github.com/Parsaetak/FreeIran)
 * - WEB — this site (github.com/Parsaetak/WEB, live on Pages)
 */
const featuredProjects: readonly FeaturedProject[] = [
  {
    number: "01",
    code: "SHEYTAN",
    title: "SHEYTAN Local Agent",
    type: "LOCAL-FIRST AI LABORATORY",
    status: "ACTIVE",
    copy:
      "A desktop AI engineering laboratory: managed llama.cpp inference, a supervised agent loop, isolated coding workspaces, long-context memory and recall, and objective verification gates — all running locally.",
    tags: [
      "GO",
      "WAILS V3",
      "LLAMA.CPP",
      "REACT"
    ],
    links: [
      {
        label: "REPOSITORY ↗",
        href: "https://github.com/Parsaetak/SHEYTAN-local-agent",
        external: true
      },
      {
        label: "FIELD NOTES",
        href: routeHref(
          "/blog/sheytan-the-local-first-laboratory/"
        ),
        external: false
      }
    ]
  },
  {
    number: "02",
    code: "UHIT",
    title:
      "Universal Human Intelligence Test",
    type: "INTELLIGENCE MEASUREMENT",
    status: "EVOLVING",
    copy:
      "The measurement arm of the laboratory: an adaptive framework for measuring intelligence, reasoning, transfer, and human-AI performance — public today as the AIST-2026.09 standard and the ASI-100-Elite benchmark.",
    tags: [
      "AIST",
      "ASI-100",
      "VERIFICATION"
    ],
    links: [
      {
        label: "SPECIFICATIONS ↗",
        href: "https://github.com/Parsaetak/Contents/tree/AI-Tests",
        external: true
      },
      {
        label: "FIELD NOTES",
        href: routeHref(
          "/blog/measuring-machine-intelligence/"
        ),
        external: false
      }
    ]
  },
  {
    number: "03",
    code: "FREEIRAN",
    title: "FreeIran",
    type: "OPEN-SOURCE VPN MANAGER",
    status: "PRODUCTION",
    copy:
      "A lightweight, free, open-source VPN configuration manager for Windows: a Go multi-core runtime that discovers, tests, maintains, and runs publicly available proxy configurations, with chunked local storage.",
    tags: [
      "GO",
      "XRAY",
      "V2RAY",
      "SING-BOX"
    ],
    links: [
      {
        label: "REPOSITORY ↗",
        href: "https://github.com/Parsaetak/FreeIran",
        external: true
      },
      {
        label: "ENGINEERING NOTES",
        href: routeHref(
          "/blog/freeiran-engineering-notes/"
        ),
        external: false
      }
    ]
  },
  {
    number: "04",
    code: "WEB",
    title: "This Website",
    type: "STATIC LIVING SYSTEM",
    status: "LIVE",
    copy:
      "The site you are reading: a statically exported Next.js application that behaves like a living system — six hash scenes, a markdown-driven blog, a generated SEO graph, and a canvas organism.",
    tags: [
      "NEXT.JS 16",
      "REACT 19",
      "STATIC EXPORT"
    ],
    links: [
      {
        label: "REPOSITORY ↗",
        href: "https://github.com/Parsaetak/WEB",
        external: true
      },
      {
        label: "LIVE ↗",
        href: "https://parsaetak.github.io/WEB/",
        external: true
      },
      {
        label: "HOW IT WORKS",
        href: routeHref(
          "/blog/the-anatomy-of-a-fast-static-site/"
        ),
        external: false
      }
    ]
  }
];

/*
 * GROUPED COVERAGE — every significant public project in the
 * ecosystem, grouped by what it demonstrates.
 */
const projectGroups: readonly ProjectGroup[] = [
  {
    id: "ai-reasoning",
    kicker: "AI + REASONING",
    title: "Frameworks for thinking systems",
    description:
      "The framework family that governs, strengthens, and improves intelligent systems — published and versioned as public documents.",
    projects: [
      {
        number: "05",
        code: "AI INSTRUCTIONS",
        title:
          "Constitutional Operating Framework",
        type: "FRAMEWORK",
        status: "PUBLIC",
        copy:
          "A five-tier operating constitution for AI systems: instruction hierarchy, evidence handling, tools, context, security, memory, and self-governance.",
        tags: [
          "GOVERNANCE",
          "AI"
        ],
        href: routeHref(
          "/blog/ai-instructions/"
        ),
        ariaLabel:
          "Read the AI INSTRUCTIONS article: a constitutional operating framework for AI",
        notes:
          "NOTES — AI INSTRUCTIONS: A CONSTITUTIONAL OPERATING FRAMEWORK"
      },
      {
        number: "06",
        code: "REP",
        title:
          "Reasoning Enhancement Protocol",
        type: "FRAMEWORK",
        status: "PUBLIC",
        copy:
          "Structures reasoning through decomposition, verification, critique, adversarial checking, uncertainty handling, and iterative refinement.",
        tags: [
          "REASONING",
          "VERIFICATION"
        ],
        href: "#systems",
        ariaLabel:
          "Open the Systems scene for the REP presentation"
      },
      {
        number: "07",
        code: "USEF",
        title:
          "Unified System Enhancement Framework",
        type: "FRAMEWORK",
        status: "PUBLIC",
        copy:
          "A discipline for finding weaknesses, redesigning components, testing consequences, measuring results, and iterating systems over time.",
        tags: [
          "IMPROVEMENT",
          "SYSTEMS"
        ],
        href: "#systems",
        ariaLabel:
          "Open the Systems scene for the USEF presentation"
      }
    ]
  },
  {
    id: "research-experiments",
    kicker: "RESEARCH + EXPERIMENTS",
    title: "Measurement and simulation",
    description:
      "The UHIT measurement programme's public specifications and the RED THEORY living-system experiments.",
    projects: [
      {
        number: "08",
        code: "AIST",
        title: "AIST-2026.09 — AI Smartness Test",
        type: "SPECIFICATION",
        status: "2026.09",
        copy:
          "The Universal Operational Intelligence Standard: a psychometric measurement framework and self-evolution engine for frontier AI systems.",
        tags: [
          "MEASUREMENT",
          "STANDARD"
        ],
        href: "https://github.com/Parsaetak/Contents/blob/AI-Tests/AIST-2026.09.md",
        ariaLabel:
          "Read the AIST-2026.09 specification on GitHub"
      },
      {
        number: "09",
        code: "ASI-100",
        title: "ASI-100-Elite-2026.09 — AI Smartness Index",
        type: "BENCHMARK",
        status: "2026.09",
        copy:
          "A frontier benchmark of ten batteries and one hundred engineered items, with multiplicative scoring and a twelve-class failure taxonomy.",
        tags: [
          "BENCHMARK",
          "EVALUATION"
        ],
        href: "https://github.com/Parsaetak/Contents/blob/AI-Tests/ASI-100-Elite-2026.09.md",
        ariaLabel:
          "Read the ASI-100-Elite-2026.09 benchmark on GitHub"
      },
      {
        number: "10",
        code: "RED THEORY",
        title:
          "Living-System Model",
        type: "SIMULATION",
        status: "ACTIVE",
        copy:
          "An experimental model for emergence, adaptation, competition, dissolution, and replacement — explored through the living web.",
        tags: [
          "SIMULATION",
          "EVOLUTION"
        ],
        href: routeHref(
          "/blog/red-theory-and-the-living-web/"
        ),
        ariaLabel:
          "Read the RED THEORY article: Red Theory and the Living Web",
        notes:
          "NOTES — RED THEORY AND THE LIVING WEB"
      }
    ]
  },
  {
    id: "software-engineering",
    kicker: "SOFTWARE + ENGINEERING",
    title: "Infrastructure that carries the work",
    description:
      "The repositories and systems that publish, feed, and run everything else.",
    projects: [
      {
        number: "11",
        code: "CONTENTS",
        title: "Content Infrastructure",
        type: "REPOSITORY",
        status: "PUBLIC",
        copy:
          "The multi-branch repository that publishes the specifications, frameworks, and books — and feeds this site's library through a validated manifest.",
        tags: [
          "SPECS",
          "BOOKS",
          "MANIFEST"
        ],
        href: "https://github.com/Parsaetak/Contents",
        ariaLabel:
          "Open the Parsaetak/Contents repository on GitHub"
      }
    ]
  },
  {
    id: "creative-technology",
    kicker: "CREATIVE TECHNOLOGY",
    title: "The RED MAGIC line",
    description:
      "Computational organisms, living interfaces, and the book series — technology as an expressive medium.",
    projects: [
      {
        number: "12",
        code: "RED MAGIC",
        title:
          "Computational Organism",
        type: "EXPERIMENT",
        status: "ACTIVE",
        copy:
          "A responsive canvas organism that turns the website itself into a computational experiment — perception, adaptation, and visible state.",
        tags: [
          "CANVAS",
          "ADAPTATION"
        ],
        href: "#magic",
        ariaLabel:
          "Open the RED MAGIC experiment in the Magic scene"
      },
      {
        number: "13",
        code: "RED MAGIC BOOKS",
        title:
          "The Book Series",
        type: "WRITING",
        status: "PUBLISHED",
        copy:
          "RED MAGIC, MAGIC FOR KIDS, and THE BOOK OF THE DEMIURGE — the written form of the RED MAGIC ideas, readable in the Library scene.",
        tags: [
          "BOOKS",
          "IDEAS"
        ],
        href: "#library",
        ariaLabel:
          "Open the RED MAGIC books in the Library scene"
      }
    ]
  }
];

const TOTAL_PROJECTS =
  featuredProjects.length +
  projectGroups.reduce(
    (sum, group) =>
      sum + group.projects.length,
    0
  );

/*
 * Shared body for featured cards (multi-link panels — the card
 * itself is never an anchor).
 */
function FeaturedBody({
  project
}: {
  project: FeaturedProject;
}) {
  return (
    <>
      <div
        className={
          styles.workProjectNumber
        }
      >
        {
          project.number
        }
      </div>

      <div
        className={
          styles.workProjectMain
        }
      >
        <div
          className={
            styles.workProjectMeta
          }
        >
          <span
            className={
              styles.workProjectCode
            }
          >
            {
              project.code
            }
          </span>

          <span
            className={
              styles.workProjectType
            }
          >
            {
              project.type
            }
          </span>
        </div>

        <h2>
          {
            project.title
          }
        </h2>

        <p
          className={
            styles.workProjectCopy
          }
        >
          {
            project.copy
          }
        </p>

        <div
          className={
            styles.workProjectTags
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
            styles.workProjectLinks
          }
        >
          {project.links.map(
            (link) => (
              <a
                key={
                  link.href
                }
                className={
                  styles.workProjectLink
                }
                href={
                  link.href
                }
                target={
                  link.external
                    ? "_blank"
                    : undefined
                }
                rel={
                  link.external
                    ? "noreferrer"
                    : undefined
                }
              >
                {
                  link.label
                }

                {!link.external && (
                  <span
                    aria-hidden="true"
                  >
                    {" "}
                    →
                  </span>
                )}
              </a>
            )
          )}
        </div>
      </div>

      <div
        className={
          styles.workProjectState
        }
      >
        <span>
          {
            project.status
          }
        </span>

        <i
          aria-hidden="true"
        />
      </div>
    </>
  );
}

/*
 * Shared card body for grouped cards — identical to the v2.6.1
 * card body so linked and informational variants render the same.
 */
function ProjectBody({
  project
}: {
  project: GroupProject;
}) {
  return (
    <>
      <div
        className={
          styles.workProjectNumber
        }
      >
        {
          project.number
        }
      </div>

      <div
        className={
          styles.workProjectMain
        }
      >
        <div
          className={
            styles.workProjectMeta
          }
        >
          <span
            className={
              styles.workProjectCode
            }
          >
            {
              project.code
            }
          </span>

          <span
            className={
              styles.workProjectType
            }
          >
            {
              project.type
            }
          </span>
        </div>

        <h2>
          {
            project.title
          }
        </h2>

        <p
          className={
            styles.workProjectCopy
          }
        >
          {
            project.copy
          }
        </p>

        <div
          className={
            styles.workProjectTags
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

        {project.notes && (
          <p
            className={
              styles.workProjectNotes
            }
          >
            <span
              aria-hidden="true"
            >
              ↳&nbsp;
            </span>

            {project.notes}
          </p>
        )}
      </div>

      <div
        className={
          styles.workProjectState
        }
      >
        <span>
          {
            project.status
          }
        </span>

        <i
          aria-hidden="true"
        />
      </div>
    </>
  );
}

export default function WorkScene() {
  const github =
    GITHUB_LINK;

  return (
    <div className={styles.workScene}>
      <section
        className={`section ${styles.workLaboratory}`}
      >
        <div
          className={styles.workLaboratoryField}
          aria-hidden="true"
        >
          <span
            className={styles.workGridPlane}
          />

          <span
            className={`${styles.workGridAxis} ${styles.workGridAxisX}`}
          />

          <span
            className={`${styles.workGridAxis} ${styles.workGridAxisY}`}
          />

          <span
            className={`${styles.workMarker} ${styles.workMarkerOne}`}
          />

          <span
            className={`${styles.workMarker} ${styles.workMarkerTwo}`}
          />

          <span
            className={`${styles.workMarker} ${styles.workMarkerThree}`}
          />

          <span
            className={`${styles.workMarker} ${styles.workMarkerFour}`}
          />
        </div>

        <div className="page-container">
          <div className={styles.workHeader}>
            <div className={styles.workHeaderCopy}>
              <p className="kicker">
                04 / WORK
              </p>

              <h1
                className={`section-title ${styles.workTitle}`}
              >
                What I am building
              </h1>

              <p
                className={`body-large ${styles.workLead}`}
              >
                Research becomes projects.
              </p>
            </div>

            <div
              className={styles.workStatus}
              aria-label="Work status"
            >
              <span
                className={styles.workStatusDot}
                aria-hidden="true"
              />

              <span>
                OPEN
              </span>
            </div>
          </div>

          <div className={styles.workIntro}>
            <p
              className={styles.workIntroStatement}
            >
              I build experiments around intelligence:{" "}
              systems that can be measured, challenged,{" "}
              visualised, and improved.
            </p>
          </div>

          <div className={styles.workInstrument}>
            <div
              className={
                styles.workInstrumentHeader
              }
            >
              <div>
                <p className="kicker">
                  FEATURED SYSTEMS
                </p>

                <strong>
                  THE HIGHEST-SIGNAL WORK
                </strong>
              </div>

              <span>
                {String(
                  TOTAL_PROJECTS
                ).padStart(
                  2,
                  "0"
                )}
              </span>
            </div>

            <div
              className={
                styles.workProjectList
              }
              aria-label="Featured systems"
            >
              {featuredProjects.map(
                (project) => (
                  <article
                    className={
                      styles.workProject
                    }
                    key={
                      project.number
                    }
                    data-status={
                      project.status.toLowerCase()
                    }
                    data-featured="true"
                  >
                    <FeaturedBody
                      project={project}
                    />
                  </article>
                )
              )}
            </div>
          </div>

          {projectGroups.map(
            (group) => (
              <div
                className={
                  styles.workGroup
                }
                key={group.id}
                id={
                  group.id
                }
              >
                <div
                  className={
                    styles.workGroupHeader
                  }
                >
                  <p
                    className="kicker"
                  >
                    {
                      group.kicker
                    }
                  </p>

                  <strong>
                    {
                      group.title
                    }
                  </strong>

                  <p
                    className={
                      styles.workGroupDescription
                    }
                  >
                    {
                      group.description
                    }
                  </p>

                  <span
                    className={
                      styles.workGroupCount
                    }
                  >
                    {String(
                      group.projects.length
                    ).padStart(
                      2,
                      "0"
                    )}
                  </span>
                </div>

                <div
                  className={
                    styles.workProjectList
                  }
                >
                  {group.projects.map(
                    (project) =>
                      project.href !==
                      null ? (
                        <a
                          className={
                            styles.workProject
                          }
                          key={
                            project.number
                          }
                          data-status={
                            project.status.toLowerCase()
                          }
                          data-linked="true"
                          href={
                            project.href
                          }
                          /*
                           * External destinations (GitHub
                           * specifications, repositories) open in a
                           * new tab exactly like the featured
                           * cards' external links — same tab was a
                           * v2.7 regression for these group rows.
                           */
                          target={
                            project.href.startsWith(
                              "http"
                            )
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            project.href.startsWith(
                              "http"
                            )
                              ? "noreferrer"
                              : undefined
                          }
                          aria-label={
                            project.ariaLabel
                          }
                        >
                          <ProjectBody
                            project={project}
                          />
                        </a>
                      ) : (
                        <article
                          className={
                            styles.workProject
                          }
                          key={
                            project.number
                          }
                          data-status={
                            project.status.toLowerCase()
                          }
                          data-linked="false"
                        >
                          <ProjectBody
                            project={project}
                          />
                        </article>
                      )
                  )}
                </div>
              </div>
            )
          )}

          {github && (
            <div
              className={
                styles.workLaboratoryFooter
              }
            >
              <a
                className={
                  styles.workArchiveLink
                }
                href={
                  github.href
                }
                target="_blank"
                rel="noreferrer"
              >
                <span>
                  FULL ARCHIVE
                </span>

                <strong>
                  GitHub ↗
                </strong>
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
