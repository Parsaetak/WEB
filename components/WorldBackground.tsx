export default function WorldBackground() {
  return (
    <div
      className="world-background"
      aria-hidden="true"
    >
      <div className="world-background-grid" />

      <div className="world-background-vignette" />

      <div className="world-ambient world-ambient-red" />

      <div className="world-ambient world-ambient-deep" />

      <div className="world-orbit world-orbit-one" />

      <div className="world-orbit world-orbit-two" />

      <div className="world-signal world-signal-one">
        <span />
      </div>

      <div className="world-signal world-signal-two">
        <span />
      </div>

      <div className="world-signal world-signal-three">
        <span />
      </div>
    </div>
  );
}
