const systems = [
  {
    number: "01",
    code: "AI",
    title: "INSTRUCTIONS",
    signal: "GOVERN",
    copy: "Defines the operating rules."
  },
  {
    number: "02",
    code: "REP",
    title: "REASONING",
    signal: "REASON",
    copy: "Verifies and strengthens thought."
  },
  {
    number: "03",
    code: "USEF",
    title: "EVOLUTION",
    signal: "IMPROVE",
    copy: "Tests and improves the system."
  }
];

const architecture = [
  {
    number: "01",
    label: "GOVERN",
    copy: "Set the rules."
  },
  {
    number: "02",
    label: "REASON",
    copy: "Test the thinking."
  },
  {
    number: "03",
    label: "IMPROVE",
    copy: "Change the system."
  }
];

function SectionHeading() {
  return (
    <div className="systems-header">
      <div>
        <p className="kicker">
          02 / SYSTEMS
        </p>

        <h1 className="section-title systems-title">
          Intelligence
          <br />
          by architecture.
        </h1>
      </div>

      <div className="systems-status">
        <span className="systems-status-dot" />

        <span>
          ONLINE
        </span>
      </div>
    </div>
  );
}

function SystemCard({
  system
}: {
  system: (typeof systems)[number];
}) {
  return (
    <article
      className="systems-module"
      data-module={system.number}
    >
      <div className="systems-module-frame">
        <div className="systems-module-corner systems-module-corner-tl" />
        <div className="systems-module-corner systems-module-corner-tr" />
        <div className="systems-module-corner systems-module-corner-bl" />
        <div className="systems-module-corner systems-module-corner-br" />

        <div className="systems-module-top">
          <span>
            {system.number}
          </span>

          <span>
            {system.signal}
          </span>
        </div>

        <div className="systems-module-core">
          <span className="systems-module-code">
            {system.code}
          </span>

          <h2>
            {system.title}
          </h2>
        </div>

        <p>
          {system.copy}
        </p>

        <div className="systems-module-line">
          <span />
        </div>
      </div>
    </article>
  );
}

function ArchitectureNode({
  node
}: {
  node: (typeof architecture)[number];
}) {
  return (
    <div className="systems-architecture-node">
      <div className="systems-architecture-marker">
        <span>
          {node.number}
        </span>
      </div>

      <div>
        <strong>
          {node.label}
        </strong>

        <small>
          {node.copy}
        </small>
      </div>
    </div>
  );
}

export default function SystemsScene() {
  return (
    <div className="systems-scene">
      <section className="section systems-architecture">
        <div
          className="systems-blueprint"
          aria-hidden="true"
        >
          <span className="systems-blueprint-grid" />
          <span className="systems-blueprint-cross systems-blueprint-cross-one" />
          <span className="systems-blueprint-cross systems-blueprint-cross-two" />
          <span className="systems-blueprint-axis systems-blueprint-axis-x" />
          <span className="systems-blueprint-axis systems-blueprint-axis-y" />
        </div>

        <div className="page-container">
          <SectionHeading />

          <div className="systems-modules">
            {systems.map(
              (system) => (
                <SystemCard
                  key={system.number}
                  system={system}
                />
              )
            )}
          </div>

          <section className="systems-architecture-map">
            <div className="systems-architecture-map-header">
              <div>
                <p className="kicker">
                  ARCHITECTURE
                </p>

                <h2>
                  One system.
                  <br />
                  Three layers.
                </h2>
              </div>

              <span>
                03
              </span>
            </div>

            <div className="systems-architecture-flow">
              {architecture.map(
                (node, index) => (
                  <div
                    className="systems-architecture-step"
                    key={node.number}
                  >
                    <ArchitectureNode
                      node={node}
                    />

                    {index <
                      architecture.length - 1 && (
                      <span
                        className="systems-architecture-connector"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                )
              )}
            </div>
          </section>

          <div className="systems-equation">
            <span>
              GOVERN
            </span>

            <strong>
              →
            </strong>

            <span>
              REASON
            </span>

            <strong>
              →
            </strong>

            <span>
              IMPROVE
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
