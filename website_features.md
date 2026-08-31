# 🔥 ThermalWatch AI — System Architecture & Website Features
### For Demo Video Planning | SIH 2026

---

## 🌐 What the System Does (In One Paragraph)

ThermalWatch AI is a satellite-based industrial fire intelligence platform.
It operates a dual-feed satellite ingestion pipeline: INSAT-3DR (ISRO, every 15 min)
and Himawari-9 (JAXA, every 10 min) provide near-real-time geostationary fire
detections, while NASA FIRMS (VIIRS/MODIS) provides deep-calibrated polar-orbit
confirmation every 3-6 hours. This infrastructure layer continuously feeds the
trained AI ensemble (XGBoost + 1D-CNN + ResNet-18) with live data so the model
operates in real-time — not just on the historical 1.37M training dataset.
Every detection is classified into one of 5 categories and then the platform
tells you WHO is at risk, WHERE the nearest emergency services are, WHERE
the toxic smoke is heading, and triggers automated alerts to NDMA.

---

## 🏗️ SECTION 1: CORE INFRASTRUCTURE (Building Blocks, NOT Features)

> These are NOT user-facing features. These are the critical technical
> foundations that make the system real-time and continuously learning.
> The trained model is only as useful as the live data being fed into it.
> Without this layer, ThermalWatch AI is a historical map, not a live system.

---

### INFRA BLOCK A: Geostationary Live Feed (Primary Detection Engine)

What it is:
  The real-time heartbeat of the system. Two geostationary satellites
  scan India continuously. Their thermal data feeds the AI model every
  10-15 minutes, making real-time classification possible.

Why it is NOT a feature:
  It runs invisibly in the background. Users never directly interact with
  "the Himawari feed" or "the INSAT API". They only see the resulting
  fire markers appear on the map in near-real-time. This is the engine
  under the hood, not the dashboard.

Data Sources & APIs:
  PRIMARY — INSAT-3DR (ISRO, Indian geostationary):
    - Indian satellite (ISRO + IMD) — strongest case for SIH judges!
    - 15-minute refresh over India
    - Fire product: 3DIMG_L2P_FIR (active fire product)
    - API: MOSDAC Data Download API (free, register at mosdac.gov.in)
    - RAPID portal for real-time web access also available

  SECONDARY — Himawari-9 (JAXA, Japanese geostationary):
    - Covers all of South and Southeast Asia including India
    - 10-minute full disk scan
    - Wildfire product: WLF (Wildfire Layer)
    - API: JAXA P-Tree FTP at ftp://ftp.ptree.jaxa.jp/pub/himawari/L2/WLF
    - Free registration at eorc.jaxa.jp/ptree
    - Commercial use permitted as of Feb 2026

Feed Flow:
  INSAT-3DR/Himawari-9 scan completes (every 10-15 min)
    -> Thermal anomaly pixel detected in MIR band (3.9µm)
    -> Coordinates extracted + brightness temperature captured
    -> India boundary filter applied
    -> Passed immediately to AI inference pipeline
    -> XGBoost tabular classifier runs (fast, ~50ms per detection)
    -> Preliminary class assigned + confidence score
    -> If confidence > 85% AND Class 4: EMERGENCY ALERT fires immediately
    -> Detection stored in database with status: UNCONFIRMED
    -> 3-6 hours later: FIRMS polar pass arrives (INFRA BLOCK B)
    -> KD-Tree spatial match cross-validates geostationary detection
    -> If matched: status upgrades to CONFIRMED + FRP baseline updated
    -> If no match: status flagged as UNCONFIRMED (possible false positive)

Key Pitch:
  "Every other system waits 3-6 hours for a NASA satellite pass.
   ThermalWatch AI detects industrial fires in under 15 minutes
   using INSAT-3DR — India's own ISRO geostationary satellite."

---

### INFRA BLOCK B: Polar-Orbit Confirmation Feed (Precision Calibration Engine)

What it is:
  NASA FIRMS NRT (Near Real-Time) API provides highly calibrated
  FRP measurements from VIIRS and MODIS polar-orbiting satellites.
  Used to confirm or reject geostationary detections and to update
  the rolling 30-day FRP baseline used for Z-Score anomaly detection.

