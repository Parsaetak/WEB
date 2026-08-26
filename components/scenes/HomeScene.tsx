import PublicLinks from "@/components/PublicLinks";
import RedMagic from "@/components/RedMagic";
import { PUBLIC_LINKS } from "@/lib/links";

const practices = [
  {
    number: "01",
    title: "RESEARCH",
    copy: "Intelligence, reasoning, cognition, systems."
  },
  {
    number: "02",
    title: "CODE",
    copy: "Software, AI tools, simulations, experiments."
  },
  {
    number: "03",
    title: "WRITING",
    copy: "Ideas, frameworks, theories, questions."
  },
  {
    number: "04",
    title: "ART",
    copy: "Images, identities, worlds, interactions."
  }
];

const systems = [
  {
    number: "01",
    title: "AI INSTRUCTIONS",
    signal: "GOVERN",
    copy: "Defines how the system operates."
  },
  {
    number: "02",
    title: "REP",
    signal: "REASON",
    copy: "Strengthens reasoning and verification."
  },
  {
    number: "03",
    title: "USEF",
    signal: "IMPROVE",
    copy: "Drives continuous system improvement."
  }
];

function SectionHeading({
  number,
  title,
  description
}: {
  number: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading home-section-heading">
      <div className="section-heading-line">
        <span
          className="section-signal"
          aria-hidden="true"
        />

        <p className="kicker">
          {number} / {title}
        </p>
      </div>

      {description && (
        <p className="body-large section-heading-description">
          {description}
        </p>
      )}
    </div>
  );
}

function PracticeCard({
  practice
}: {
  practice: (typeof practices)[number];
}) {
  return (
    <article
      className="glow-border home-capability-card"
      data-capability={practice.title.toLowerCase()}
    >
      <div className="panel magic-panel">
        <div className="panel-content">
          <div className="panel-topline">
            <span className="system-number">
              {practice.number}
            </span>

            <span className="system-type">
              PRACTICE
            </span>
          </div>

          <div className="home-capability-code">
            {practice.title}
          </div>

          <h2 className="system-title">
            {practice.title}
          </h2>

          <p className="system-copy">
            {practice.copy}
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
  );
}

function SystemCard({
  system
}: {
  system: (typeof systems)[number];
}) {
  return (
    <article
      className="glow-border home-system-card"
      data-system={system.signal.toLowerCase()}
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

          <h2 className="system-title">
            {system.title}
          </h2>

          <p className="system-copy">
            {system.copy}
          </p>

          <div className="home-system-signal">
            <span>
              {system.signal}
            </span>

            <span
              className="home-system-signal-line"
              aria-hidden="true"
            />
          </div>

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
  );
}

export default function HomeScene() {
  const github = PUBLIC_LINKS.social.find(
    (link) => link.id === "github"
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

            <h1 className="hero-title">
              Researching
              <br />
              <span className="hero-title-accent">
                intelligence.
              </span>

              <br />

              Building systems.
            </h1>

            <p className="body-large hero-description">
              Writing ideas.
              Creating art.
            </p>

            <p className="body home-origin-description">
              AI · REASONING · SYSTEMS · SIMULATION · CREATIVE TECHNOLOGY
            </p>

            <div className="hero-actions home-origin-actions">
              {github && (
                <a
                  className="button button-primary"
                  href={github.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub ↗
                </a>
              )}

              <a
                className="button button-secondary"
                href="#about"
              >
                Explore ↓
              </a>
            </div>
          </div>

          <div
            className="hero-magic home-origin-core"
            aria-label="RED MAGIC living organism"
          >
            <div className="hero-magic-frame">
              <RedMagic />
            </div>

            <div className="home-origin-core-label">
              <span>
                LIVE
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
          <SectionHeading
            number="01"
            title="PRACTICE"
          />

          <div className="four-column home-capability-grid">
            {practices.map((practice) => (
              <PracticeCard
                key={practice.number}
                practice={practice}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section home-systems">
        <div className="page-container">
          <SectionHeading
            number="02"
            title="SYSTEMS"
          />

          <div className="three-column home-system-grid">
            {systems.map((system) => (
              <SystemCard
                key={system.number}
                system={system}
              />
            ))}
          </div>

          <div className="glow-border home-relationship">
            <div className="panel panel-red magic-panel">
              <div className="panel-content">
                <div className="home-relationship-header">
                  <p className="kicker">
                    FLOW
                  </p>

                  <span className="home-relationship-state">
                    ACTIVE
                  </span>
                </div>

                <p className="home-relationship-sequence">
                  <span>
                    GOVERN
                  </span>

                  <span aria-hidden="true">
                    →
                  </span>

                  <span>
                    REASON
                  </span>

                  <span aria-hidden="true">
                    →
                  </span>

                  <span>
                    IMPROVE
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight magic-section home-magic-section">
        <div className="page-container">
          <SectionHeading
            number="03"
            title="MAGIC"
            description="A living computational organism."
          />

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
                RED MAGIC
              </p>

              <h2 className="section-title">
                Intelligence should{" "}
                <span className="hero-title-accent">
                  move.
                </span>
              </h2>

              <p className="body-large home-magic-lead">
                Responsive.
                Adaptive.
                Computational.
              </p>

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

      <PublicLinks
        compact
        title="CONNECT"
      />
    </div>
  );
}
