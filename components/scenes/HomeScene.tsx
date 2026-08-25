import RedMagic from "@/components/RedMagic";

const systems = [
  {
    number: "01",
    type: "MASTER LAYER",
    title: "AI Instructions",
    copy:
      "The operating constitution: instruction hierarchy, evidence handling, tool philosophy, context engineering, verification, security, memory behaviour, and self-governance."
  },
  {
    number: "02",
    type: "REASONING LAYER",
    title: "REP",
    copy:
      "The reasoning architecture: decomposition, verification, adversarial checking, uncertainty handling, critique, and iterative refinement."
  },
  {
    number: "03",
    type: "SYSTEM LAYER",
    title: "USEF",
    copy:
      "A general system-improvement discipline: identify weaknesses, redesign components, test consequences, measure results, and iterate."
  }
];

function SectionHeading({
  number,
  title,
  description
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="section-heading">
      <div className="section-heading-line">
        <span
          className="section-signal"
          aria-hidden="true"
        />

        <p className="kicker">
          {number} / {title}
        </p>
      </div>

      <p className="body-large section-heading-description">
        {description}
      </p>
    </div>
  );
}

export default function HomeScene() {
  return (
    <div className="home-scene">
      <section className="hero">
        <div className="page-container hero-grid">
          <div className="hero-copy">
            <div className="hero-status">
              <span className="status-dot" />
              <span>Actively building</span>
            </div>

            <p className="kicker">
              PARSA TAK / INDEPENDENT BUILDER
            </p>

            <h1
              className="hero-title"
              style={{
                marginTop: "14px"
              }}
            >
              Building AI systems,
              <br />

              <span className="hero-title-accent">
                living worlds
              </span>

              <br />

              & ideas.
            </h1>

            <p className="body-large hero-description">
              Turning intelligence into
              architecture.
            </p>

            <p
              className="body"
              style={{
                maxWidth: "720px",
                marginTop: "20px"
              }}
            >
              This is the public laboratory of
              an independent builder working
              across AI systems, reasoning
              architecture, creative technology,
              system design, and experimental
              worlds.
            </p>
          </div>

          <div
            className="hero-magic"
            aria-label="RED MAGIC living organism"
          >
            <div className="hero-magic-frame">
              <RedMagic />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-container">
          <SectionHeading
            number="01"
            title="SYSTEMS"
            description="The architecture is designed around complementary layers: governance, reasoning, and continuous improvement."
          />

          <div className="three-column">
            {systems.map((system) => (
              <article
                className="glow-border"
                key={system.number}
              >
                <div className="panel system-card magic-panel">
                  <div className="panel-content">
                    <div className="panel-topline">
                      <span className="system-number">
                        {system.number}
                      </span>

                      <span className="system-type">
                        {system.type}
                      </span>
                    </div>

                    <h2 className="system-title">
                      {system.title}
                    </h2>

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
            ))}
          </div>
        </div>
      </section>

      <section className="section magic-section">
        <div className="page-container">
          <SectionHeading
            number="02"
            title="RED MAGIC"
            description="The living layer of the website: movement, observation, interaction, adaptation, and controlled energy."
          />

          <div className="magic-system">
            <div className="magic-system-organism">
              <RedMagic />
            </div>

            <div className="magic-system-copy">
              <div className="magic-status">
                <span className="status-dot" />

                <span>
                  Organism online
                </span>
              </div>

              <p className="kicker">
                LIVING SYSTEM / 001
              </p>

              <h2 className="section-title">
                Intelligence should{" "}
                <span className="hero-title-accent">
                  move.
                </span>
              </h2>

              <p
                className="body-large"
                style={{
                  marginTop: "22px"
                }}
              >
                RED MAGIC is not intended to be
                background decoration. It is the
                first active visual organism inside
                the site.
              </p>

              <p
                className="body"
                style={{
                  marginTop: "18px"
                }}
              >
                The renderer changes its activity,
                responds to presence, and adapts
                computational complexity so the
                visual system can remain alive
                without dominating the page.
              </p>

              <div className="magic-metrics">
                <div>
                  <span>STATE</span>
                  <strong>ALIVE</strong>
                </div>

                <div>
                  <span>MODE</span>
                  <strong>ADAPTIVE</strong>
                </div>

                <div>
                  <span>CORE</span>
                  <strong>RED</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
