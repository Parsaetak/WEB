import RedMagic from "@/components/RedMagic";

function SectionHeading() {
  return (
    <div className="section-heading">
      <div className="section-heading-line">
        <span
          className="section-signal"
          aria-hidden="true"
        />

        <p className="kicker">
          03 / RED MAGIC
        </p>
      </div>

      <p className="body-large section-heading-description">
        A living visual layer for the system:
        energy, observation, interaction,
        adaptation, and controlled motion.
      </p>
    </div>
  );
}

const metrics = [
  {
    label: "STATE",
    value: "ALIVE"
  },
  {
    label: "MODE",
    value: "ADAPTIVE"
  },
  {
    label: "CORE",
    value: "RED"
  }
];

export default function RedMagicScene() {
  return (
    <div className="red-magic-scene">
      <section className="section magic-section">
        <div className="page-container">
          <SectionHeading />

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

              <h1 className="section-title">
                Intelligence should{" "}
                <span className="hero-title-accent">
                  move.
                </span>
              </h1>

              <p
                className="body-large"
                style={{
                  marginTop: "22px"
                }}
              >
                RED MAGIC is the living visual
                organism inside the website.
                It is designed to feel active,
                responsive, and computationally
                aware rather than behaving like
                a static decoration.
              </p>

              <p
                className="body"
                style={{
                  marginTop: "18px"
                }}
              >
                Its rendering system adapts to
                available performance, pauses
                when it leaves the viewport, and
                responds to pointer presence.
                The result is a visual system that
                can remain alive without forcing
                every other part of the site to
                animate continuously.
              </p>

              <div className="magic-metrics">
                {metrics.map(
                  (metric) => (
                    <div
                      key={metric.label}
                    >
                      <span>
                        {metric.label}
                      </span>

                      <strong>
                        {metric.value}
                      </strong>
                    </div>
                  )
                )}
              </div>

              <div
                className="glow-border"
                style={{
                  marginTop: "18px"
                }}
              >
                <div className="panel panel-red magic-panel">
                  <div className="panel-content">
                    <p className="kicker">
                      SYSTEM PRINCIPLE
                    </p>

                    <p
                      className="body-large"
                      style={{
                        marginTop: "12px"
                      }}
                    >
                      The world persists.
                      The organism activates
                      only where it is needed.
                    </p>

                    <p
                      className="body"
                      style={{
                        marginTop: "12px"
                      }}
                    >
                      This is the model for the
                      whole website: a stable
                      environment with expensive
                      foreground experiences that
                      can be mounted, paused, and
                      replaced independently.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
