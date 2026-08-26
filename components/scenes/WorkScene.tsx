import {
  PUBLIC_LINKS
} from "@/lib/links";

const projects = [
  {
    number: "01",
    code: "UHIT",
    title: "INTELLIGENCE",
    status: "EVOLVING",
    signal: "01"
  },
  {
    number: "02",
    code: "RED THEORY",
    title: "SIMULATION",
    status: "ACTIVE",
    signal: "02"
  },
  {
    number: "03",
    code: "RED MAGIC",
    title: "ORGANISM",
    status: "ACTIVE",
    signal: "03"
  },
  {
    number: "04",
    code: "AI SYSTEMS",
    title: "ARCHITECTURE",
    status: "RESEARCH",
    signal: "04"
  }
];

const states = [
  {
    label: "BUILD",
    value: "ACTIVE"
  },
  {
    label: "ARCHIVE",
    value: "PUBLIC"
  },
  {
    label: "MODE",
    value: "RESEARCH"
  }
];

export default function WorkScene() {
  const github = PUBLIC_LINKS.social.find(
    (link) => link.id === "github"
  );

  return (
    <div className="work-scene">
      <section className="section work-laboratory">
        <div
          className="work-laboratory-field"
          aria-hidden="true"
        >
          <span className="work-grid-plane" />
          <span className="work-grid-axis work-grid-axis-x" />
          <span className="work-grid-axis work-grid-axis-y" />

          <span className="work-marker work-marker-one" />
          <span className="work-marker work-marker-two" />
          <span className="work-marker work-marker-three" />
          <span className="work-marker work-marker-four" />
        </div>

        <div className="page-container">
          <div className="work-header">
            <div>
              <p className="kicker">
                04 / WORK
              </p>

              <h1 className="section-title work-title">
                The laboratory.
              </h1>

              <p className="body-large work-lead">
                Systems in progress.
              </p>
            </div>

            <div className="work-status">
              <span className="work-status-dot" />

              <span>
                OPEN
              </span>
            </div>
          </div>

          <div className="work-instrument">
            <div className="work-instrument-header">
              <div>
                <p className="kicker">
                  INDEX
                </p>

                <strong>
                  CURRENT PROJECTS
                </strong>
              </div>

              <span>
                04
              </span>
            </div>

            <div className="work-project-list">
              {projects.map(
                (project) => (
                  <article
                    className="work-project"
                    key={project.number}
                    data-status={
                      project.status.toLowerCase()
                    }
                  >
                    <div className="work-project-number">
                      {project.number}
                    </div>

                    <div className="work-project-main">
                      <span className="work-project-code">
                        {project.code}
                      </span>

                      <h2>
                        {project.title}
                      </h2>
                    </div>

                    <div className="work-project-state">
                      <span>
                        {project.status}
                      </span>

                      <i
                        aria-hidden="true"
                      />
                    </div>

                    <div className="work-project-signal">
                      <span>
                        {project.signal}
                      </span>

                      <span
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </div>
                  </article>
                )
              )}
            </div>
          </div>

          <div className="work-laboratory-footer">
            <div className="work-state-grid">
              {states.map(
                (state) => (
                  <div
                    className="work-state"
                    key={state.label}
                  >
                    <span>
                      {state.label}
                    </span>

                    <strong>
                      {state.value}
                    </strong>
                  </div>
                )
              )}
            </div>

            {github && (
              <a
                className="work-archive-link"
                href={github.href}
                target="_blank"
                rel="noreferrer"
              >
                <span>
                  ARCHIVE
                </span>

                <strong>
                  GitHub ↗
                </strong>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
