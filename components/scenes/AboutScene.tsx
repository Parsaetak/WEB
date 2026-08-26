import PublicLinks from "@/components/PublicLinks";

const principles = [
  {
    index: "01",
    label: "MIND",
    title: "CURIOUS",
    copy: "Find patterns. Question assumptions."
  },
  {
    index: "02",
    label: "METHOD",
    title: "RIGOROUS",
    copy: "Build. Test. Stress-test. Refine."
  },
  {
    index: "03",
    label: "DIRECTION",
    title: "INDEPENDENT",
    copy: "Follow the question, not the trend."
  }
];

const disciplines = [
  "AI",
  "REASONING",
  "SYSTEMS",
  "DESIGN",
  "SIMULATION",
  "ART"
];

export default function AboutScene() {
  return (
    <div
      id="about"
      className="about-scene"
    >
      <section className="section about-observer">
        <div
          className="about-orbit-field"
          aria-hidden="true"
        >
          <span className="about-orbit about-orbit-one" />
          <span className="about-orbit about-orbit-two" />
          <span className="about-orbit about-orbit-three" />

          <span className="about-orbit-axis about-orbit-axis-x" />
          <span className="about-orbit-axis about-orbit-axis-y" />

          <span className="about-orbit-node about-orbit-node-one" />
          <span className="about-orbit-node about-orbit-node-two" />
          <span className="about-orbit-node about-orbit-node-three" />
        </div>

        <div className="page-container">
          <div className="about-header">
            <div>
              <p className="kicker">
                01 / ABOUT
              </p>

              <h1 className="section-title about-title">
                Parsa Tak
              </h1>

              <p className="body-large about-lead">
                Researcher.
                Writer.
                Artist.
                Programmer.
              </p>
            </div>

            <div className="about-signal">
              <span className="about-signal-dot" />

              <span>
                OBSERVE
              </span>
            </div>
          </div>

          <div className="about-observer-grid">
            <article className="panel panel-red about-observer-panel">
              <div className="panel-content">
                <div className="about-observer-mark">
                  <span />
                </div>

                <p className="kicker">
                  FOCUS
                </p>

                <p className="about-focus">
                  Intelligence
                  <br />
                  Systems
                  <br />
                  Creation
                </p>

                <p className="body about-observer-copy">
                  Exploring how ideas become systems,
                  and how systems change the way ideas
                  are understood.
                </p>
              </div>
            </article>

            <div className="about-principles">
              {principles.map(
                (principle) => (
                  <article
                    className="panel about-principle"
                    key={principle.index}
                  >
                    <div className="panel-content">
                      <div className="about-principle-top">
                        <span className="system-number">
                          {principle.index}
                        </span>

                        <span className="system-type">
                          {principle.label}
                        </span>
                      </div>

                      <h2 className="system-title">
                        {principle.title}
                      </h2>

                      <p className="system-copy">
                        {principle.copy}
                      </p>
                    </div>
                  </article>
                )
              )}
            </div>
          </div>

          <div className="about-disciplines">
            <div className="about-disciplines-header">
              <p className="kicker">
                FIELD
              </p>

              <span>
                06
              </span>
            </div>

            <div className="about-disciplines-list">
              {disciplines.map(
                (
                  discipline,
                  index
                ) => (
                  <span
                    key={discipline}
                    className="about-discipline"
                  >
                    <small>
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </small>

                    {discipline}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <PublicLinks
        title="CONNECT"
      />
    </div>
  );
}
