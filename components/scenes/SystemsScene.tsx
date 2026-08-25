const systems = [
  {
    number: "01",
    type: "MASTER LAYER",
    title: "AI Instructions",
    description:
      "The operating constitution: instruction hierarchy, evidence handling, tool philosophy, context engineering, verification, security, memory behaviour, and self-governance.",
    signal: "GOVERN"
  },
  {
    number: "02",
    type: "REASONING LAYER",
    title: "REP",
    description:
      "The reasoning architecture: decomposition, verification, adversarial checking, uncertainty handling, critique, and iterative refinement.",
    signal: "REASON"
  },
  {
    number: "03",
    type: "SYSTEM LAYER",
    title: "USEF",
    description:
      "A general system-improvement discipline: identify weaknesses, redesign components, test consequences, measure results, and iterate.",
    signal: "IMPROVE"
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
          02 / SYSTEMS
        </p>
      </div>

      <p className="body-large section-heading-description">
        Three complementary layers form the current
        architecture: govern the environment, strengthen
        reasoning, and improve the system itself.
      </p>
    </div>
  );
}

function SystemCard({
  number,
  type,
  title,
  description,
  signal
}: (typeof systems)[number]) {
  return (
    <article className="glow-border">
      <div className="panel system-card magic-panel">
        <div className="panel-content">
          <div className="panel-topline">
            <span className="system-number">
              {number}
            </span>

            <span className="system-type">
              {type}
            </span>
          </div>

          <h2 className="system-title">
            {title}
          </h2>

          <p className="system-copy">
            {description}
          </p>

          <div className="system-pulse" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="system-signal">
            {signal}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function SystemsScene() {
  return (
    <div className="systems-scene">
      <section className="section">
        <div className="page-container">
          <SectionHeading />

          <div className="three-column">
            {systems.map(
              (system) => (
                <SystemCard
                  key={system.number}
                  {...system}
                />
              )
            )}
          </div>

          <div
            className="glow-border"
            style={{
              marginTop: "20px"
            }}
          >
            <div className="panel panel-red magic-panel">
              <div className="panel-content relationship">
                <div>
                  <p className="kicker">
                    THE RELATIONSHIP
                  </p>

                  <p
                    style={{
                      margin:
                        "12px 0 0",
                      fontSize:
                        "clamp(24px, 4vw, 34px)",
                      fontWeight:
                        900,
                      letterSpacing:
                        "-0.04em"
                    }}
                  >
                    <span className="hero-title-accent">
                      Govern
                    </span>

                    {" → "}

                    <span className="hero-title-accent">
                      Reason
                    </span>

                    {" → "}

                    <span className="hero-title-accent">
                      Improve
                    </span>
                  </p>
                </div>

                <p className="quote">
                  AI Instructions establishes the
                  environment. REP strengthens reasoning
                  behaviour inside it. USEF supplies the
                  discipline for evolving the system itself.
                </p>
              </div>
            </div>
          </div>

          <div className="systems-flow">
            <div className="systems-flow-node">
              <span>01</span>
              <strong>CONSTITUTION</strong>
              <small>
                Define the environment.
              </small>
            </div>

            <div
              className="systems-flow-line"
              aria-hidden="true"
            />

            <div className="systems-flow-node">
              <span>02</span>
              <strong>INTELLIGENCE</strong>
              <small>
                Strengthen reasoning.
              </small>
            </div>

            <div
              className="systems-flow-line"
              aria-hidden="true"
            />

            <div className="systems-flow-node">
              <span>03</span>
              <strong>EVOLUTION</strong>
              <small>
                Improve the system.
              </small>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
