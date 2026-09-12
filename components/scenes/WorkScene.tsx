import {
  GITHUB_LINK
} from "@/lib/links";

import styles from "./WorkScene.module.css";

/*
 * Work cards are plain anchors (a full-card link must not nest a
 * next/link inside future content), so internal routes must carry
 * the deployment basePath explicitly — next/link is not used here.
 * NEXT_PUBLIC_BASE_PATH is inlined at build time by Next.js
 * ("" locally, "/WEB" on GitHub Pages), the same convention
 * app/not-found.tsx uses. Scene hashes (#magic) are same-document
 * and must never be prefixed.
 */
const BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function routeHref(
  path: string
): string {
  return `${BASE_PATH}${path}`;
}

/*
 * Project cards are informational by default — hover affordances and
 * navigation exist ONLY where a real destination exists
 * (data-linked, Interaction Truth Law 56).
 *
 * Destinations (v2.6.1):
 * - RED MAGIC opens the live Magic scene (the organism runs there).
 * - UHIT, RED THEORY and AI SYSTEMS open their field-notes articles
 *   in the blog — real /blog/<slug>/ routes generated from the
 *   content pipeline, each written against the actual public state
 *   of the corresponding project. The NOTES line inside the card
 *   names the destination; the whole card is one link (never a
 *   nested anchor).
 */

type Project = {
  number: string;
  code: string;
  title: string;
  type: string;
  status: string;
  copy: string;
  tags: readonly string[];
  /** Destination href — a scene hash or a real blog route. */
  href: string | null;
  /** Accessible description of where a linked card goes. */
  ariaLabel?: string;
  /** Visible mono line naming the destination of a linked card. */
  notes?: string;
};

const projects: readonly Project[] = [
  {
    number: "01",
    code: "UHIT",
    title:
      "Universal Human Intelligence Test",
    type:
      "RESEARCH",
    status:
      "EVOLVING",
    copy:
      "An adaptive framework for measuring intelligence, reasoning, transfer, and human-AI performance.",
    tags: [
      "INTELLIGENCE",
      "ASSESSMENT"
    ],
    href: routeHref(
      "/blog/measuring-machine-intelligence/"
    ),
    ariaLabel:
      "Read the UHIT field notes: Measuring Machine Intelligence",
    notes:
      "NOTES — MEASURING MACHINE INTELLIGENCE"
  },
  {
    number: "02",
    code: "RED THEORY",
    title:
      "Living-System Experiment",
    type:
      "SIMULATION",
    status:
      "ACTIVE",
    copy:
      "An experimental model for emergence, adaptation, competition, dissolution, and replacement.",
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
  },
  {
    number: "03",
    code: "RED MAGIC",
    title:
      "Computational Organism",
    type:
      "EXPERIMENT",
    status:
      "ACTIVE",
    copy:
      "A responsive visual organism that turns the website itself into a computational experiment.",
    tags: [
      "CANVAS",
      "ADAPTATION"
    ],
    href: "#magic",
    ariaLabel:
      "Open the RED MAGIC experiment in the Magic scene"
  },
  {
    number: "04",
    code: "AI SYSTEMS",
    title:
      "Reasoning Architecture",
    type:
      "SYSTEMS",
    status:
      "RESEARCH",
    copy:
      "Local AI tools, reasoning frameworks, context engineering, and autonomous system experiments.",
    tags: [
      "AI",
      "SYSTEMS"
    ],
    href: routeHref(
      "/blog/sheytan-the-local-first-laboratory/"
    ),
    ariaLabel:
      "Read the AI systems field notes: SHEYTAN, the local-first engineering laboratory",
    notes:
      "NOTES — SHEYTAN, THE LOCAL-FIRST LABORATORY"
  }
];

/*
 * Shared card body so the linked and informational variants render
 * identically.
 */
function ProjectBody({
  project
}: {
  project: Project;
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
                  PROJECTS
                </p>

                <strong>
                  CURRENT RESEARCH
                </strong>
              </div>

              <span>
                {String(
                  projects.length
                ).padStart(
                  2,
                  "0"
                )}
              </span>
            </div>

            <div
              className={styles.workProjectList}
            >
              {projects.map(
                (project) =>
                  project.href !== null ? (
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
                      href={project.href}
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
