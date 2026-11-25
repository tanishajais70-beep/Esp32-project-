# ESP32 Tracker Dashboard (phone-friendly, 3 files)

Files: server.js, index.html, package.json  (all in the same folder, no subfolders)

## Deploy from a phone (free)
1. GitHub (github.com, use "Desktop site" if needed): sign up, tap + > New repository, name it
   esp32-tracker, set Public, create it.
2. In the repo tap "uploading an existing file" (or Add file > Upload files), choose the 3 files,
   then Commit changes.
3. Render (render.com): sign up with GitHub > New + > Web Service > pick esp32-tracker.
   - Runtime: Node
   - Build command: npm install
   - Start command: npm start
   - Instance type: Free
   - Environment variables > Add: API_KEY = (a long secret you invent)
4. Tap Deploy. When it says Live, open the address shown (https://esp32-tracker-xxxx.onrender.com).

## ESP32 sketch
    const char* SERVER_URL = "https://esp32-tracker-xxxx.onrender.com/api/data";
    const char* API_KEY    = "same secret as on Render";

Use https:// (Render redirects http to https, and the ESP does not follow redirects).

## Notes
- Free Render sleeps after ~15 min without traffic; the first request after sleep can fail, later ones work.
- History is kept in memory and may reset when the server restarts.
