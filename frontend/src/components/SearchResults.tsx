// src/components/SearchRates.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const tabs = ["CARRIER", "CONTRACT NUMBER", "NAMED ACCOUNT RATES", "CONTAINER"];

export default function SearchRates() {
  const [activeTab, setActiveTab] = useState("CARRIER");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("2023-02-21");
  const [rateType, setRateType] = useState("FCL Buy Rates");

  // autocomplete state
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [originActive, setOriginActive] = useState(-1); // keyboard index
  const [destActive, setDestActive] = useState(-1);

  const originRef = useRef<HTMLInputElement | null>(null);
  const destRef = useRef<HTMLInputElement | null>(null);
  const originBoxRef = useRef<HTMLDivElement | null>(null);
  const destBoxRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  // debounce refs
  const originTimer = useRef<number | null>(null);
  const destTimer = useRef<number | null>(null);
const BACKEND_URL = (import.meta.env.VITE_AUTOCOMPLETE_URL as string) || "http://localhost:3001/api/suggest";

  // helper: fetch suggestions
  const fetchSuggestions = useCallback(async (q: string, setter: (v: string[]) => void) => {
    if (!q.trim()) {
      setter([]);
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}?q=${encodeURIComponent(q)}&limit=10`);
      if (!res.ok) {
        console.error("Autocomplete request failed", res.status);
        setter([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) setter(data);
      else setter([]);
    } catch (err) {
      console.error("Autocomplete fetch error", err);
      setter([]);
    }
  }, [BACKEND_URL]);

  // handle input with debounce
  const handleOriginInput = (value: string) => {
    setOrigin(value);
    setOriginActive(-1);
    if (originTimer.current) window.clearTimeout(originTimer.current);
    originTimer.current = window.setTimeout(() => fetchSuggestions(value, setOriginSuggestions), 200);
  };

  const handleDestInput = (value: string) => {
    setDestination(value);
    setDestActive(-1);
    if (destTimer.current) window.clearTimeout(destTimer.current);
    destTimer.current = window.setTimeout(() => fetchSuggestions(value, setDestinationSuggestions), 200);
  };

  // click outside to close suggestion boxes
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (originBoxRef.current && !originBoxRef.current.contains(e.target as Node)) {
        setOriginSuggestions([]);
        setOriginActive(-1);
      }
      if (destBoxRef.current && !destBoxRef.current.contains(e.target as Node)) {
        setDestinationSuggestions([]);
        setDestActive(-1);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // keyboard handling for origin input
  const onOriginKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const list = originSuggestions;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOriginActive((i) => Math.min(i + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOriginActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (originActive >= 0 && originActive < list.length) {
        setOrigin(list[originActive]);
        setOriginSuggestions([]);
      }
    } else if (e.key === "Escape") {
      setOriginSuggestions([]);
      setOriginActive(-1);
    }
  };

  // keyboard handling for destination input
  const onDestKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const list = destinationSuggestions;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setDestActive((i) => Math.min(i + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setDestActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (destActive >= 0 && destActive < list.length) {
        setDestination(list[destActive]);
        setDestinationSuggestions([]);
      }
    } else if (e.key === "Escape") {
      setDestinationSuggestions([]);
      setDestActive(-1);
    }
  };

  // click handler for selecting suggestion
  const selectOrigin = (val: string) => {
    setOrigin(val);
    setOriginSuggestions([]);
  };
  const selectDest = (val: string) => {
    setDestination(val);
    setDestinationSuggestions([]);
  };

  // highlight match: returns array of parts {text, match}
  const splitHighlight = (text: string, q: string) => {
    const lower = text.toLowerCase();
    const ql = q.toLowerCase();
    const idx = lower.indexOf(ql);
    if (idx === -1 || q.length === 0) return [{ text, match: false }];
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    const parts = [];
    if (before) parts.push({ text: before, match: false });
    parts.push({ text: match, match: true });
    if (after) parts.push({ text: after, match: false });
    return parts;
  };

  // submit search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/search-results?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(
        destination
      )}&date=${date}&rateType=${encodeURIComponent(rateType)}`
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[url('/images/search-bg.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur-md shadow-lg rounded-lg p-6">
        <h1 className="text-xl font-bold mb-4 text-gray-800">SEARCH RATES</h1>

        {/* Form */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* ORIGIN */}
          <div className="relative" ref={originBoxRef}>
            <input
              ref={originRef}
              type="text"
              placeholder="Search Any Origin"
              value={origin}
              onChange={(e) => handleOriginInput(e.target.value)}
              onKeyDown={onOriginKey}
              className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 w-full"
              autoComplete="off"
            />

            {originSuggestions.length > 0 && (
              <div className="absolute z-20 bg-white border w-full rounded shadow max-h-48 overflow-y-auto mt-1">
                {originSuggestions.map((s, idx) => (
                  <div
                    key={s + idx}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between ${
                      idx === originActive ? "bg-gray-100" : ""
                    }`}
                    onMouseDown={(ev) => {
                      // onMouseDown to prevent blur prior to click
                      ev.preventDefault();
                      selectOrigin(s);
                    }}
                  >
                    <div className="text-sm">
                      {splitHighlight(s, origin).map((p, i) =>
                        p.match ? (
                          <span key={i} className="font-semibold">
                            {p.text}
                          </span>
                        ) : (
                          <span key={i}>{p.text}</span>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DESTINATION */}
          <div className="relative" ref={destBoxRef}>
            <input
              ref={destRef}
              type="text"
              placeholder="Search Any Destination"
              value={destination}
              onChange={(e) => handleDestInput(e.target.value)}
              onKeyDown={onDestKey}
              className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 w-full"
              autoComplete="off"
            />

            {destinationSuggestions.length > 0 && (
              <div className="absolute z-20 bg-white border w-full rounded shadow max-h-48 overflow-y-auto mt-1">
                {destinationSuggestions.map((s, idx) => (
                  <div
                    key={s + idx}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between ${
                      idx === destActive ? "bg-gray-100" : ""
                    }`}
                    onMouseDown={(ev) => {
                      ev.preventDefault();
                      selectDest(s);
                    }}
                  >
                    <div className="text-sm">
                      {splitHighlight(s, destination).map((p, i) =>
                        p.match ? (
                          <span key={i} className="font-semibold">
                            {p.text}
                          </span>
                        ) : (
                          <span key={i}>{p.text}</span>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={rateType}
            onChange={(e) => setRateType(e.target.value)}
            className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option>FCL Buy Rates</option>
            <option>LCL Buy Rates</option>
            <option>Spot Rates</option>
          </select>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 col-span-2 mt-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
            >
              Search
            </button>
            <button type="button" className="px-4 py-2 border rounded-md hover:bg-gray-100">
              Save
            </button>
            <button type="button" className="px-4 py-2 border rounded-md hover:bg-gray-100">
              Favorite
            </button>
            <button type="button" className="px-4 py-2 border rounded-md hover:bg-gray-100">
              Copy
            </button>
          </div>
        </form>

        {/* Tabs */}
        <div className="border-b mb-4 flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
              className={`pb-2 text-sm font-medium ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 bg-gray-50/80 rounded-md text-gray-700">
          <p>
            Currently viewing: <span className="font-semibold">{activeTab}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
