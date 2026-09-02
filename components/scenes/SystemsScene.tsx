import styles from "./SystemsScene.module.css";

const systems = [
  {
    number: "01",
    code: "AI INSTRUCTIONS",
    layer: "OPERATING CONSTITUTION",
    role: "GOVERN",
    title: "Defines the environment",
    copy:
      "Sets the rules for how an intelligent system operates: instruction hierarchy, evidence handling, tools, context, security, memory, and self-governance."
  },
  {
    number: "02",
    code: "REP",
    layer: "REASONING PROTOCOL",
    role: "REASON",
    title: "Strengthens the thinking",
    copy:
      "Structures reasoning through decomposition, verification, critique, adversarial checking, uncertainty handling, and iterative refinement."
  },
  {
    number: "03",
    code: "USEF",
    layer: "SYSTEM IMPROVEMENT",
    role: "IMPROVE",
    title: "Changes the system",
    copy:
      "Provides a discipline for finding weaknesses, redesigning components, testing consequences, measuring results, and iterating."
  }
];

export default function SystemsScene() {
  return (
    <div className={styles.systemsScene}>
      <section className={`section ${styles.systemsArchitecture}`}>
        <div
          className={styles.systemsBlueprint}
          aria-hidden="true"
        >
          <span className={styles.systemsBlueprintGrid} />

          <span
            className={`${styles.systemsBlueprintCross} ${styles.systemsBlueprintCrossOne}`}
          />

          <span
            className={`${styles.systemsBlueprintCross} ${styles.systemsBlueprintCrossTwo}`}
          />

          <span
            className={`${styles.systemsBlueprintAxis} ${styles.systemsBlueprintAxisX}`}
          />

          <span
            className={`${styles.systemsBlueprintAxis} ${styles.systemsBlueprintAxisY}`}
          />
        </div>

        <div className="page-container">
          <header className={styles.systemsHeader}>
            <div className={styles.systemsHeaderCopy}>
              <p className="kicker">
                02 / SYSTEMS
              </p>

              <h1
                className={`section-title ${styles.systemsTitle}`}
              >
                How the
                <br />
                thinking becomes
                <br />
                a system
              </h1>

              <p
                className={`body-large ${styles.systemsLead}`}
              >
                Three connected frameworks:{" "}
                govern the environment,{" "}
                strengthen reasoning,{" "}
                improve the system.
              </p>
            </div>

            <div
              className={styles.systemsStatus}
              aria-label="Systems architecture status"
            >
              <span
                className={styles.systemsStatusDot}
                aria-hidden="true"
              />

              <span>
                ARCHITECTURE
              </span>
            </div>
          </header>

          <div className={styles.systemsModules}>
            {systems.map((system) => (
              <article
                className={styles.systemsModule}
                key={system.number}
                data-module={system.number}
              >
                <div className={styles.systemsModuleFrame}>
                  <div
                    className={`${styles.systemsModuleCorner} ${styles.systemsModuleCornerTl}`}
                  />
                  <div
                    className={`${styles.systemsModuleCorner} ${styles.systemsModuleCornerTr}`}
                  />
                  <div
                    className={`${styles.systemsModuleCorner} ${styles.systemsModuleCornerBl}`}
                  />
                  <div
                    className={`${styles.systemsModuleCorner} ${styles.systemsModuleCornerBr}`}
                  />

                  <div className={styles.systemsModuleIndex}>
                    {system.number}
                  </div>

                  <div className={styles.systemsModuleRole}>
                    {system.role}
                  </div>

                  <div className={styles.systemsModuleCore}>
                    <span className={styles.systemsModuleCode}>
                      {system.code}
                    </span>

                    <span className={styles.systemsModuleLayer}>
                      {system.layer}
                    </span>

                    <h2>
                      {system.title}
                    </h2>
                  </div>

                  <p className={styles.systemsModuleCopy}>
                    {system.copy}
                  </p>

                  <div className={styles.systemsModuleLine}>
                    <span />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <section className={styles.systemsPrinciple}>
            <div className={styles.systemsPrincipleHeading}>
              <p className="kicker">
                CORE IDEA
              </p>

              <h2 className="section-title">
                Intelligence is
                <br />
                not just a model
              </h2>
            </div>

            <p
              className={`body-large ${styles.systemsPrincipleCopy}`}
            >
              The surrounding system matters:{" "}
              how instructions are defined,{" "}
              how reasoning is checked,{" "}
              and how the system learns from{" "}
              its own weaknesses.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
