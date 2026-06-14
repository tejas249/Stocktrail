"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, MapPin } from "lucide-react";
import { ALL_INDIA_LOCATIONS } from "@/lib/india-locations";

export interface SelectedLocation {
  id: string | null; // null = new city, will be auto-created on submit
  name: string;
}

interface Props {
  label: string;
  dbLocations: { id: string; name: string }[];
  value: SelectedLocation | null;
  onChange: (loc: SelectedLocation) => void;
  placeholder?: string;
}

export function LocationCombobox({ label, dbLocations, value, onChange, placeholder = "Select location…" }: Props) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const q = search.toLowerCase();
  const filteredDb = dbLocations.filter((l) => l.name.toLowerCase().includes(q));
  const dbNames = new Set(dbLocations.map((l) => l.name.toLowerCase()));
  const filteredIndia = ALL_INDIA_LOCATIONS.filter(
    (name) => name.toLowerCase().includes(q) && !dbNames.has(name.toLowerCase())
  );

  function pick(loc: SelectedLocation) {
    onChange(loc);
    setOpen(false);
    setSearch("");
  }

  return (
    <div className="space-y-1.5 relative" ref={wrapperRef}>
      <label className="text-sm font-semibold leading-none" style={{ color: "var(--ink-2)" }}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-[10px] border px-3 text-sm text-left transition-all"
        style={{
          borderColor: open ? "var(--primary-hex)" : "var(--line)",
          backgroundColor: "white",
          color: value ? "var(--ink)" : "var(--muted-raw)",
          boxShadow: open ? "0 0 0 3px var(--primary-soft)" : "none",
        }}
      >
        <span className="flex items-center gap-1.5 truncate min-w-0">
          {value ? (
            <>
              <MapPin size={12} style={{ color: "var(--primary-hex)", flexShrink: 0 }} />
              <span className="truncate">{value.name}</span>
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: "var(--muted-2)",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .15s",
          }}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-72 rounded-[12px] border bg-white overflow-hidden"
          style={{
            borderColor: "var(--line)",
            boxShadow: "var(--shadow-pop)",
            animation: "dropdown-in 160ms cubic-bezier(0.16,1,0.3,1)",
            transformOrigin: "top center",
          }}
        >
          {/* Search */}
          <div className="p-2" style={{ borderBottom: "1px solid var(--line-2)" }}>
            <label
              className="flex items-center gap-2 h-8 rounded-[8px] border px-2.5"
              style={{ borderColor: "var(--line)", backgroundColor: "var(--bg)" }}
            >
              <Search size={12} style={{ color: "var(--muted-2)", flexShrink: 0 }} />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
                placeholder="Search cities, states…"
                className="bg-transparent outline-none text-[12.5px] flex-1 placeholder:text-[var(--muted-2)]"
                style={{ color: "var(--ink)" }}
              />
            </label>
          </div>

          <div className="max-h-60 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            {/* Existing DB locations */}
            {filteredDb.length > 0 && (
              <>
                <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>
                  Your Locations
                </p>
                {filteredDb.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => pick({ id: l.id, name: l.name })}
                    className="flex w-full items-center gap-2 px-3 py-[7px] text-[13px] text-left transition-colors hover:bg-[var(--hover)]"
                    style={{
                      color: "var(--ink)",
                      backgroundColor: value?.name === l.name ? "var(--hover)" : "transparent",
                    }}
                  >
                    <MapPin size={12} style={{ color: "var(--primary-hex)", flexShrink: 0 }} />
                    {l.name}
                  </button>
                ))}
              </>
            )}

            {/* Indian states & cities */}
            {filteredIndia.length > 0 && (
              <>
                <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>
                  India — States &amp; Cities
                </p>
                {filteredIndia.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => pick({ id: null, name })}
                    className="flex w-full items-center gap-2 px-3 py-[7px] text-[13px] text-left transition-colors hover:bg-[var(--hover)]"
                    style={{ color: "var(--ink-2)" }}
                  >
                    <MapPin size={12} style={{ color: "var(--muted-2)", flexShrink: 0 }} />
                    {name}
                  </button>
                ))}
              </>
            )}

            {filteredDb.length === 0 && filteredIndia.length === 0 && (
              <p className="px-3 py-8 text-center text-[12.5px]" style={{ color: "var(--muted-raw)" }}>
                No locations match &ldquo;{search}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** POST to /api/locations to create a new location, return its id. */
export async function getOrCreateLocationId(loc: SelectedLocation): Promise<string | null> {
  if (loc.id) return loc.id;
  const res = await fetch("/api/locations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: loc.name }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.location?.id ?? data.location?._id ?? null;
}
