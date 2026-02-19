const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

const PORT = 3001;

// Load JSON
const raw = fs.readFileSync('./ports.json', 'utf8');
const items = JSON.parse(raw);

// AUTO-DETECT BEST COLUMN FOR SEARCH
const sample = items[0] || {};
const keys = Object.keys(sample);

// Pick the column that has the longest text entries (usually the port name)
let KEY = keys[0];
let bestScore = 0;

for (const k of keys) {
  let score = 0;
  for (let i = 0; i < Math.min(items.length, 50); i++) {
    const val = (items[i][k] || "").toString().trim();
    score += val.length;
  }
  if (score > bestScore) {
    bestScore = score;
    KEY = k;
  }
}

console.log("Detected search column:", KEY);

// AUTOCOMPLETE API
app.get('/api/suggest', (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  if (!q) return res.json([]);

  const limit = parseInt(req.query.limit || "10");
  const prefix = [];
  const substr = [];

  for (const it of items) {
    const val = (it[KEY] || '').toString();
    const low = val.toLowerCase();

    if (low.startsWith(q)) prefix.push(val);
    else if (low.includes(q)) substr.push(val);

    if (prefix.length >= limit) break;
  }

  const combined = [...prefix, ...substr].slice(0, limit);
  const unique = [...new Set(combined)];

  res.json(unique);
});

app.listen(PORT, () => console.log(`API running → http://localhost:${PORT}`));
