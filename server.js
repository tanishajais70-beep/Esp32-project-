// ESP32 tracker backend
// POST /api/data     <- the ESP32 sends JSON here (needs X-API-Key header)
// GET  /api/latest   -> newest reading
// GET  /api/history  -> recent readings (?limit=300)
// Dashboard page (index.html) is served at /

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'YOUR_SECRET_KEY'; // must match the ESP32 sketch
const DATA_FILE = path.join(__dirname, 'data.json');
const MAX_READINGS = 2000;

let readings = [];
try {
  const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  if (Array.isArray(saved)) readings = saved.slice(-MAX_READINGS);
} catch (e) { /* first run: no file yet */ }

// Save to disk at most once every 5 seconds
let saveTimer = null;
function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    fs.writeFile(DATA_FILE, JSON.stringify(readings), () => {});
  }, 5000);
}

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

app.use(express.json({ limit: '10kb' }));

app.post('/api/data', (req, res) => {
  if (req.get('x-api-key') !== API_KEY) {
    return res.status(401).json({ ok: false, error: 'Invalid API key' });
  }
  const b = req.body || {};
  const reading = {
    device_id: String(b.device_id || 'unknown').slice(0, 40),
    temperature: num(b.temperature),
    gps_fix: b.gps_fix === true,
    latitude: num(b.latitude),
    longitude: num(b.longitude),
    satellites: num(b.satellites) ?? 0,
    altitude: num(b.altitude),
    speed_kmph: num(b.speed_kmph),
    received_at: Date.now()
  };
  if (reading.latitude === null || reading.longitude === null) reading.gps_fix = false;

  readings.push(reading);
  if (readings.length > MAX_READINGS) readings.shift();
  scheduleSave();

  console.log(
    new Date().toISOString(),
    reading.device_id,
    'temp=' + reading.temperature,
    'fix=' + reading.gps_fix
  );
  res.status(201).json({ ok: true });
});

app.get('/api/latest', (req, res) => {
  res.json({
    server_time: Date.now(),
    reading: readings.length ? readings[readings.length - 1] : null
  });
});

app.get('/api/history', (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 300, 1), MAX_READINGS);
  res.json(readings.slice(-limit));
});

app.get('/health', (req, res) => res.send('ok'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => {
  console.log('Dashboard running on port ' + PORT);
  if (API_KEY === 'YOUR_SECRET_KEY') {
    console.log('Warning: set the API_KEY environment variable to your own secret.');
  }
});
