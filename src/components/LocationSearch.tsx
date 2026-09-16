import { useId, useState } from "react";
import { MapPin, Search, Check, GraduationCap } from "lucide-react";
import { nodes } from "../data/nodes";
export default function LocationSearch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
}) {
  const id = useId(),
    [query, setQuery] = useState(""),
    [open, setOpen] = useState(false),
    [active, setActive] = useState(0);
  const selected = nodes.find((n) => n.id === value);
  const matches = nodes
    .filter(
      (n) =>
        ["classroom", "entrance", "outdoor", "washroom"].includes(n.type) &&
        `${n.name} ${n.building} ${n.room}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .slice(0, 7);
  function choose(v: string) {
    onChange(v);
    setOpen(false);
    setQuery("");
  }
  return (
    <div className="search-field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <MapPin size={17} />
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={
            open && matches[active] ? `${id}-${active}` : undefined
          }
          value={open ? query : (selected?.name ?? "")}
          placeholder="Search a room or place"
          onFocus={() => {
            setOpen(true);
            setQuery("");
            setActive(0);
          }}
          onBlur={() => setOpen(false)}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(i + 1, matches.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(0, i - 1));
            }
            if (e.key === "Enter" && open && matches[active]) {
              e.preventDefault();
              choose(matches[active].id);
            }
          }}
        />
        <Search size={15} />
      </div>
      {open && (
        <div className="suggestions" id={`${id}-list`} role="listbox">
          {matches.length ? (
            matches.map((n, i) => (
              <button
                key={n.id}
                id={`${id}-${i}`}
                role="option"
                aria-selected={i === active}
                className={i === active ? "active" : ""}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(n.id)}
              >
                <GraduationCap size={16} />
                <span>
                  {n.name}
                  <small>
                    {n.building === "OUT"
                      ? "Outdoor location"
                      : `Level ${n.floor} · Demonstration`}
                  </small>
                </span>
                {value === n.id && <Check size={14} />}
              </button>
            ))
          ) : (
            <p>No matching locations. Try “AQ”.</p>
          )}
        </div>
      )}
    </div>
  );
}
