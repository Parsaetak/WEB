import PublicLinks from "@/components/PublicLinks";
import RedMagic from "@/components/RedMagic";
import { GITHUB_LINK } from "@/lib/links";

import styles from "./HomeScene.module.css";

const fields = [
  "AI",
  "REASONING",
  "SYSTEMS",
  "SIMULATION",
  "CREATIVE TECHNOLOGY"
] as const;

const systems = [
  {
    number: "01",
    title: "AI INSTRUCTIONS",
    copy:
      "A framework for governing intelligent systems."
  },
  {
    number: "02",
    title: "REP",
    copy:
      "A framework for stronger reasoning and verification."
  },
  {
    number: "03",
    title: "USEF",
    copy:
      "A framework for improving systems over time."
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
              PARSA TAK
            </p>

            <h1
              className={`hero-title ${styles.homeIdentityTitle}`}
            >
              Researcher
              <br />
              Writer
              <br />
              Artist
              <br />
              Programmer
            </h1>

            <p
              className={`body-large hero-description ${styles.homeIdentityLead}`}
            >
              Exploring intelligence through{" "}
              AI, reasoning, systems,{" "}
              simulation, and creative technology.
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
          <div className={styles.homeIntroBlock}>
            <div>
              <p className="kicker">
                WHAT I EXPLORE
              </p>

              <h2 className="section-title">
                Questions first
                <br />
                Systems second
              </h2>
            </div>

            <p
              className={`body-large ${styles.homeIntroCopy}`}
            >
              I study ideas about intelligence,{" "}
              build systems around them,{" "}
              and turn the results into{" "}
              software, writing, experiments,{" "}
              and art.
            </p>
          </div>

          <div
            className={styles.homeExplorationField}
            aria-label="Areas of exploration"
          >
            {fields.map(
              (field) => (
                <span
                  key={field}
                  className={styles.homeExplorationItem}
                >
                  {field}
                </span>
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
            <div
              className={
                styles.homeSystemsOverviewLink
              }
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
              >
                →
              </span>
            </div>
          </div>

          <div className={styles.homeSystemList}>
            {systems.map(
              (system) => (
                <article
                  className={styles.homeSystemItem}
                  key={system.number}
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
                </article>
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
                Research.
                <br />
                Build.
                <br />
                Repeat.
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
