import PublicLinks from "@/components/PublicLinks";
import RedMagic from "@/components/RedMagic";
import { PUBLIC_LINKS } from "@/lib/links";

const capabilities = [
  {
    number: "01",
    title: "RESEARCH",
    copy:
      "Exploring intelligence, reasoning, adaptive systems, human cognition, and experimental architectures through independent research and prototypes."
  },
  {
    number: "02",
    title: "PROGRAMMING",
    copy:
      "Designing and building software systems, AI tooling, interactive experiences, computational experiments, and living digital environments."
  },
  {
    number: "03",
    title: "WRITING",
    copy:
      "Developing frameworks, books, theories, and long-form ideas that turn abstract questions into structured systems and testable concepts."
  },
  {
    number: "04",
    title: "ART",
    copy:
      "Working across visual art, digital creation, AI-assisted creativity, identity, interaction, and experimental visual worlds."
  }
];

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
  const github = PUBLIC_LINKS.social.find(
    (link) => link.id === "github"
  );

  return (
    <div className="home-scene">
      <section className="hero">
        <div className="page-container hero-grid">
          <div className="hero-copy">
            <div className="hero-status">
              <span className="status-dot" />

              <span>
                Independent research / active build
              </span>
            </div>

            <p className="kicker">
              PARSA TAK / RESEARCHER / WRITER / ARTIST / PROGRAMMER
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
              Researching intelligence.
              Building systems.
              Writing ideas.
              Creating art.
            </p>

            <p
              className="body"
              style={{
                maxWidth: "760px",
                marginTop: "20px"
              }}
            >
              Parsa Tak is an independent
              researcher, writer, artist, and
              programmer working across artificial
              intelligence, reasoning architecture,
              software systems, creative technology,
              simulation, and experimental worlds.
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
                  Explore GitHub ↗
                </a>
              )}

              <a
                className="button button-secondary"
                href="#about"
              >
                Explore the network ↓
              </a>
            </div>
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
            title="CAPABILITIES"
            description="Four connected practices define the work: investigate deeply, build precisely, express ideas clearly, and turn imagination into visual systems."
          />

          <div className="four-column">
            {capabilities.map(
              (capability) => (
                <article
                  className="glow-border"
                  key={capability.number}
                >
                  <div className="panel magic-panel">
                    <div className="panel-content">
                      <div className="panel-topline">
                        <span className="system-number">
                          {capability.number}
                        </span>

                        <span className="system-type">
                          CAPABILITY
                        </span>
                      </div>

                      <h2 className="system-title">
                        {capability.title}
                      </h2>

                      <p className="system-copy">
                        {capability.copy}
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

      <section className="section">
        <div className="page-container">
          <SectionHeading
            number="02"
            title="SYSTEMS"
            description="The architecture is designed around complementary layers: governance, reasoning, and continuous improvement."
          />

          <div className="three-column">
            {systems.map(
              (system) => (
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
              )
            )}
          </div>
        </div>
      </section>

      <section className="section magic-section">
        <div className="page-container">
          <SectionHeading
            number="03"
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
                RED MAGIC is not intended to
                be background decoration. It
                is the first active visual
                organism inside the site.
              </p>

              <p
                className="body"
                style={{
                  marginTop: "18px"
                }}
              >
                The renderer responds to
                presence and adapts its
                computational complexity
                so the visual system can
                remain alive without
                dominating the page.
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

      <PublicLinks
        compact
        title="CONNECT"
      />
    </div>
  );
}
