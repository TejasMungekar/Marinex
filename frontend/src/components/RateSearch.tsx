// src/components/SearchRates.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const tabs = ["CARRIER", "CONTRACT NUMBER", "NAMED ACCOUNT RATES", "CONTAINER"];

export default function SearchRates() {
  const [activeTab, setActiveTab] = useState("CARRIER");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("2023-02-21");
  const [rateType, setRateType] = useState("FCL Buy Rates");

  const navigate = useNavigate();

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
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          <input
            type="text"
            placeholder="Search Any Origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Search Any Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
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