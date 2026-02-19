// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RateSearch from "./components/RateSearch";
import SearchResults from "./components/SearchResults";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<RateSearch />} />
        <Route path="/search-results" element={<SearchResults />} />
      </Routes>
    </Router>
  );
}

export default App;