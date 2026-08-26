import {
  PUBLIC_LINKS
} from "@/lib/links";

const projects = [
  {
    number: "01",
    type: "INTELLIGENCE",
    title: "UHIT",
    description:
      "A universal human intelligence testing and research architecture designed to measure reasoning across adaptive cognitive levels.",
    status: "EVOLVING"
  },
  {
    number: "02",
    type: "SIMULATION",
    title: "RED THEORY",
    description:
      "A living-system experiment exploring finite environments, entities, interaction, adaptation, replacement, and emergent behaviour.",
    status: "ACTIVE"
  },
  {
    number: "03",
    type: "WEB SYSTEM",
    title: "RED MAGIC",
    description:
      "A lightweight living visual organism used as the visual and computational identity of this website.",
    status: "ACTIVE"
  },
  {
    number: "04",
    type: "AI ARCHITECTURE",
    title: "AI SYSTEMS",
    description:
      "Experiments in local intelligence, reasoning architectures, tools, context engineering, and autonomous system design.",
    status: "RESEARCH"
  }
];

function SectionHeading() {
  return (
    <div className="section-heading">
      <div className="section-heading-line">
        <span
          className="section-signal"
          aria-hidden="true"
        />

        <p className="kicker">
          04 / WORK
        </p>
      </div>

      <p className="body-large section-heading-description">
        An evolving collection of systems, experiments,
        research directions, and prototypes.
      </p>
    </div>
  );
}

export default function WorkScene() {
  const github = PUBLIC_LINKS.social.find(
    (link) => link.id === "github"
  );

  const websiteRepository = {
    href: "https://github.com/Parsaetak/WEB"
  };

  return (
    <div className="work-scene">
      <section className="section">
        <div className="page-container">
          <SectionHeading />

          <div className="two-column">
            <div>
              <p className="kicker">
                PUBLIC LABORATORY
              </p>

              <h1 className="section-title">
                Building systems that{" "}
                <span className="hero-title-accent">
                  evolve.
                </span>
              </h1>

              <p
                className="body-large"
                style={{
                  marginTop: "22px"
                }}
              >
                The projects are treated as connected
                experiments rather than isolated products.
                Each one explores a different part of the
                larger question: how can intelligence,
                creativity, simulation, and systems design
                reinforce one another?
              </p>

              <p
                className="body"
                style={{
                  marginTop: "18px"
                }}
              >
                GitHub is the public archive. The work can
                change, split, disappear, or evolve into
                something stronger as evidence accumulates.
              </p>

              <div
                className="hero-actions"
                style={{
                  marginTop: "28px"
                }}
              >
                {github && (
                  <a
                    className="button button-primary"
                    href={github.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open GitHub ↗
                  </a>
                )}

                <a
                  className="button button-secondary"
                  href={websiteRepository.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  WEB repository ↗
                </a>
              </div>
            </div>

            <div className="work-index">
              <div className="panel panel-red magic-panel">
                <div className="panel-content">
                  <p className="kicker">
                    CURRENT DIRECTION
                  </p>

                  <p
                    className="body-large"
                    style={{
                      marginTop: "14px"
                    }}
                  >
                    Build small systems that can survive
                    scrutiny and become larger only when
                    the underlying architecture deserves it.
                  </p>

                  <div
                    className="magic-divider"
                    aria-hidden="true"
                  >
                    <span />
                  </div>

                  <div className="work-status-grid">
                    <div>
                      <span>MODE</span>
                      <strong>BUILD</strong>
                    </div>

                    <div>
                      <span>ARCHIVE</span>
                      <strong>PUBLIC</strong>
                    </div>

                    <div>
                      <span>WORLD</span>
                      <strong>ALIVE</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="work-grid">
            {projects.map(
              (project) => (
                <article
                  className="glow-border"
                  key={project.number}
                >
                  <div className="panel magic-panel work-card">
                    <div className="panel-content">
                      <div className="panel-topline">
                        <span className="system-number">
                          {project.number}
                        </span>

                        <span className="system-type">
                          {project.type}
                        </span>
                      </div>

                      <h2 className="system-title">
                        {project.title}
                      </h2>

                      <p className="system-copy">
                        {project.description}
                      </p>

                      <div className="work-card-footer">
                        <span>
                          {project.status}
                        </span>

                        <span
                          className="work-card-pulse"
                          aria-hidden="true"
                        >
                          <i />
                          <i />
                          <i />
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