Why it is NOT a feature:
  It runs on a background scheduler every 3-6 hours. Users never
  trigger it. It silently upgrades detection badges from ⚡ to ✅
  and recalculates confidence. The model gets more accurate over time
  because of this pipeline, not because users do anything.

Data Source:
  NASA FIRMS NRT API (VIIRS SNPP + VIIRS NOAA-20 + MODIS Terra/Aqua)
  Endpoint: https://firms.modaps.eosdis.nasa.gov/api/area/
  Free API key available at: firms.modaps.eosdis.nasa.gov/api/

Feed Flow:
  NASA FIRMS NRT API polled (every 3 hours via cron job)
    -> New VIIRS/MODIS detections downloaded for India bounding box
    -> For each new FIRMS detection:
       -> KD-Tree spatial search finds closest INSAT/Himawari detection
       -> If within 1km: MATCH FOUND
          -> Geostationary detection upgraded: UNCONFIRMED -> CONFIRMED
          -> FRP value updated with precise FIRMS measurement
          -> Full ensemble classification re-runs with confirmed FRP
          -> 30-day FRP rolling baseline updated for facility cluster
       -> If no match within 1km: NEW detection added directly

---

### INFRA BLOCK C: AI Inference Pipeline (Classification Engine)

What it is:
  The trained 3-model ensemble that runs on every incoming detection
  from both feeds. This is what makes ThermalWatch AI intelligent
  rather than just a raw satellite heatmap.

Why it is NOT a feature:
  Users see the classified output (colored dots, confidence scores).
  They never interact with the inference pipeline directly.

Pipeline Flow:
  New hotspot received (from INSAT/Himawari or FIRMS)
    -> Feature extraction:
       elevation (SRTM lookup) + land cover code (ESA WorldCover)
       + tropomi_no2 + tropomi_so2 (nearest annual mean)
       + is_industrial + is_wildfire + is_gas_flare (OSM spatial join)
    -> MODEL 1 (XGBoost tabular): fast 50ms inference
       -> probability vector P_tab = [p0, p1, p2, p3, p4]
    -> MODEL 2 (Himawari-9 1D-CNN): checks 24h diurnal heat curve
       -> probability vector P_temp = [p0, p1, p2, p3, p4]
    -> MODEL 3 (ResNet-18): checks 224x224 satellite image chip
       -> probability vector P_img = [p0, p1, p2, p3, p4]
    -> STACKING MLP meta-learner:
       -> Input: 15 features [P_tab, P_temp, P_img]
       -> Output: Final class (0-4) + confidence score
    -> Result stored in database + pushed to frontend via WebSocket

---

## 📋 SECTION 2: WEBSITE FEATURES (User-Facing, 22 Total)

Legend: 🟢 Low Effort | 🟡 Medium Effort
        ⭐⭐⭐⭐⭐ = Demo Impact | ✅ = Free API

---

### TIER 1 — BUILD FIRST

**Feature 1: 5-Class Color-Coded Fire Map**
🟢 Low | ⭐⭐⭐⭐⭐ | ✅ Free (MapLibre)

What it does:
  Renders all fire detections across India as color-coded dots
  on a dark satellite basemap.

Flow:
  Page loads
    -> 50k pre-sampled fires.geojson loaded into map
    -> Color applied per class
    -> Heatmap at zoom < 7 | individual dots at zoom >= 7
    -> User clicks dot -> right panel slides in with details

---

**Feature 2: Population Exposure Risk Radius**
🟢 Low | ⭐⭐⭐⭐⭐ | ✅ Free (WorldPop REST API)

What it does:
  Draws concentric evacuation rings and estimates how many
  people live inside each ring for any industrial fire.

Flow:
  Industrial fire selected
    -> Three concentric circles drawn (500m / 2km / 5km)
    -> WorldPop API queried for population in each ring
    -> Result: "⚠️ 42,000 residents within 3km radius"
    -> Rings color-coded: red / orange / yellow

API: https://wopr.worldpop.org/api/v1/PointData — FREE

---

**Feature 3: Nearest Emergency Services Finder**
🟢 Low | ⭐⭐⭐⭐⭐ | ✅ Free (OSM Overpass + OSRM)

