import PublicLinks from "@/components/PublicLinks";

const principles = [
  {
    label: "PERSONALITY",
    title: "Curious. Intense. Systemic.",
    copy:
      "Look for patterns, weak points, hidden assumptions, and stronger structures."
  },
  {
    label: "WORKING STYLE",
    title:
      "Question → Build → Stress-test → Refine.",
    copy:
      "Ideas become prototypes. Stronger versions survive criticism; weaker versions are replaced."
  },
  {
    label: "VALUES",
    title:
      "Independence. Precision. Creativity.",
    copy:
      "Freedom to explore, discipline to verify, and enough imagination to see possibilities early."
  }
];

function AboutHeading() {
  return (
    <div className="section-heading">
      <div className="section-heading-line">
        <span
          className="section-signal"
          aria-hidden="true"
        />

        <p className="kicker">
          01 / ABOUT
        </p>
      </div>

      <p className="body-large section-heading-description">
        The person behind the systems is less interested
        in collecting technologies than in understanding
        what happens when intelligence becomes an
        architecture.
      </p>
    </div>
  );
}

export default function AboutScene() {
  return (
    <div className="about-scene">
      <section className="section">
        <div className="page-container">
          <AboutHeading />

          <div className="two-column">
            <div className="glow-border">
              <article className="panel panel-red magic-panel">
                <div className="panel-content">
                  <p className="body-large">
                    Parsa Tak is an independent creator
                    and systems-oriented builder whose work
                    increasingly centres on artificial
                    intelligence, reasoning, design, and
                    experimental technology.
                  </p>

                  <p
                    className="body"
                    style={{
                      marginTop: "22px"
                    }}
                  >
                    The direction moved naturally from
                    prompts and isolated experiments toward
                    architecture: systems that can reason
                    deliberately, preserve context, use tools
                    intelligently, verify what matters, and
                    remain understandable as they evolve.
                  </p>

                  <p
                    className="body"
                    style={{
                      marginTop: "22px"
                    }}
                  >
                    The creative side is equally important.
                    AI, visual art, narrative, philosophy,
                    design, strategy, and simulation are
                    treated as connected materials rather than
                    separate disciplines.
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

            <div className="about-principles">
              {principles.map(
                (principle) => (
                  <article
                    className="panel magic-panel"
                    key={principle.label}
                  >
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
                        {principle.label}
                      </p>

                      <h2
                        style={{
                          margin:
                            "12px 0 0",
                          fontSize:
                            "26px"
                        }}
                      >
                        {principle.title}
                      </h2>

                      <p
                        className="body"
                        style={{
                          marginTop:
                            "10px"
                        }}
                      >
                        {principle.copy}
                      </p>
                    </div>
                  </article>
                )
              )}
            </div>
          </div>

          <PublicLinks
            title="PUBLIC NETWORK"
          />
        </div>
      </section>
    </div>
  );
}
