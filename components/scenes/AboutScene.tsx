import styles from "./AboutScene.module.css";

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

export default function AboutScene() {
  return (
    <div className={styles.aboutScene}>
      <section className={`section ${styles.aboutObserver}`}>
        <div
          className={styles.aboutOrbitField}
          aria-hidden="true"
        >
          <span
            className={`${styles.aboutOrbit} ${styles.aboutOrbitOne}`}
          />
          <span
            className={`${styles.aboutOrbit} ${styles.aboutOrbitTwo}`}
          />
          <span
            className={`${styles.aboutOrbit} ${styles.aboutOrbitThree}`}
          />

          <span
            className={`${styles.aboutOrbitAxis} ${styles.aboutOrbitAxisX}`}
          />
          <span
            className={`${styles.aboutOrbitAxis} ${styles.aboutOrbitAxisY}`}
          />

          <span
            className={`${styles.aboutOrbitNode} ${styles.aboutOrbitNodeOne}`}
          />
          <span
            className={`${styles.aboutOrbitNode} ${styles.aboutOrbitNodeTwo}`}
          />
          <span
            className={`${styles.aboutOrbitNode} ${styles.aboutOrbitNodeThree}`}
          />
        </div>

        <div className="page-container">
          <header className={styles.aboutHeader}>
            <div className={styles.aboutHeaderCopy}>
              <p className="kicker">
                01 / ABOUT
              </p>

              <h1 className={`section-title ${styles.aboutTitle}`}>
                Parsa Tak
              </h1>

              <p className={`body-large ${styles.aboutLead}`}>
                Independent researcher and creator{" "}
                working across intelligence,{" "}
                technology, systems, and art.
              </p>
            </div>

            <div
              className={styles.aboutSignal}
              aria-label="Observe"
            >
              <span
                className={styles.aboutSignalDot}
                aria-hidden="true"
              />

              <span>
                OBSERVE
              </span>
            </div>
          </header>

          <div className={styles.aboutIdentity}>
            <div className={styles.aboutIdentityMain}>
              <p className="kicker">
                IN PRACTICE
              </p>

              <p className={styles.aboutIdentityStatement}>
                I research ideas about intelligence,{" "}
                build systems to test them,{" "}
                write about what I learn,{" "}
                and create visual work around{" "}
                the same questions.
              </p>
            </div>

            <div className={styles.aboutIdentitySide}>
              <div className={styles.aboutIdentityCard}>
                <span className={styles.aboutIdentityCardLabel}>
                  BASED AROUND
                </span>

                <strong className={styles.aboutIdentityCardValue}>
                  <span>AI</span>
                  <i>·</i>
                  <span>REASONING</span>
                  <i>·</i>
                  <span>SYSTEMS</span>
                </strong>
              </div>

              <div className={styles.aboutIdentityCard}>
                <span className={styles.aboutIdentityCardLabel}>
                  OUTPUT
                </span>

                <strong className={styles.aboutIdentityCardValue}>
                  <span>SOFTWARE</span>
                  <i>·</i>
                  <span>WRITING</span>
                  <i>·</i>
                  <span>ART</span>
                </strong>
              </div>
            </div>
          </div>

          <div className={styles.aboutMethod}>
            <div className={styles.aboutMethodHeader}>
              <div>
                <p className="kicker">
                  METHOD
                </p>

                <h2 className="section-title">
                  Question
                  <br />
                  Build
                  <br />
                  Stress-test
                  <br />
                  Refine
                </h2>
              </div>

              <p className={`body-large ${styles.aboutMethodCopy}`}>
                The process matters as much as the result.{" "}
                Ideas become useful when they survive contact{" "}
                with reality.
              </p>
            </div>

            <div className={styles.aboutPrinciples}>
              {principles.map((principle) => (
                <article
                  className={`panel ${styles.aboutPrinciple}`}
                  key={principle.number}
                >
                  <div className="panel-content">
                    <div className={styles.aboutPrincipleTop}>
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
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
