import { lazy, Suspense, useState } from "react";
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  Accessibility,
  LocateFixed,
  Map,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  Navigation,
  GraduationCap,
  Info,
  X,
  Menu,
  Compass,
  Layers,
  Building2,
} from "lucide-react";
import { AppProvider, useApp } from "./store";
import { findRoute } from "./routing/findRoute";
import { nodes } from "./data/nodes";
import { edges } from "./data/edges";
import RouteDirections from "./components/RouteDirections";
import LocationSearch from "./components/LocationSearch";
const CampusScene = lazy(() => import("./components/CampusScene"));
function Wayfinder() {
  const s = useApp();
  const [dark, setDark] = useState(false),
    [tab, setTab] = useState("directions"),
    [panel, setPanel] = useState(true),
    [notice, setNotice] = useState("");
  return (
    <div className={`app ${dark ? "dark" : ""}`}>
      <header>
        <a className="brand" href="./">
          <span className="sfu">SFU</span>
          <span className="brand-name">
            Campus Wayfinder<small>SIMON FRASER UNIVERSITY</small>
          </span>
        </a>
        <div className="campus-pill">
          <span className="green-dot" />
          Burnaby campus
          <ChevronDown size={14} />
        </div>
        <div className="header-right">
          <span className="demo-pill">DEMO EXPERIENCE</span>
          <button
            className="icon-button"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
      </header>
      <main>
        <button className="mobile-toggle" onClick={() => setPanel(!panel)}>
          <Menu size={16} /> {panel ? "Hide planner" : "Plan a route"}
        </button>
        <aside className={panel ? "" : "collapsed"}>
          <div className="sidebar-content">
            <div className="eyebrow">
              <span /> A LITTLE LESS LOST. A LOT MORE CAMPUS.
            </div>
            <h1>
              Your campus.
              <br />
              Your way.
            </h1>
            <p className="intro">
              From your first class to your next discovery.
              <br />
              Let’s get you there.
            </p>
            <div className="tabs">
              <button
                className={tab === "directions" ? "selected" : ""}
                onClick={() => setTab("directions")}
              >
                <Navigation size={16} />
                Directions
              </button>
              <button
                className={tab === "explore" ? "selected" : ""}
                onClick={() => setTab("explore")}
              >
                <Compass size={17} />
                Explore campus
              </button>
            </div>
            {tab === "directions" ? (
              <>
                <div className="route-form">
                  <LocationSearch
                    label="STARTING POINT"
                    value={s.start}
                    onChange={s.setStart}
                  />
                  <button
                    className="swap"
                    title="Swap locations"
                    aria-label="Swap starting point and destination"
                    onClick={() => {
                      s.setStart(s.end);
                      s.setEnd(s.start);
                    }}
                  >
                    <ArrowDownUp size={16} />
                  </button>
                  <LocationSearch
                    label="DESTINATION"
                    value={s.end}
                    onChange={s.setEnd}
                  />
                </div>
                <button
                  className="location-link"
                  onClick={() =>
                    setNotice(
                      "This demonstration is not georeferenced. Your current position cannot be matched to its map. Indoor location may be approximate.",
                    )
                  }
                >
                  <LocateFixed size={14} />
                  Use my location
                  <Info size={13} />
                </button>
                <div className="access-row">
                  <div className="access-icon">
                    <Accessibility size={20} />
                  </div>
                  <span>
                    <b>Step-free route</b>
                    <small>Prefer elevators and accessible paths</small>
                  </span>
                  <button
                    role="switch"
                    aria-checked={s.accessible}
                    aria-label="Step-free route"
                    className={`toggle ${s.accessible ? "on" : ""}`}
                    onClick={() => s.setAccessible(!s.accessible)}
                  >
                    <span />
                  </button>
                </div>
                <button
                  className="primary"
                  onClick={() => {
                    const result = findRoute(
                      nodes,
                      edges,
                      s.start,
                      s.end,
                      s.accessible,
                    );
                    s.setRoute(result);
                    s.setStep(0);
                    s.setNavigating(false);
                    setNotice(
                      result
                        ? ""
                        : "No valid route exists for these locations and preferences.",
                    );
                    if (result) {
                      s.setSelected(null);
                      s.setFocus(null);
                    }
                  }}
                >
                  <Navigation size={17} />
                  Find my route
                  <ArrowRight size={17} />
                </button>
                {s.route ? (
                  <RouteDirections />
                ) : (
                  <>
                    <div className="section-label">
                      A GOOD PLACE TO START<span>TRY A ROUTE</span>
                    </div>
                    <button
                      className="sample-card"
                      onClick={() => {
                        s.setStart("aq201");
                        s.setEnd("asb101");
                      }}
                    >
                      <span className="sample-icon">
                        <GraduationCap size={21} />
                      </span>
                      <span>
                        <b>From one class to the next</b>
                        <small>
                          Academic Quadrangle <ArrowRight size={11} /> Applied
                          Sciences
                        </small>
                      </span>
                      <ChevronRight size={17} />
                    </button>
                    <button
                      className="sample-card"
                      onClick={() => {
                        s.setStart("aq101");
                        s.setEnd("aq301");
                      }}
                    >
                      <span className="sample-icon lavender">
                        <Layers size={20} />
                      </span>
                      <span>
                        <b>A change of perspective</b>
                        <small>Explore a route between floors</small>
                      </span>
                      <ChevronRight size={17} />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="explore-list">
                {[
                  [
                    "AQ",
                    "Academic Quadrangle",
                    "Classrooms · Courtyard · 3 demo floors",
                  ],
                  [
                    "ASB",
                    "Applied Sciences Building",
                    "Classrooms · Labs · 3 demo floors",
                  ],
                ].map(([id, name, desc]) => (
                  <button
                    className="sample-card"
                    key={id}
                    onClick={() => {
                      s.setSelected(id);
                      s.setFloor(1);
                    }}
                  >
                    <Building2 size={22} />
                    <span>
                      <b>{name}</b>
                      <small>{desc}</small>
                    </span>
                    <ArrowUpRight size={17} />
                  </button>
                ))}
                <p className="intro">
                  Select a building on the map to explore its demonstration
                  floors.
                </p>
              </div>
            )}
            {notice && (
              <div role="status" className="notice">
                {notice}
                <button
                  aria-label="Dismiss message"
                  onClick={() => setNotice("")}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="demo-note">
              <Info size={17} />
              <div>
                <b>A preview of what’s possible</b>
                <p>
                  This map uses illustrative buildings and sample rooms. It’s a
                  demo, not a guide for real-world navigation.
                </p>
              </div>
            </div>
          </div>
          <div className="sidebar-footer">
            <span className="mini-sfu">SFU</span>Made for the journey.
            <span>
              Burnaby, BC <ArrowUpRight size={12} />
            </span>
          </div>
        </aside>
        <section className="map" aria-label="Interactive campus map">
          <Suspense
            fallback={<div className="map-loading">Getting campus ready…</div>}
          >
            <CampusScene />
          </Suspense>
          <div className="map-top">
            <div className="map-title">
              <span className="map-title-icon">
                <Map size={19} />
              </span>
              <span>
                <b>Burnaby campus</b>
                <small>Explore a little. Find your way.</small>
              </span>
            </div>
            <span className="live-badge">
              <span className="green-dot" />
              CAMPUS DEMO
            </span>
          </div>
          <div className="map-bottom">
            <span className="map-instruction">
              Drag to rotate <i /> Scroll to zoom <i /> Click a building to
              explore
            </span>
            <div className="scale">
              <span />
              20 demo units
            </div>
          </div>
          <div className="map-attribution">
            ILLUSTRATIVE CAMPUS MODEL · NOT TO SCALE
          </div>
        </section>
      </main>
    </div>
  );
}
export default function App() {
  return (
    <AppProvider>
      <Wayfinder />
    </AppProvider>
  );
}
