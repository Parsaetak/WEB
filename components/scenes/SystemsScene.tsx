const systems = [
  {
    number: "01",
    code: "AI INSTRUCTIONS",
    layer: "OPERATING CONSTITUTION",
    role: "GOVERN",
    title: "Defines the environment",
    copy: "Sets the rules for how an intelligent system operates: instruction hierarchy, evidence handling, tools, context, security, memory, and self-governance."
  },
  {
    number: "02",
    code: "REP",
    layer: "REASONING PROTOCOL",
    role: "REASON",
    title: "Strengthens the thinking",
    copy: "Structures reasoning through decomposition, verification, critique, adversarial checking, uncertainty handling, and iterative refinement."
  },
  {
    number: "03",
    code: "USEF",
    layer: "SYSTEM IMPROVEMENT",
    role: "IMPROVE",
    title: "Changes the system",
    copy: "Provides a discipline for finding weaknesses, redesigning components, testing consequences, measuring results, and iterating."
  }
];



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
          <header className="systems-header">
            <div>
              <p className="kicker">
                02 / SYSTEMS
              </p>

              <h1 className="section-title systems-title">
                How the
                <br />
                thinking becomes
                <br />
                a system
              </h1>

              <p className="body-large systems-lead">
                Three connected frameworks:
                govern the environment,
                strengthen reasoning,
                improve the system.
              </p>
            </div>

            <div className="systems-status">
              <span className="systems-status-dot" />

              <span>
                ARCHITECTURE
              </span>
            </div>
          </header>

          <div className="systems-modules">
            {systems.map(
              (system) => (
                <article
                  className="systems-module"
                  key={system.number}
                  data-module={
                    system.number
                  }
                >
                  <div className="systems-module-frame">
                    <div className="systems-module-corner systems-module-corner-tl" />
                    <div className="systems-module-corner systems-module-corner-tr" />
                    <div className="systems-module-corner systems-module-corner-bl" />
                    <div className="systems-module-corner systems-module-corner-br" />

                    

                    <div className="systems-module-core">
                      <span className="systems-module-code">
                        {system.code}
                      </span>

                      <span className="systems-module-layer">
                        {system.layer}
                      </span>

                      <h2>
                        {system.title}
                      </h2>
                    </div>

                    <p className="systems-module-copy">
                      {system.copy}
                    </p>

                    <div className="systems-module-line">
                      <span />
                    </div>
                  </div>
                </article>
              )
            )}
          </div>

          
          <section className="systems-principle">
            <div>
              <p className="kicker">
                CORE IDEA
              </p>

              <h2 className="section-title">
                Intelligence is
                <br />
                not just a model
              </h2>
            </div>

            <p className="body-large systems-principle-copy">
              The surrounding system matters:
              how instructions are defined,
              how reasoning is checked,
              and how the system learns from
              its own weaknesses.
            </p>
          </section>

          
        </div>
      </section>
    </div>
  );
}
