import PublicLinks from "@/components/PublicLinks";
import RedMagic from "@/components/RedMagic";
import { PUBLIC_LINKS } from "@/lib/links";

const roles = [
  "RESEARCHER",
  "WRITER",
  "ARTIST",
  "PROGRAMMER"
];

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
    copy: "A framework for governing intelligent systems."
  },
  {
    number: "02",
    title: "REP",
    copy: "A framework for stronger reasoning and verification."
  },
  {
    number: "03",
    title: "USEF",
    copy: "A framework for improving systems over time."
  }
];

function RoleStrip() {
  return (
    <div className="home-role-strip">
      {roles.map(
        (
          role,
          index
        ) => (
          <span
            key={role}
          >
            <small>
              {String(
                index + 1
              ).padStart(
                2,
                "0"
              )}
            </small>

            {role}
          </span>
        )
      )}
    </div>
  );
}

export default function HomeScene() {
  const github =
    PUBLIC_LINKS.social.find(
      (link) =>
        link.id ===
        "github"
    );

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
        </div>

        <div className="page-container hero-grid home-origin-content">
          <div className="hero-copy home-origin-copy">
            <div className="hero-status">
              <span className="status-dot" />

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
              Exploring intelligence through
              <br />
              AI, reasoning, systems,
              <br />
              simulation, and creative technology.
            </p>

            <RoleStrip />

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
                  href={github.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub ↗
                </a>
              )}
            </div>
          </div>

          <div
            className="hero-magic home-origin-core"
            aria-label="RED MAGIC"
          >
            <div className="hero-magic-frame">
              <RedMagic />
            </div>

            <div className="home-origin-core-label">
              <span>
                LIVING SYSTEM
              </span>

              <strong>
                RED MAGIC
              </strong>
            </div>
          </div>
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
              I study ideas about intelligence,
              build systems around them,
              and turn the results into
              software, writing, experiments,
              and art.
            </p>
          </div>

          <div className="home-field-strip">
            {fields.map(
              (
                field,
                index
              ) => (
                <span
                  key={field}
                >
                  <small>
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </small>

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
                Thinking
                <br />
                made concrete
              </h2>
            </div>

            <p className="body home-systems-copy">
              AI Instructions, REP, and USEF form
              the foundation of my current systems
              work.
            </p>
          </div>

          <div className="three-column home-system-grid">
            {systems.map(
              (system) => (
                <article
                  className="glow-border home-system-card"
                  key={system.number}
                >
                  <div className="panel system-card magic-panel">
                    <div className="panel-content">
                      <div className="panel-topline">
                        <span className="system-number">
                          {system.number}
                        </span>

                        <span className="system-type">
                          SYSTEM
                        </span>
                      </div>

                      <h3 className="system-title">
                        {system.title}
                      </h3>

                      <p className="system-copy">
                        {system.copy}
                      </p>

                      <div
                        className="system-pulse"
                        aria-hidden="true"
                      >
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      <section className="section-tight magic-section home-magic-section">
        <div className="page-container">
          <div className="home-magic-intro">
            <div>
              <p className="kicker">
                EXPERIMENT
              </p>

              <h2 className="section-title">
                RED MAGIC
              </h2>
            </div>

            <p className="body-large home-magic-copy">
              A living computational organism
              built into the site itself.
            </p>
          </div>

          <div className="magic-system home-magic-system">
            <div className="magic-system-organism">
              <RedMagic />
            </div>

            <div className="magic-system-copy">
              <div className="magic-status">
                <span className="status-dot" />

                <span>
                  ALIVE
                </span>
              </div>

              <p className="kicker">
                RESPONSIVE · ADAPTIVE · COMPUTATIONAL
              </p>

              <h3 className="section-title">
                The website
                <br />
                is part of the experiment
              </h3>

              <div className="magic-metrics">
                <div>
                  <span>
                    STATE
                  </span>

                  <strong>
                    ALIVE
                  </strong>
                </div>

                <div>
                  <span>
                    MODE
                  </span>

                  <strong>
                    ADAPTIVE
                  </strong>
                </div>

                <div>
                  <span>
                    CORE
                  </span>

                  <strong>
                    RED
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

<section className="section home-direction">
  <div className="page-container">
    <div className="home-direction-grid">
      <div>
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
          The work is an ongoing attempt to
          understand intelligence, strengthen
          reasoning, and turn ideas into systems
          that can be tested and improved.
        </p>

        <div className="home-direction-goals">
          <div>
            <span>
              NOW
            </span>

            <strong>
              RESEARCH
            </strong>

            <small>
              Explore intelligence,
              reasoning, and systems.
            </small>
          </div>

          <div>
            <span>
              BUILD
            </span>

            <strong>
              EXPERIMENT
            </strong>

            <small>
              Turn research into
              software, frameworks,
              simulations, and art.
            </small>
          </div>

          <div>
            <span>
              TOWARD
            </span>

            <strong>
              BETTER INTELLIGENCE
            </strong>

            <small>
              Build systems that are
              measurable, testable,
              and improvable.
            </small>
          </div>
        </div>
      </div>
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