What it does:
  Fetches nearest fire stations and hospitals with live ETA
  when Class 4 event fires.

Flow:
  Class 4 alert triggered
    -> OSM Overpass API queried: fire stations + hospitals within 25km
    -> OSRM routing calculates drive time from each to incident
    -> Results ranked by ETA and drawn on map as routes
    -> "🚒 Surat Fire Station — 4.2km — ETA 8 min [DISPATCH]"
    -> [DISPATCH] sends mock Telegram webhook

APIs:
  Overpass: https://overpass-api.de/api/interpreter — FREE
  OSRM: https://router.project-osrm.org — FREE

---

**Feature 4: Live Wind Plume Dispersion Cone**
🟡 Medium | ⭐⭐⭐⭐⭐ | ✅ Free (Open-Meteo)

What it does:
  Fetches real-time wind and draws the toxic smoke cone
  showing which direction and how far the plume travels.

Flow:
  Industrial/gas flare detected
    -> Open-Meteo API fetched for wind speed + direction
    -> Turf.js calculates cone geometry in wind direction
    -> Cone drawn: 0-5km red | 5-15km orange | 15-30km yellow
    -> Hospitals/schools inside cone flagged with warning icons
    -> "💨 Wind: 18 km/h NE → towards Surat city"

API: https://api.open-meteo.com/v1/forecast — FREE, no key needed

---

**Feature 5: Temporal Playback Timeline (Jan → Dec 2024)**
🟢 Low | ⭐⭐⭐⭐⭐ | ✅ Free (pre-computed data)

What it does:
  Scrubber bar plays back the full year of fire detections
  month by month — seasonal patterns emerge visually.

Flow:
  User presses ▶ play
    -> Month counter ticks: Jan -> Feb -> ... -> Dec
    -> Map filters detections to show only that month
    -> Agricultural burning cluster explodes in Punjab Oct-Nov
    -> Industrial clusters stay constantly lit all year
    -> Speed controls: 1x / 2x / 4x

Value: Proves "persistent thermal source" concept from PS in 30 seconds

---

**Feature 6: SHAP AI Explanation Panel**
🟡 Medium | ⭐⭐⭐⭐ | ✅ Free (pre-computed SHAP values)

What it does:
  Shows exactly WHY the AI classified each detection —
  readable by non-technical judges.

Flow:
  User clicks fire marker
    -> Pre-computed SHAP values loaded from JSON
    -> Waterfall bar chart animates in right panel:
       "Classified as INDUSTRIAL because:
        is_industrial: +29%
        tropomi_no2 elevated: +18%
        FRP spike pattern: +12%"
    -> Human summary: "This area contains a registered refinery
       with elevated NO2 and abnormal heat output."

---

**Feature 7: Satellite Pass Countdown Timer**
🟢 Low | ⭐⭐⭐ | ✅ Free (static orbital schedule)

What it does:
  Live countdown to next satellite pass over India —
  shows the system is genuinely live.

Flow:
  Dashboard loads
    -> "🛰️ VIIRS SNPP — Next pass: 02:14 UTC (1h 32m)"
    -> "🛰️ VIIRS NOAA-20 — Next pass: 04:47 UTC (3h 45m)"
    -> "🛰️ Himawari-9 — ● LIVE (10-min refresh)"
    -> Countdowns tick in real time

---

**Feature 8: Industrial Facility Compliance Report**
🟢 Low | ⭐⭐⭐⭐ | ✅ Free (existing dataset)

What it does:
  Year-long compliance report for any industrial cluster —
  shows repeat offenders and regulatory violations.

Flow:
  User clicks persistent industrial cluster
    -> Report panel expands:
       "🏭 TATA Steel, Jamshedpur
        Annual Detections: 312 events
        Night Flaring (10PM-5AM): 47 events ⚠️ VIOLATION
        Class 4 Incidents: 3 events
        Compliance Status: ⚠️ AMBER"
    -> Monthly bar chart shows trend
    -> [EXPORT CPCB REPORT] downloads PDF

---

**Feature 9: Cinematic Camera Auto-Tour**
🟡 Medium | ⭐⭐⭐⭐⭐ | ✅ Free (Mapbox flyTo)

What it does:
  "Present Mode" automatically flies camera to the 5 most
  significant fire clusters in India — perfect for demo video.

