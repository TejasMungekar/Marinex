const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

const PORT = 3001;

// Load JSON
const raw = fs.readFileSync('./ports.json', 'utf8');
const items = JSON.parse(raw);

const normalizeValue = (value) => String(value ?? '').trim();

const isHeaderRow = (row) => !!Object.values(row || {}).find((value) => {
  const text = normalizeValue(value).toLowerCase();
  return [
    'locode',
    'country code',
    'country name',
    'port code',
    'port name',
    'list of country codes and locode',
  ].includes(text);
});

// Search across all real row values instead of a single guessed column.
// This works with the CSV-derived data, where the actual location names are
// spread across fields like Unnamed: 2 / Unnamed: 4 and similar keys.
const getMatchedValues = (query) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matches = [];

  for (const item of items) {
    if (!item || isHeaderRow(item)) continue;

    for (const value of Object.values(item)) {
      const text = normalizeValue(value);
      if (!text) continue;

      const low = text.toLowerCase();
      if (low.startsWith(q) || low.includes(q)) {
        matches.push(text);
      }
    }
  }

  return [...new Set(matches)];
};

// AUTOCOMPLETE API
app.get('/api/suggest', (req, res) => {
  const q = normalizeValue(req.query.q);
  const limit = Math.max(1, parseInt(req.query.limit || '10', 10) || 10);

  const suggestions = getMatchedValues(q).slice(0, limit);
  res.json(suggestions);
});

app.listen(PORT, () => console.log(`API running → http://localhost:${PORT}`));
