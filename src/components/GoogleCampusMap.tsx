import { useEffect, useState } from "react";
import { ExternalLink, Map, Satellite } from "lucide-react";
import { useApp } from "../store";
import { buildings } from "../data/buildings";
import { nodes } from "../data/nodes";
import {
  googleEmbedUrl,
  googleMapUrl,
  googleWalkingUrl,
} from "../data/googleMaps";
export default function GoogleCampusMap() {
  const s = useApp(),
    [satellite, setSatellite] = useState(true),
    [loaded, setLoaded] = useState(false),
    [slow, setSlow] = useState(false);
  const selected = buildings.find((b) => b.id === s.selected),
    start = buildings.find(
      (b) => b.id === nodes.find((n) => n.id === s.start)?.building,
    ),
    end = buildings.find(
      (b) => b.id === nodes.find((n) => n.id === s.end)?.building,
    );
  const src = googleEmbedUrl(selected, satellite);
  useEffect(() => {
    setLoaded(false);
    setSlow(false);
    const timeout = setTimeout(() => setSlow(true), 12000);
    return () => clearTimeout(timeout);
  }, [src]);
  return (
    <div className="google-map-view">
      <div className="google-toolbar">
        <div>
          <b>Google Maps</b>
          <small>
            {selected?.name ?? "SFU Burnaby campus"} · Outdoor reference
          </small>
        </div>
        <div className="google-map-types">
          <button
            className={satellite ? "active" : ""}
            onClick={() => setSatellite(true)}
          >
            <Satellite size={14} />
            Satellite
          </button>
          <button
            className={!satellite ? "active" : ""}
            onClick={() => setSatellite(false)}
          >
            <Map size={14} />
            Map
          </button>
        </div>
        <a
          href={googleMapUrl(selected)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open campus in Google Maps"
        >
          <ExternalLink size={16} />
        </a>
      </div>
      <div className="google-frame">
        {!loaded && (
          <div className="google-loading" role="status">
            {slow
              ? "Google Maps is taking longer to load. You can open it in a new tab above."
              : "Loading Google Maps…"}
          </div>
        )}
        <iframe
          key={src}
          title="Google Maps — SFU Burnaby campus"
          src={src}
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setSlow(true);
          }}
        />
      </div>
      <div className="google-note">
        <span>
          Google Maps shows outdoor geography. Demo classroom routes stay in the
          campus model.
        </span>
        {start && end && start.id !== end.id && (
          <a
            href={googleWalkingUrl(start, end)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Outdoor directions in Google Maps <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