Flow:
  [▶ AUTO TOUR] clicked
    -> Full India view (zoom 4)
    -> Flies to Punjab crop burning cluster
       "Agricultural Burning Season — 1M+ detections"
    -> Flies to Jamnagar refinery
       "Reliance Jamnagar — Largest Gas Flare Complex"
    -> Flies to Jharkhand steel belt
       "TATA Steel Corridor — 312 persistent events"
    -> Flies to Class 4 incident
       "🚨 EMERGENCY — Hazira Petrochemical Fire"
    -> Returns to India overview with stats

---

**Feature 10: Before / After Satellite Image Split Panel**
🟡 Medium | ⭐⭐⭐⭐ | ✅ Free (NASA Worldview / Mapbox)

What it does:
  Draggable slider compares satellite imagery of a fire
  location the day before vs. day after the incident.

Flow:
  Class 4 incident selected
    -> Panel splits: LEFT = D-1 imagery | RIGHT = D+1 imagery
    -> Draggable center divider slides left/right
    -> Visual: normal refinery glow vs. massive thermal bloom
    -> Labels: "BEFORE: 2024-01-01" | "AFTER: 2024-01-02"

---

**Feature 11: NDMA Alert Chain Simulation**
🟡 Medium | ⭐⭐⭐⭐⭐ | ✅ Free

What it does:
  Visualizes the full government alert chain from satellite
  detection to local fire station dispatch.

Flow:
  Class 4 detected
    -> Alert chain animates step by step:
       🛰️ Satellite Detection — 14:32 UTC
         ↓ AI Classification: INDUSTRIAL ACCIDENTAL 94.2%
         ↓ NDMA National Ops Center NOTIFIED ✓ 14:33
         ↓ Gujarat SDMA NOTIFIED ✓ 14:34
         ↓ Surat District Collector NOTIFIED ✓ 14:35
         ↓ Fire Station Dispatched ✓ 14:36
       Total Response Time: 4 minutes

---

**Feature 12: TROPOMI NO2/SO2 Atmospheric Overlay**
🟢 Low | ⭐⭐⭐⭐ | ✅ Free (from master dataset)

What it does:
  Toggleable heatmap showing ambient NO2 and SO2 levels
  across India — visually connects gas pollution to factories.

Flow:
  User toggles "Air Quality Layer"
    -> TROPOMI NO2 heatmap appears
    -> Industrial clusters glow red/orange (high NO2)
    -> Agricultural zones show moderate NO2
    -> Forest areas show near-zero (green)
    -> Toggle: NO2 view <-> SO2 view
    -> Correlation with fire classes immediately visible

---

**Feature 13: Fire Recurrence Heatmap**
🟢 Low | ⭐⭐⭐⭐ | ✅ Free (pre-computed)

What it does:
  Shows how many times the same coordinate fired in 2024 —
  visual proof of "persistent thermal source" from the PS.

Flow:
  User toggles "Recurrence Mode"
    -> Map switches from latest to frequency heatmap
    -> Industrial zones: bright white (365-day fires)
    -> Agricultural: seasonal orange blobs (Oct-Nov only)
    -> Forest: sparse random dots
    -> Label: "White = detected 200+ days this year"

---

**Feature 14: Closest Industrial Facility Name (OSM)**
🟢 Low | ⭐⭐⭐⭐ | ✅ Free (OSM Overpass)

What it does:
  Identifies and labels the nearest registered factory
  for any detection — gives fire a real-world identity.

Flow:
  User clicks fire detection
    -> OSM Overpass queried for industrial landuse within 2km
    -> Nearest facility name, type, and distance retrieved
    -> "Nearest: Reliance Jamnagar Refinery | Type: Oil Refinery | 320m"
    -> Facility polygon highlighted on map

---

**Feature 15: Live Class Distribution Counter**
🟢 Low | ⭐⭐⭐ | ✅ Free (pre-computed)

What it does:
  Animated counters for all 5 fire classes that update
  as the timeline scrubber moves.

