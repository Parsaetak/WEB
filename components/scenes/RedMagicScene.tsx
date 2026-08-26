import RedMagic from "@/components/RedMagic";

const principles = [
  {
    number: "01",
    title: "RESPOND",
    copy: "React to the environment."
  },
  {
    number: "02",
    title: "ADAPT",
    copy: "Change behaviour with conditions."
  },
  {
    number: "03",
    title: "PERSIST",
    copy: "Remain coherent while changing."
  }
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
          <header className="magic-organism-header">
            <div>
              <p className="kicker">
                03 / MAGIC
              </p>

              <h1 className="section-title magic-organism-title">
                RED MAGIC
              </h1>

              <p className="body-large magic-organism-lead">
                A living interface for exploring
                responsive systems.
              </p>
            </div>

            <div className="magic-organism-status">
              <span className="status-dot" />

              <span>
                ALIVE
              </span>
            </div>
          </header>

          <div className="magic-organism-purpose">
            <div>
              <p className="kicker">
                PURPOSE
              </p>

              <h2 className="section-title">
                Not decoration.
                <br />
                An experiment.
              </h2>
            </div>

            <p className="body-large magic-organism-purpose-copy">
              RED MAGIC explores what happens when
              a digital interface behaves less like
              a static page and more like a living system:
              responsive, adaptive, and continuously changing.
            </p>
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

          

          <section className="magic-organism-principles">
            <div className="magic-organism-principles-header">
              <div>
                <p className="kicker">
                  PRINCIPLES
                </p>

                <h2 className="section-title">
                  Living behaviour.
                </h2>
              </div>
            </div>

            <div className="magic-organism-principles-grid">
              {principles.map(
                (principle) => (
                  <article
                    className="magic-organism-principle"
                    key={principle.number}
                  >
                    <span>
                      {principle.number}
                    </span>

                    <h3>
                      {principle.title}
                    </h3>

                    <p>
                      {principle.copy}
                    </p>
                  </article>
                )
              )}
            </div>
          </section>

          <section className="magic-organism-future">
            <div>
              <p className="kicker">
                LONG TERM
              </p>

              <h2 className="section-title">
                Toward living
                <br />
                digital systems.
              </h2>
            </div>

            <p className="body-large magic-organism-future-copy">
              RED MAGIC is one small experiment inside
              a larger question: how far can software
              move from being a passive tool toward
              becoming an adaptive system with its own
              observable behaviour?
            </p>
          </section>

          
        </div>
      </section>
    </div>
  );
}
