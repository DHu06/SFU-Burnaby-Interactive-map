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
import { buildings } from "./data/buildings";
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
          <img
            className="sfu"
            src="/sfu-logo.png"
            alt="Simon Fraser University"
            width="180"
            height="91"
          />
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
                      "Building footprints are georeferenced, but classroom and entrance locations remain demonstrations. Indoor location may be approximate; choose a sample location to try routing.",
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
                {buildings
                  .filter((b) =>
                    [
                      "AQ",
                      "ASB",
                      "LIB",
                      "SUB",
                      "MBC",
                      "RCB",
                      "WMC",
                      "LDC",
                      "SWH",
                      "BLU",
                      "SH",
                      "SSB",
                      "TASC1",
                      "TASC2",
                    ].includes(b.id),
                  )
                  .map(({ id, name, navigable }) => (
                    <button
                      className="sample-card"
                      key={id}
                      onClick={() => {
                        s.setSelected(id);
                        s.setFloor(1);
                        s.setFocus([
                          ...buildings.find((b) => b.id === id)!.position,
                        ]);
                      }}
                    >
                      <Building2 size={22} />
                      <span>
                        <b>{name}</b>
                        <small>
                          {navigable
                            ? "SFU footprint · 3 demo floors"
                            : "SFU building footprint · Outdoor context"}
                        </small>
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
                <b>Real footprints. Demo routes.</b>
                <p>
                  Building outlines come from SFU GIS. Heights, rooms, and
                  routes are illustrative, not verified navigation.
                </p>
              </div>
            </div>
          </div>
          <div className="sidebar-footer">
            <img
              className="mini-sfu"
              src="/sfu-logo.png"
              alt="SFU"
              width="180"
              height="91"
            />
            Made for the journey.
            <span>
              Burnaby, BC <ArrowUpRight size={12} />
            </span>
          </div>
        </aside>
        <section
          className="map"
          data-view={s.mapView}
          aria-label="Interactive campus map"
        >
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
                <small>SFU footprints · Approximate heights</small>
              </span>
            </div>
            <span className="live-badge">
              <span className="green-dot" />
              SFU GIS · 2024
            </span>
          </div>
          <div className="map-bottom">
            <span className="map-instruction">
              {s.mapView === "2d" || s.mapView === "top"
                ? "Drag to pan"
                : "Drag to rotate"}{" "}
              <i /> Scroll to zoom <i /> Click a building to explore
            </span>
            <div className="scale">North-up in top view</div>
          </div>
          <div className="map-attribution">
            <a
              href="https://www.sfu.ca/fs/campus-maps.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              SFU FACILITIES GIS
            </a>{" "}
            · HEIGHTS & ROUTES APPROXIMATE
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
