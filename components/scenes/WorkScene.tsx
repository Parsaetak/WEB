import {
  GITHUB_LINK
} from "@/lib/links";

import styles from "./WorkScene.module.css";

const projects = [
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
    ]
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
    ]
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
    ]
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
    ]
  }
];

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
                What I am building.
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
              className={styles.workInstrumentHeader}
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
                (project) => (
                  <article
                    className={styles.workProject}
                    key={
                      project.number
                    }
                    data-status={
                      project.status.toLowerCase()
                    }
                  >
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
