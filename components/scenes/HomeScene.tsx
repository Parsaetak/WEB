import PublicLinks from "@/components/PublicLinks";
import RedMagic from "@/components/RedMagic";
import { GITHUB_LINK } from "@/lib/links";

const fields = [
  "AI",
  "REASONING",
  "SYSTEMS",
  "SIMULATION",
  "CREATIVE TECHNOLOGY"
];

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
];

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
];

export default function HomeScene() {
  const github =
    GITHUB_LINK;

  return (
    <div className="home-scene">
      <section className="hero home-origin">
        <div
          className="home-origin-grid"
          aria-hidden="true"
        >
          <span className="home-origin-ring home-origin-ring-one" />
          <span className="home-origin-ring home-origin-ring-two" />
          <span className="home-origin-ring home-origin-ring-three" />

          <span className="home-origin-axis home-origin-axis-x" />
          <span className="home-origin-axis home-origin-axis-y" />

          <span className="home-origin-cross home-origin-cross-one" />
          <span className="home-origin-cross home-origin-cross-two" />
          <span className="home-origin-cross home-origin-cross-three" />
        </div>

        <div
          className="home-origin-magic-background"
          aria-hidden="true"
        >
          <div className="home-origin-magic-vignette" />

          <div className="home-origin-magic-organism">
            <RedMagic />
          </div>
        </div>

        <div className="page-container hero-grid home-origin-content">
          <div className="hero-copy home-origin-copy">
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

            <h1 className="hero-title home-identity-title">
              Researcher
              <br />
              Writer
              <br />
              Artist
              <br />
              Programmer
            </h1>

            <p className="body-large hero-description home-identity-lead">
              Exploring intelligence through{" "}
              AI, reasoning, systems,{" "}
              simulation, and creative technology.
            </p>

            <div className="hero-actions home-origin-actions">
              <a
                className="button button-primary"
                href="#work"
              >
                Explore the work ↓
              </a>

              {github && (
                <a
                  className="button button-secondary"
                  href={
                    github.href
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub ↗
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="home-origin-foot">
          <span>
            SCROLL TO EXPLORE
          </span>

          <span
            className="home-origin-foot-line"
            aria-hidden="true"
          />
        </div>
      </section>

      <section className="section home-capabilities">
        <div className="page-container">
          <div className="home-intro-block">
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

            <p className="body-large home-intro-copy">
              I study ideas about intelligence,{" "}
              build systems around them,{" "}
              and turn the results into{" "}
              software, writing, experiments,{" "}
              and art.
            </p>
          </div>

          <div
            className="home-exploration-field"
            aria-label="Areas of exploration"
          >
            {fields.map(
              (field) => (
                <span
                  key={field}
                  className="home-exploration-item"
                >
                  {field}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      <section className="section home-systems">
        <div className="page-container">
          <div className="home-systems-intro">
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

            <p className="body home-systems-copy">
              I turn research into frameworks,{" "}
              software, experiments, simulations,{" "}
              and other working systems.
            </p>
          </div>

          <div className="home-systems-overview">
            <div className="home-systems-overview-link">
              <div className="home-systems-overview-label">
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

                <i>·</i>

                <span>
                  REASONING
                </span>

                <i>·</i>

                <span>
                  SYSTEMS
                </span>
              </strong>

              <span className="home-systems-overview-arrow">
                →
              </span>
            </div>
          </div>

          <div className="home-system-list">
            {systems.map(
              (system) => (
                <article
                  className="home-system-item"
                  key={
                    system.number
                  }
                >
                  <span className="home-system-item-number">
                    {
                      system.number
                    }
                  </span>

                  <div>
                    <h3>
                      {
                        system.title
                      }
                    </h3>

                    <p>
                      {
                        system.copy
                      }
                    </p>
                  </div>

                  <span
                    className="home-system-item-arrow"
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

      <section className="section home-direction">
        <div className="page-container">
          <div className="home-direction-grid">
            <div className="home-direction-heading">
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

            <div className="home-direction-copy">
              <p className="body-large">
                The work is an ongoing attempt to{" "}
                understand intelligence, strengthen{" "}
                reasoning, and turn ideas into systems{" "}
                that can be tested and improved.
              </p>

              <div className="home-direction-stages">
                {directionStages.map(
                  (
                    stage,
                    index
                  ) => (
                    <div
                      className="home-direction-stage"
                      key={
                        stage.label
                      }
                    >
                      <div className="home-direction-stage-main">
                        <div className="home-direction-stage-index">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div>
                          <strong>
                            {
                              stage.label
                            }
                          </strong>

                          <p>
                            {
                              stage.copy
                            }
                          </p>
                        </div>
                      </div>

                      {index <
                        directionStages.length -
                          1 && (
                        <span
                          className="home-direction-stage-arrow"
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

      <section className="section home-final">
        <div className="page-container">
          <div className="home-final-frame">
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