Flow:
  Dashboard loads
    -> Counters animate from 0 to final values:
       🌲 Wildfire: 170,987
       🌾 Agricultural: 1,072,341
       🏭 Industrial: 125,965
       🔵 Gas Flare: 5,076
       🚨 Accidental: 1,666
    -> Move timeline to Oct-Nov: Agricultural counter spikes
    -> Industrial counter stays flat all year (persistent proven!)

---

**Feature 16: 3D Terrain FRP Extrusion View**
🟡 Medium | ⭐⭐⭐⭐ | ✅ Free (Mapbox terrain)

What it does:
  Switches map to 3D mode where fire markers become pillars
  — bar height = FRP intensity. A 200MW factory fire towers
  over a 5MW crop fire visually.

Flow:
  User toggles "3D View"
    -> Map switches to 3D terrain (Mapbox terrain-dem)
    -> Fire markers become 3D cylinders
    -> Height proportional to FRP value
    -> Color remains class-coded
    -> Camera pitches 60° for dramatic effect
    -> Industrial clusters: towering pillars
    -> Agricultural burning: short flat dense carpet

---

**Feature 17: FRP Trend Chart for Selected Facility**
🟢 Low | ⭐⭐⭐ | ✅ Free (pre-computed from dataset)

What it does:
  Line chart of a facility's FRP over the full year with
  the Class 4 anomaly spike clearly marked.

Flow:
  Industrial cluster clicked
    -> Bottom panel expands with line chart
    -> X-axis: Jan -> Dec 2024
    -> Gray band: 30-day rolling baseline ± 1σ
    -> Green line: actual FRP readings
    -> Red dot spike: Class 4 event visible above baseline
    -> Dashed red line: Z = 3.0 threshold
    -> Label: "⚠️ ANOMALY — Z-Score: 5.3"

---

**Feature 18: Downloadable PDF Incident Report**
🟡 Medium | ⭐⭐⭐⭐ | ✅ Free (jsPDF)

What it does:
  One-click PDF generation of a formatted incident report
  ready to send to NDMA, CPCB, or fire services.

Flow:
  Class 4 alert panel open
    -> [📄 GENERATE INCIDENT REPORT] clicked
    -> jsPDF generates PDF containing:
       GPS coordinates, AI classification + confidence,
       FRP value + Z-Score, population at risk count,
       emergency services ETAs, wind/plume data,
       SHAP explanation summary
    -> PDF auto-downloads

---

**Feature 19: Agricultural Burning Season Banner**
🟢 Low | ⭐⭐⭐ | ✅ Free (date logic)

What it does:
  During Oct-Nov (peak crop burning), an automated advisory
  banner appears with AQI impact warning.

Flow:
  Timeline moved to October
    -> Top banner slides down:
       "⚠️ PEAK STUBBLE BURNING SEASON ACTIVE
        Punjab / Haryana / UP — 847,000 detections expected
        AQI Delhi projected to cross 400"
    -> Punjab/Haryana highlighted with amber overlay

---

**Feature 20: Multi-Layer Toggle Panel**
🟢 Low | ⭐⭐⭐⭐ | ✅ Free

What it does:
  Collapsible left panel with switches for every data layer —
  makes the system feel comprehensive and interactive.

Flow:
  User opens Layer Panel
    -> Toggles:
       ☑ NASA FIRMS Fire Detections
       ☑ Industrial Facilities (OSM)
       ☑ Heatmap Density
       ☑ TROPOMI NO2
       ☑ TROPOMI SO2
       ☑ Plume Dispersion Cones
       ☑ Population Risk Rings
       ☑ Emergency Services
       ☑ State/District Boundaries
    -> Basemap: Dark | Satellite | Terrain | Streets

---

**Feature 21: "Why Not Agricultural?" Disambiguation Panel**
🟢 Low | ⭐⭐⭐⭐ | ✅ Free (pre-computed SHAP)

What it does:
  For borderline detections, shows exactly what features
  distinguished industrial from agricultural burning.

Flow:
  Industrial detection selected near cropland
    -> Panel shows:
       "WHY NOT AGRICULTURAL BURNING?
        ✗ Time: 02:30 AM (crop fires burn 10AM-6PM only)
        ✗ Land Cover: Industrial zone (not Cropland)
        ✗ Duration: 48h continuous (crop fires last 4-6h)
        ✓ TROPOMI NO2: Elevated (refinery signature)
        RESULT: INDUSTRIAL PERSISTENT — 96.8%"

