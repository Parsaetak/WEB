const principles = [
  {
    number: "01",
    label: "CURIOSITY",
    title: "QUESTION",
    copy: "Look past the obvious."
  },
  {
    number: "02",
    label: "METHOD",
    title: "BUILD",
    copy: "Turn ideas into working systems."
  },
  {
    number: "03",
    label: "DISCIPLINE",
    title: "STRESS-TEST",
    copy: "Break assumptions before trusting them."
  },
  {
    number: "04",
    label: "CREATION",
    title: "REFINE",
    copy: "Keep what works. Change what does not."
  }
];

const fields = [
  "ARTIFICIAL INTELLIGENCE",
  "REASONING",
  "SYSTEMS",
  "EXPERIMENTAL TECHNOLOGY",
  "PHILOSOPHY",
  "CREATIVE TECHNOLOGY"
];

export default function AboutScene() {
  return (
    <div className="about-scene">
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
          <header className="about-header">
            <div>
              <p className="kicker">
                01 / ABOUT
              </p>

              <h1 className="section-title about-title">
                Parsa Tak
              </h1>

              <p className="body-large about-lead">
                Independent researcher and creator
                working across intelligence,
                technology, systems, and art.
              </p>
            </div>

            <div className="about-signal">
              <span className="about-signal-dot" />

              <span>
                OBSERVE
              </span>
            </div>
          </header>

          <div className="about-identity">
            <div className="about-identity-main">
              <p className="kicker">
                IN PRACTICE
              </p>

              <p className="about-identity-statement">
                I research ideas about intelligence,
                build systems to test them,
                write about what I learn,
                and create visual work around the same questions.
              </p>
            </div>

            <div className="about-identity-side">
              <div>
                <span>
                  BASED AROUND
                </span>

                <strong>
                  AI · REASONING · SYSTEMS
                </strong>
              </div>

              <div>
                <span>
                  OUTPUT
                </span>

                <strong>
                  SOFTWARE · WRITING · ART
                </strong>
              </div>
            </div>
          </div>

          <div className="about-method">
            <div className="about-method-header">
              <div>
                <p className="kicker">
                  METHOD
                </p>

                <h2 className="section-title">
                  Question.
                  <br />
                  Build.
                  <br />
                  Stress-test.
                  <br />
                  Refine.
                </h2>
              </div>

              <p className="body-large about-method-copy">
                The process matters as much as the result.
                Ideas become useful when they survive contact
                with reality.
              </p>
            </div>

            <div className="about-principles">
              {principles.map(
                (principle) => (
                  <article
                    className="panel about-principle"
                    key={principle.number}
                  >
                    <div className="panel-content">
                      <div className="about-principle-top">
                        <span className="system-number">
                          {principle.number}
                        </span>

                        <span className="system-type">
                          {principle.label}
                        </span>
                      </div>

                      <h3 className="system-title">
                        {principle.title}
                      </h3>

                      <p className="system-copy">
                        {principle.copy}
                      </p>
                    </div>
                  </article>
                )
              )}
            </div>
          </div>

          <div className="about-fields">
            <div className="about-fields-header">
              <p className="kicker">
                FIELD
              </p>

              <span>
                06
              </span>
            </div>

            <div className="about-fields-list">
              {fields.map(
                (
                  field,
                  index
                ) => (
                  <span
                    key={field}
                    className="about-field"
                  >
                    <small>
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </small>

                    {field}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
