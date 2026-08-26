import RedMagic from "@/components/RedMagic";

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

const signals = [
  "RESPONSIVE",
  "ADAPTIVE",
  "PERFORMANT"
];

export default function RedMagicScene() {
  return (
    <div className="red-magic-scene">
      <section className="section magic-organism">
        <div
          className="magic-organism-field"
          aria-hidden="true"
        >
          <span className="magic-organism-ring magic-organism-ring-one" />
          <span className="magic-organism-ring magic-organism-ring-two" />
          <span className="magic-organism-ring magic-organism-ring-three" />

          <span className="magic-organism-axis magic-organism-axis-x" />
          <span className="magic-organism-axis magic-organism-axis-y" />

          <span className="magic-organism-node magic-organism-node-one" />
          <span className="magic-organism-node magic-organism-node-two" />
          <span className="magic-organism-node magic-organism-node-three" />
          <span className="magic-organism-node magic-organism-node-four" />
        </div>

        <div className="page-container">
          <div className="magic-organism-header">
            <div>
              <p className="kicker">
                03 / MAGIC
              </p>

              <h1 className="section-title magic-organism-title">
                RED MAGIC
              </h1>

              <p className="body-large magic-organism-lead">
                A living system.
              </p>
            </div>

            <div className="magic-organism-status">
              <span className="status-dot" />

              <span>
                ALIVE
              </span>
            </div>
          </div>

          <div className="magic-organism-core">
            <div className="magic-organism-canvas">
              <RedMagic />
            </div>

            <div className="magic-organism-label">
              <span>
                CORE
              </span>

              <strong>
                RED
              </strong>
            </div>
          </div>

          <div className="magic-organism-metrics">
            {metrics.map(
              (metric) => (
                <div
                  key={metric.label}
                  className="magic-organism-metric"
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

          <div className="magic-organism-signals">
            {signals.map(
              (
                signal,
                index
              ) => (
                <div
                  key={signal}
                  className="magic-organism-signal"
                >
                  <span>
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <strong>
                    {signal}
                  </strong>

                  <i aria-hidden="true" />
                </div>
              )
            )}
          </div>

          <div className="magic-organism-statement">
            <span>
              INPUT
            </span>

            <strong>
              INTERACTION
            </strong>

            <span>
              RESPONSE
            </span>

            <span>
              →
            </span>

            <strong>
              ADAPTATION
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}
