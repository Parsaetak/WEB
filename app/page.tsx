import RedCursor from "@/components/RedCursor";
import RedEye from "@/components/RedEye";
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

const timeline = [
  {
    label: "FOUNDATION",
    title: "Build the constitutional layer.",
    copy:
      "The system becomes coherent when the governing architecture is explicit instead of scattered across disconnected instructions."
  },
  {
    label: "CONSOLIDATION",
    title: "Give every layer a clear job.",
    copy:
      "Reasoning, governance, improvement, and execution should reinforce one another without competing for control."
  },
  {
    label: "VALIDATION",
    title: "Stress-test the architecture.",
    copy:
      "Adversarial cases, benchmarks, failure analysis, and evidence-driven iteration turn concepts into something measurable."
  },
  {
    label: "PUBLIC SYSTEM",
    title: "Make the laboratory inspectable.",
    copy:
      "GitHub becomes the living archive: experiments, systems, prototypes, documentation, and future iterations."
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

      {description ? (
        <p className="body-large section-heading-description">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default function Home() {
  return (
    <div className="site-shell">
      <RedCursor />

      <div
        className="atmosphere"
        aria-hidden="true"
      >
        <div className="atmosphere-glow atmosphere-glow-red" />
        <div className="atmosphere-glow atmosphere-glow-deep" />

        <div className="magic-orbit magic-orbit-one" />
        <div className="magic-orbit magic-orbit-two" />
      </div>

      <header className="site-nav">
        <div className="site-nav-inner">
          <a
            className="brand"
            href="#top"
            aria-label="Parsa Tak home"
          >
            <span className="brand-eye-wrap">
              <RedEye size={36} />
            </span>

            <span className="brand-name">
              Parsa Tak
            </span>
          </a>

          <nav
            className="nav-links"
            aria-label="Primary navigation"
          >
            <a
              className="nav-link"
              href="#about"
            >
              About
            </a>

            <a
              className="nav-link"
              href="#systems"
            >
              Systems
            </a>

            <a
              className="nav-link"
              href="#magic"
            >
              RED MAGIC
            </a>

            <a
              className="nav-link"
              href="#path"
            >
              Path
            </a>

            <a
              className="nav-link"
              href="https://github.com/Parsaetak"
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="page-container hero-grid">
            <div className="hero-copy">
              <div className="hero-status">
                <span className="status-dot" />
                <span>
                  Actively building
                </span>
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

              <div className="hero-actions">
                <a
                  className="button button-primary"
                  href="#systems"
                >
                  Explore the system
                </a>

                <a
                  className="button button-secondary"
                  href="#magic"
                >
                  Enter RED MAGIC
                </a>

                <a
                  className="button button-secondary"
                  href="https://github.com/Parsaetak"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open GitHub ↗
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

        <section
          id="about"
          className="section"
        >
          <div className="page-container">
            <SectionHeading
              number="01"
              title="ABOUT"
              description="The person behind the systems is less interested in collecting technologies than in understanding what happens when intelligence becomes an architecture."
            />

            <div className="two-column">
              <div className="glow-border">
                <article className="panel panel-red magic-panel">
                  <div className="panel-content">
                    <p className="body-large">
                      Parsa Tak is an independent
                      creator and systems-oriented
                      builder whose work increasingly
                      centres on artificial intelligence,
                      reasoning, design, and
                      experimental technology.
                    </p>

                    <p
                      className="body"
                      style={{ marginTop: "22px" }}
                    >
                      The direction moved naturally
                      from prompts and isolated
                      experiments toward architecture:
                      systems that can reason
                      deliberately, preserve context,
                      use tools intelligently, verify
                      what matters, and remain
                      understandable as they evolve.
                    </p>

                    <p
                      className="body"
                      style={{ marginTop: "22px" }}
                    >
                      The creative side is equally
                      important. AI, visual art,
                      narrative, philosophy, design,
                      strategy, and simulation are
                      treated as connected materials
                      rather than separate disciplines.
                    </p>

                    <div
                      className="magic-divider"
                      aria-hidden="true"
                    >
                      <span />
                    </div>
                  </div>
                </article>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "16px"
                }}
              >
                <article className="panel magic-panel">
                  <div className="panel-content">
                    <div
                      className="panel-signal"
                      aria-hidden="true"
                    >
                      <span />
                      <span />
                      <span />
                    </div>

                    <p className="kicker">
                      PERSONALITY
                    </p>

                    <h2
                      style={{
                        margin: "12px 0 0",
                        fontSize: "26px"
                      }}
                    >
                      Curious. Intense. Systemic.
                    </h2>

                    <p
                      className="body"
                      style={{ marginTop: "10px" }}
                    >
                      Look for patterns, weak
                      points, hidden assumptions,
                      and stronger structures.
                    </p>
                  </div>
                </article>

                <article className="panel magic-panel">
                  <div className="panel-content">
                    <div
                      className="panel-signal"
                      aria-hidden="true"
                    >
                      <span />
                      <span />
                      <span />
                    </div>

                    <p className="kicker">
                      WORKING STYLE
                    </p>

                    <h2
                      style={{
                        margin: "12px 0 0",
                        fontSize: "26px"
                      }}
                    >
                      Question → Build →
                      Stress-test → Refine.
                    </h2>

                    <p
                      className="body"
                      style={{ marginTop: "10px" }}
                    >
                      Ideas become prototypes.
                      Stronger versions survive
                      criticism; weaker versions are
                      replaced.
                    </p>
                  </div>
                </article>

                <article className="panel magic-panel">
                  <div className="panel-content">
                    <div
                      className="panel-signal"
                      aria-hidden="true"
                    >
                      <span />
                      <span />
                      <span />
                    </div>

                    <p className="kicker">
                      VALUES
                    </p>

                    <h2
                      style={{
                        margin: "12px 0 0",
                        fontSize: "26px"
                      }}
                    >
                      Independence. Precision.
                      Creativity.
                    </h2>

                    <p
                      className="body"
                      style={{ marginTop: "10px" }}
                    >
                      Freedom to explore,
                      discipline to verify, and
                      enough imagination to see
                      possibilities early.
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section
          id="systems"
          className="section"
        >
          <div className="page-container">
            <SectionHeading
              number="02"
              title="SYSTEMS"
              description="Three complementary layers form the current architecture: govern the environment, strengthen reasoning, and improve the system itself."
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

            <div
              className="glow-border"
              style={{ marginTop: "20px" }}
            >
              <div className="panel panel-red magic-panel">
                <div className="panel-content relationship">
                  <div>
                    <p className="kicker">
                      THE RELATIONSHIP
                    </p>

                    <p
                      style={{
                        margin: "12px 0 0",
                        fontSize: "30px",
                        fontWeight: 900,
                        letterSpacing: "-0.04em"
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
                    environment. REP strengthens
                    reasoning behaviour inside it.
                    USEF supplies the discipline for
                    evolving the system itself.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="magic"
          className="section magic-section"
        >
          <div className="page-container">
            <SectionHeading
              number="03"
              title="RED MAGIC"
              description="A living visual layer for the system: energy, observation, interaction, and controlled motion."
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
                  RED MAGIC is not a decorative
                  layer. It is the first living visual
                  system inside this website.
                </p>

                <p
                  className="body"
                  style={{
                    marginTop: "18px"
                  }}
                >
                  It continuously evolves,
                  responds to presence, changes
                  its internal activity, and adapts
                  its computational complexity to
                  the environment.
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

        <section
          id="path"
          className="section"
        >
          <div className="page-container">
            <SectionHeading
              number="04"
              title="THE PATH"
              description="The direction is consolidation: fewer disconnected ideas, stronger architecture, clearer validation, and a public system that can keep evolving."
            />

            <div className="two-column">
              <article className="panel panel-red magic-panel">
                <div className="panel-content">
                  <p className="kicker">
                    THE DIRECTION
                  </p>

                  <p
                    className="body-large"
                    style={{
                      marginTop: "18px"
                    }}
                  >
                    Build less noise. Create more
                    leverage.
                  </p>

                  <p
                    className="body"
                    style={{
                      marginTop: "18px"
                    }}
                  >
                    The next generation of the work
                    should be smaller where possible,
                    stronger where necessary, and
                    transparent enough that another
                    person—or another model—can
                    understand the architecture.
                  </p>

                  <p
                    className="quote"
                    style={{
                      marginTop: "28px"
                    }}
                  >
                    The goal is not complexity. The goal
                    is capability that remains
                    understandable.
                  </p>
                </div>
              </article>

              <div className="timeline">
                {timeline.map((item) => (
                  <article
                    className="timeline-item"
                    key={item.label}
                  >
                    <p className="timeline-label">
                      {item.label}
                    </p>

                    <h2 className="timeline-title">
                      {item.title}
                    </h2>

                    <p className="timeline-copy">
                      {item.copy}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-tight">
          <div className="page-container">
            <div className="glow-border">
              <article className="panel panel-red magic-panel">
                <div className="panel-content">
                  <div className="public-work">
                    <div>
                      <p className="kicker">
                        PUBLIC WORK
                      </p>

                      <h2
                        className="section-title"
                        style={{
                          fontSize: "42px"
                        }}
                      >
                        The laboratory is public.
                      </h2>

                      <p
                        className="body"
                        style={{
                          maxWidth: "690px",
                          marginTop: "16px"
                        }}
                      >
                        The ideas, systems,
                        experiments, and future
                        iterations are organized openly
                        on GitHub.
                      </p>
                    </div>

                    <div className="hero-actions public-actions">
                      <a
                        className="button button-primary"
                        href="https://github.com/Parsaetak"
                        target="_blank"
                        rel="noreferrer"
                      >
                        GitHub ↗
                      </a>

                      <a
                        className="button button-secondary"
                        href="https://github.com/Parsaetak/WEB"
                        target="_blank"
                        rel="noreferrer"
                      >
                        WEB ↗
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-container footer-inner">
          <span className="footer-mark">
            © 2026 Parsa Tak · An evolving public
            laboratory.
          </span>

          <span>
            AI systems · reasoning · creative
            architecture · RED MAGIC
          </span>
        </div>
      </footer>
    </div>
  );
}
