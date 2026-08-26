import {
  PUBLIC_LINKS
} from "@/lib/links";

const projects = [
  {
    number: "01",
    code: "UHIT",
    title: "Universal Human Intelligence Test",
    type: "RESEARCH",
    status: "EVOLVING",
    copy: "An adaptive framework for measuring intelligence, reasoning, transfer, and human-AI performance.",
    tags: [
      "INTELLIGENCE",
      "ASSESSMENT"
    ]
  },
  {
    number: "02",
    code: "RED THEORY",
    title: "Living-System Experiment",
    type: "SIMULATION",
    status: "ACTIVE",
    copy: "An experimental model for emergence, adaptation, competition, dissolution, and replacement.",
    tags: [
      "SIMULATION",
      "EVOLUTION"
    ]
  },
  {
    number: "03",
    code: "RED MAGIC",
    title: "Computational Organism",
    type: "EXPERIMENT",
    status: "ACTIVE",
    copy: "A responsive visual organism that turns the website itself into a computational experiment.",
    tags: [
      "CANVAS",
      "ADAPTATION"
    ]
  },
  {
    number: "04",
    code: "AI SYSTEMS",
    title: "Reasoning Architecture",
    type: "SYSTEMS",
    status: "RESEARCH",
    copy: "Local AI tools, reasoning frameworks, context engineering, and autonomous system experiments.",
    tags: [
      "AI",
      "SYSTEMS"
    ]
  }
];

const states = [
  {
    label: "FOCUS",
    value: "INTELLIGENCE"
  },
  {
    label: "OUTPUT",
    value: "SYSTEMS"
  },
  {
    label: "MODE",
    value: "RESEARCH"
  }
];

export default function WorkScene() {
  const github =
    PUBLIC_LINKS.social.find(
      (link) =>
        link.id ===
        "github"
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
                What I am building.
              </h1>

              <p className="body-large work-lead">
                Research becomes projects.
              </p>
            </div>

            <div className="work-status">
              <span className="work-status-dot" />

              <span>
                OPEN
              </span>
            </div>
          </div>

          <div className="work-intro">
            <p className="work-intro-statement">
              I build experiments around intelligence:
              systems that can be measured, challenged,
              visualised, and improved.
            </p>
          </div>

          <div className="work-instrument">
            <div className="work-instrument-header">
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
                      <div className="work-project-meta">
                        <span className="work-project-code">
                          {project.code}
                        </span>

                        <span className="work-project-type">
                          {project.type}
                        </span>
                      </div>

                      <h2>
                        {project.title}
                      </h2>

                      <p className="work-project-copy">
                        {project.copy}
                      </p>

                      <div className="work-project-tags">
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

                    <div className="work-project-state">
                      <span>
                        {project.status}
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
                  FULL ARCHIVE
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
