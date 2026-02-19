// src/pages/RateResultsPage.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

type RateItem = {
  id: number;
  origin: string;
  destination: string;
  carrier?: string;
  rate20?: number;     // 20ft container price
  rate40?: number;     // 40ft container price
  rate40hc?: number;   // 40ft HC price
  currency?: string;
  date?: string;
  description?: string;
};

const PER_PAGE = 10;
const BACKEND = (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:3001";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const RateResultsPage: React.FC = () => {
  const q = useQuery();
  const origin = q.get("origin") || "";
  const destination = q.get("destination") || "";
  const date = q.get("date") || "";
  const rateType = q.get("rateType") || "";

  const [results, setResults] = useState<RateItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [sort, setSort] = useState<string>("relevance");
  const [surchargesOpen, setSurchargesOpen] = useState<boolean>(false);

  const fetchResults = useCallback(
    async (pg = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (origin) params.append("origin", origin);
        if (destination) params.append("destination", destination);
        if (date) params.append("date", date);
        if (rateType) params.append("rateType", rateType);
        params.append("limit", String(PER_PAGE));
        params.append("page", String(pg));
        params.append("sort", sort);

        const res = await fetch(`${BACKEND}/api/rates?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch rates");
        const data = await res.json();

        // Expecting backend to return { total, page, results: [...] }
        setResults(data.results || []);
        setTotal(data.total || 0);
        setPage(data.page || pg);
      } catch (err) {
        console.error("Fetch error:", err);
        setResults([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [origin, destination, date, rateType, sort]
  );

  useEffect(() => {
    fetchResults(1);
  }, [fetchResults]);

  const addToCart = async (rateId: number) => {
    try {
      const res = await fetch(`${BACKEND}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rateId }),
      });
      if (!res.ok) throw new Error("Add to cart failed");
      // minimal feedback
      alert("Added to cart");
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-lg font-bold text-green-700">MARINEX</div>
            <nav className="flex gap-6 text-sm text-gray-600">
              <Link to="/rate-search" className="text-green-600">Rate Search</Link>
              <span>Rate Management</span>
              <span>Quoting</span>
            </nav>
          </div>
          <div className="text-sm text-gray-600">User ▾</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-6 px-6">
        {/* Search summary section */}
        <section className="bg-white rounded shadow p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 flex flex-wrap gap-3 items-center">
              {/* origin/destination chips */}
              <div className="flex flex-wrap gap-2">
                {origin ? (
                  <div className="px-3 py-1 border rounded-full bg-white text-green-700 text-sm ring-1 ring-green-200">
                    {origin} <span className="ml-2 text-gray-400">×</span>
                  </div>
                ) : (
                  <div className="px-3 py-1 border rounded-full bg-gray-50 text-gray-500 text-sm">Any Origin</div>
                )}

                {destination ? (
                  <div className="px-3 py-1 border rounded-full bg-white text-green-700 text-sm ring-1 ring-green-200">
                    {destination} <span className="ml-2 text-gray-400">×</span>
                  </div>
                ) : (
                  <div className="px-3 py-1 border rounded-full bg-gray-50 text-gray-500 text-sm">Any Destination</div>
                )}
              </div>

              {/* date and rate type */}
              <div className="ml-4">
                <div className="inline-block px-3 py-1 border rounded bg-white text-gray-600 text-sm">{date || "Any Date"}</div>
                <div className="inline-block ml-2 px-3 py-1 border rounded bg-white text-gray-600 text-sm">{rateType || "Any Rate Type"}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSurchargesOpen(!surchargesOpen)}
                className="px-3 py-2 border rounded text-sm"
              >
                Surcharges
              </button>

              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Search</button>
            </div>
          </div>

          {surchargesOpen && (
            <div className="mt-3 p-3 border rounded bg-gray-50 text-sm text-gray-700">
              <strong>Surcharges:</strong> Filters go here (placeholder).
            </div>
          )}
        </section>

        {/* Filters row */}
        <section className="mb-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-2 border rounded text-sm flex items-center gap-2">
                <span>Sort by:</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm ml-2">
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
              </div>

              <div className="px-3 py-2 border rounded text-sm">
                Currency:
                <select className="ml-2 text-sm">
                  <option>USD</option>
                  <option>EUR</option>
                </select>
              </div>

              <button className="px-3 py-2 border rounded text-sm">More Filters</button>
            </div>

            <div className="text-sm text-gray-600">
              Total Results: <span className="font-semibold">{total}</span>
            </div>
          </div>
        </section>

        {/* Dark route bar */}
        <div className="bg-slate-800 text-white rounded-t-md py-3 px-4 mb-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-sm font-semibold">
              {origin || "USCHI"} → {destination || "INNSA"} &nbsp; | &nbsp; {total} Results
            </div>
            <div className="text-xs text-gray-200">Source &nbsp; • &nbsp; Add To Cart &nbsp; • &nbsp; Cntr. 20 ft &nbsp; • &nbsp; Cntr. 40 ft</div>
          </div>
        </div>

        {/* Results list with price columns */}
        <section className="bg-white border-t border-b rounded-b-md">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading results...</div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No results found</div>
          ) : (
            <div className="divide-y">
              {results.map((r) => (
                <div key={r.id} className="p-6 grid grid-cols-12 gap-4 items-center">
                  {/* left block: logo + meta */}
                  <div className="col-span-3 flex gap-4 items-start">
                    <div className="w-28 h-20 bg-gray-100 border rounded flex items-center justify-center shrink-0">
                      <span className="text-xs text-gray-600">{r.carrier || "Logo"}</span>
                    </div>

                    <div className="text-xs text-gray-600">
                      <div className="font-semibold text-sm">{r.origin}</div>
                      <div className="text-sm">{r.destination}</div>
                      <div className="text-xs text-gray-400 mt-1">{r.description || ""}</div>
                    </div>
                  </div>

                  {/* routing / middle info */}
                  <div className="col-span-5">
                    <div className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">{r.origin.split(",")[0]}</span>
                      {" • "}
                      <span className="text-xs text-gray-500">{r.destination}</span>
                    </div>
                    <div className="text-xs text-gray-500">Routing: {r.origin} → {r.destination}</div>
                    <div className="text-xs text-green-600 mt-2">EXP: {r.date || "—"}</div>
                  </div>

                  {/* price columns right */}
                  <div className="col-span-4 grid grid-cols-3 gap-4 items-center">
                    {/* 20ft column */}
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {typeof r.rate20 === "number" ? `${r.rate20.toFixed(2)} ${r.currency || "USD"}` : "—"}
                      </div>
                      <div className="text-xs text-gray-500">Ctr. 20 ft</div>
                      <div className="mt-3">
                        <button onClick={() => addToCart(r.id)} className="w-full px-3 py-2 border rounded text-sm">
                          Add to cart
                        </button>
                      </div>
                    </div>

                    {/* 40ft column */}
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {typeof r.rate40 === "number" ? `${r.rate40.toFixed(2)} ${r.currency || "USD"}` : "—"}
                      </div>
                      <div className="text-xs text-gray-500">Ctr. 40 ft</div>
                      <div className="mt-3">
                        <button onClick={() => addToCart(r.id)} className="w-full px-3 py-2 border rounded text-sm">
                          Add to cart
                        </button>
                      </div>
                    </div>

                    {/* 40ft HC column */}
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {typeof r.rate40hc === "number" ? `${r.rate40hc.toFixed(2)} ${r.currency || "USD"}` : "—"}
                      </div>
                      <div className="text-xs text-gray-500">Ctr. 40 ft HC</div>
                      <div className="mt-3">
                        <button onClick={() => addToCart(r.id)} className="w-full px-3 py-2 border rounded text-sm">
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * PER_PAGE + 1} - {Math.min(page * PER_PAGE, total)} of {total}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchResults(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => fetchResults(page + 1)}
              disabled={page * PER_PAGE >= total}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RateResultsPage;
