import { ArrowRight, Navigation, CheckCircle2 } from "lucide-react";
import { useApp } from "../store";
import { directions } from "../routing/directions";
export default function RouteDirections() {
  const s = useApp();
  if (!s.route) return null;
  const instructions = directions(s.route);
  const arrived = s.navigating && s.step === instructions.length;
  function focus(i: number) {
    s.setStep(i);
    const n = s.route!.nodes[Math.min(i, s.route!.nodes.length - 1)];
    s.setFocus([...n.position]);
    s.setSelected(n.building === "OUT" ? null : n.building);
    s.setFloor(Math.max(1, n.floor));
  }
  return (
    <div className="route-results" aria-live="polite">
      <div className="route-heading">
        <b>
          {s.navigating
            ? "YOUR WALK, ONE STEP AT A TIME"
            : "YOUR ROUTE IS READY"}
        </b>
        <button
          onClick={() => {
            s.setRoute(null);
            s.setNavigating(false);
            s.setSelected(null);
          }}
        >
          Clear route
        </button>
      </div>
      <div className="route-summary">
        <strong>
          {Math.max(0, Math.ceil(s.route.seconds / 60))} <span>min</span>
        </strong>
        <span>· {Math.round(s.route.distance)} m</span>
        <small>{s.accessible ? "Step-free" : "Walking"}</small>
      </div>
      <p className="route-disclaimer">
        Illustrative estimates · Follow verified campus signage.
      </p>
      {!instructions.length ? (
        <div className="notice">
          <CheckCircle2 size={18} />
          You’re already at your destination.
        </div>
      ) : (
        <>
          {arrived ? (
            <div className="notice">
              <CheckCircle2 size={20} />
              You’ve arrived at {s.route.nodes.at(-1)!.name}.
            </div>
          ) : (
            <ol className="directions">
              {instructions.map(
                (d, i) =>
                  (!s.navigating || s.step === i) && (
                    <li key={i}>
                      <button
                        className={`direction ${s.step === i ? "active" : ""}`}
                        onClick={() => focus(i)}
                      >
                        <span className="step-number">{i + 1}</span>
                        <span>
                          <b>{d.title}</b>
                          <small>{d.detail}</small>
                        </span>
                      </button>
                    </li>
                  ),
              )}
            </ol>
          )}
          {s.navigating ? (
            <>
              <p className="route-disclaimer">
                {arrived
                  ? "Walk complete"
                  : `Step ${s.step + 1} of ${instructions.length}`}{" "}
                · Manual demo navigation
              </p>
              <div className="navigation-actions">
                <button
                  disabled={s.step === 0}
                  onClick={() => focus(s.step - 1)}
                >
                  Previous
                </button>
                <button onClick={() => s.setNavigating(false)}>Exit</button>
                <button
                  onClick={() =>
                    arrived
                      ? (s.setNavigating(false), focus(0))
                      : focus(s.step + 1)
                  }
                >
                  {arrived
                    ? "View route"
                    : s.step === instructions.length - 1
                      ? "Arrive"
                      : "Next step"}
                </button>
              </div>
            </>
          ) : (
            <button
              className="primary"
              onClick={() => {
                s.setNavigating(true);
                focus(0);
              }}
            >
              <Navigation size={16} />
              Start navigation
              <ArrowRight size={16} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