---

**Feature 22: Live System Status Header**
🟢 Low | ⭐⭐⭐ | ✅ Free

What it does:
  Header shows live operational status so judges immediately
  know the system is active and monitoring.

Flow:
  Dashboard loads
    -> Header displays:
       "🔥 THERMALWATCH AI  ● SYSTEM OPERATIONAL"
       "🛰️ FIRMS NRT Active | 🧠 Model v1.3 | 📡 Last sync: 2 min ago"
       "India Coverage: 100% | Detections Today: 3,241 | Alerts: 2"

---

---

**Feature 23: Geostationary NRT Bridge — INSAT-3DR + Himawari-9 (10-15 Min Detection)**
🟡 Medium | ⭐⭐⭐⭐⭐ | ✅ Free (MOSDAC registration + JAXA P-Tree registration)

Why this matters:
  NASA FIRMS polar-orbiting satellites (VIIRS, MODIS) pass over any
  point in India only once every 3-6 hours. For an industrial explosion
  or gas leak, a 6-hour detection delay is catastrophic.
  Geostationary satellites are FIXED over the same region permanently
  and scan continuously every 10-15 minutes — reducing the detection
  window from hours to minutes.

Data Sources:
  PRIMARY — INSAT-3DR (ISRO, Indian geostationary):
    - Operated by ISRO + IMD — a fully Indian satellite (great for SIH!)
    - 15-minute refresh over India
    - Fire product: 3DIMG_L2P_FIR (active fire product)
    - API: MOSDAC Data Download API (free registration at mosdac.gov.in)
    - RAPID tool for real-time web-based access also available

  SECONDARY — Himawari-9 (JAXA, Japanese geostationary):
    - Covers all of South/Southeast Asia including India
    - 10-minute full disk scan
    - Wildfire product: WLF (Wildfire Layer)
    - API: JAXA P-Tree FTP (ftp://ftp.ptree.jaxa.jp/pub/himawari/L2/WLF)
    - Free registration at eorc.jaxa.jp/ptree
    - As of Feb 2026: commercial use is now permitted!

What it does:
  Provides the first-alert detection layer for any fire in India —
  displayed on map within 10-15 minutes of thermal anomaly appearing,
  with a visual "Unconfirmed (Geostationary)" badge until FIRMS
  polar-orbit data arrives to confirm it.

Flow:
  INSAT-3DR/Himawari-9 scan completes (every 10-15 min)
    -> Thermal anomaly pixel detected in MIR band (3.9µm)
    -> Coordinates extracted and passed to AI pre-classifier
    -> Preliminary class assigned (tabular model only, fast inference)
    -> New pulsing marker appears on map immediately:
       "⚡ NEW DETECTION — Geostationary (INSAT-3DR)
        Coords: 21.11°N, 72.64°E | BT: 341K | Status: UNCONFIRMED"
    -> If preliminary class = 4 (accidental): EMERGENCY ALERT fires NOW
       (not waiting 3-6 hours for FIRMS confirmation)
    -> 3-6 hours later: FIRMS polar data arrives
    -> KD-Tree spatial match finds corresponding geostationary detection
    -> If matched: marker upgrades to "✅ CONFIRMED (FIRMS)"
       FRP value updated | Full ensemble classification runs
    -> If not matched: marker flagged "⚠️ Unconfirmed — no polar match"

Map UI:
  Two badge types visible:
    ⚡ Yellow pulsing = Geostationary-only (10-15 min fresh, unconfirmed)
    ✅ Solid color   = FIRMS-confirmed (3-6 hours old, high precision)
  Filter toggle: "Show unconfirmed detections" ON/OFF

Key Pitch to Judges:
  "While every other system waits 3-6 hours for a NASA satellite pass,
   ThermalWatch AI detects industrial fires in under 15 minutes using
   INSAT-3DR — India's own ISRO geostationary satellite."

---

## 📊 Priority Matrix

| # | Feature                        | Effort  | Impact   | Free |
|---|--------------------------------|---------|----------|------|
|23 | Geostationary NRT Bridge       | 🟡 Med  | ⭐⭐⭐⭐⭐ | ✅   |
| 1 | 5-Class Color Fire Map         | 🟢 Low  | ⭐⭐⭐⭐⭐ | ✅   |
| 2 | Population Exposure Radius     | 🟢 Low  | ⭐⭐⭐⭐⭐ | ✅   |
| 3 | Nearest Emergency Services     | 🟢 Low  | ⭐⭐⭐⭐⭐ | ✅   |
| 4 | Wind Plume Dispersion Cone     | 🟡 Med  | ⭐⭐⭐⭐⭐ | ✅   |
| 5 | Temporal Playback Timeline     | 🟢 Low  | ⭐⭐⭐⭐⭐ | ✅   |
| 6 | SHAP AI Explanation Panel      | 🟡 Med  | ⭐⭐⭐⭐  | ✅   |
| 7 | Satellite Pass Countdown       | 🟢 Low  | ⭐⭐⭐   | ✅   |
| 8 | Compliance Report Generator    | 🟢 Low  | ⭐⭐⭐⭐  | ✅   |
| 9 | Cinematic Auto-Tour Camera     | 🟡 Med  | ⭐⭐⭐⭐⭐ | ✅   |
|10 | Before/After Satellite Split   | 🟡 Med  | ⭐⭐⭐⭐  | ✅   |
|11 | NDMA Alert Chain Simulation    | 🟡 Med  | ⭐⭐⭐⭐⭐ | ✅   |
|12 | TROPOMI NO2/SO2 Overlay        | 🟢 Low  | ⭐⭐⭐⭐  | ✅   |
|13 | Fire Recurrence Heatmap        | 🟢 Low  | ⭐⭐⭐⭐  | ✅   |
|14 | Closest Facility Name (OSM)    | 🟢 Low  | ⭐⭐⭐⭐  | ✅   |
|15 | Class Distribution Counter     | 🟢 Low  | ⭐⭐⭐   | ✅   |
|16 | 3D Terrain FRP Extrusion       | 🟡 Med  | ⭐⭐⭐⭐  | ✅   |
|17 | FRP Trend Chart                | 🟢 Low  | ⭐⭐⭐   | ✅   |
|18 | PDF Incident Report            | 🟡 Med  | ⭐⭐⭐⭐  | ✅   |
|19 | Seasonal Burning Banner        | 🟢 Low  | ⭐⭐⭐   | ✅   |
|20 | Multi-Layer Toggle Panel       | 🟢 Low  | ⭐⭐⭐⭐  | ✅   |
|21 | Why Not Agricultural Panel     | 🟢 Low  | ⭐⭐⭐⭐  | ✅   |
|22 | Live System Status Header      | 🟢 Low  | ⭐⭐⭐   | ✅   |

---

## 🎬 Demo Video Feature Order (2 min 30 sec)

0:00 - Feature 22 (Live status header — "SYSTEM OPERATIONAL, INSAT-3DR ● LIVE")
0:08 - Feature 23 (Geostationary live feed — new ⚡ yellow marker pulses onto India map)
        Voiceover: "While other systems wait 6 hours for a NASA pass...
                    ThermalWatch detects fires in 15 minutes via ISRO's INSAT-3DR."
0:20 - Feature 9  (Cinematic auto-tour opens — full India view with 5-class colors)
0:30 - Feature 1  (Fire map zooms into India — class-coded dots across the country)
0:40 - Feature 5  (Timeline plays Jan→Dec — crop burning explodes in Punjab Oct-Nov)
0:55 - Feature 13 (Recurrence heatmap — industrial = constant white glow all year)
1:05 - Feature 4  (Wind plume cone appears on industrial cluster)
1:15 - Feature 23 (⚡ Unconfirmed INSAT detection upgrades to ✅ Confirmed as FIRMS arrives)
1:20 - Feature 11 (NDMA alert chain animates for Class 4 event)
1:30 - Feature 3  (Emergency services routes appear on map)
1:40 - Feature 2  (Population exposure rings — 42,000 at risk)
1:50 - Feature 10 (Before/After satellite image split panel)
2:05 - Feature 6  (SHAP explanation panel animates in)
2:15 - Feature 8  (Compliance report shown for repeat offender facility)
2:30 - Feature 15 (India stats counter + title card close)
