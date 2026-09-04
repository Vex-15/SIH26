# 🔥 ThermalWatch AI — Dual-Mode Live Satellite Radar & Universal Date Playback Design

## 1. Executive Summary & Objective
ThermalWatch AI is an AI-driven geospatial thermal intelligence platform designed to segregate industrial operational heat sources, accidental explosions, agricultural stubble burning, and forest wildfires across India. 

For the internal physical showcase, the platform implements a **Dual-Mode System**:
1. **Historical Calibrated Archive Mode:** Provides the full 366-day verified seasonal playback across India, demonstrating long-term baseline persistence.
2. **Live Real-Time Satellite Radar Mode:** Ingests live polar (VIIRS/MODIS via NASA FIRMS NRT) and geostationary thermal anomalies, processes them through the trained **Phases 1–8 AI Stack** (XGBoost, 1D-CNN, ResNet-18, and Phase 6 Stacking Meta-Learner), and projects classified hotspots on the map in real time.
3. **Universal Date Scrubber:** Allows selecting and scrubbing the 24-hour diurnal combustion cycle for **any date from Jan 1, 2026 to today**.

---

## 2. Strict Safety & Domain Isolation Protocol
> [!CAUTION]
> **ABSOLUTE PROHIBITION ON PRODUCTION DEPLOYMENT**
> Under NO circumstances will any code, bundle, or asset be deployed to `sih26ekaant.web.app`.
> - **Production Domain (`sih26ekaant.web.app`):** Sacred, locked, and untouched.
> - **Local Development:** `http://localhost:5173` via `npm run dev`.
> - **Testing Deployment Domain (only when explicitly authorized):** `thermalwatch-india-3591.web.app` via `npx firebase-tools deploy --only hosting:thermalwatch-india-3591`.

---

## 3. Machine Learning & Ingestion Architecture (Phases 1–8)

### Ingestion Service (`pipeline/live_feed_service.py`)
- **NASA FIRMS NRT Ingest:** Queries VIIRS SNPP, NOAA-20, and MODIS NRT feeds for the India bounding box (`[68.1, 6.7, 97.4, 35.7]`).
- **Resilience Engine:** If API key is omitted or external network drops during showcase, automatically falls back to an authentic, pre-generated live satellite pass snapshot so the presentation never crashes.
- **Full Model Execution (Phases 1–8):**
  1. **Feature Join (Phases 1 & 2):** Joins live `(lat, lon, brightness, frp)` with `elevation` (SRTM), `land_cover_code` (ESA WorldCover), `tropomi_no2` & `tropomi_so2` (Sentinel-5P baseline), and `is_industrial` / `is_gas_flare` (OSM & GGFR).
  2. **Model 1: XGBoost (`models/xgboost_model.pkl`):** Predicts 5-class tabular spatial probabilities $P_{\text{tab}}$.
  3. **Model 2: 1D-CNN (`models/diurnal_1dcnn_best.pth`):** Evaluates diurnal combustion profile.
  4. **Model 3: ResNet-18 (`models/resnet18_image_best.pth`):** Evaluates ESA 10m image chips with injected thermal radiance.
  5. **Phase 6 Stacking Meta-Learner (`models/stacking_meta_model.pkl`):** Fuses the probability vectors into the final calibrated 5-class prediction and confidence score.
  6. **Phase 7 Anomaly Detector:** Computes rolling 30-day baseline Z-Scores ($\frac{\text{FRP} - \mu}{\sigma}$) to flag sudden industrial explosions (Class 4).
  7. **Phase 8 SHAP & Output:** Outputs `frontend/public/data/live_hotspots.json`.

---

## 4. UI/UX Specifications (Minimalist Technical Design Language)

### Design System Tokens (Strict Zero-Chrome)
- **Design Philosophy:** Minimalist, utilitarian military cockpit. No glass blur, no gradients, **NO pulse animations**.
- **Surface Token:** Solid `#18181b` (Panels, Docks, Toasts). Border: `1px solid rgba(255, 255, 255, 0.08)`.
- **Text:** Primary `#fafafa`, Secondary `#71717a`, Accent `#f59e0b` (Amber), Critical `#ef4444` (Crimson).
- **Typography:** `Space Grotesk` (Labels, Controls), `Geist Mono` (Numerical Telemetry, Timestamps).

### 1. Left Tactical Dock Mode Toggle
- Located in the Left Tactical Dock as a dedicated satellite radar dish icon button (`Radio` / `Satellite`).
- **States:**
  - `Inactive (Archive Mode)`: Icon color `#71717a`.
  - `Active (Live Radar Mode)`: Icon color `#f59e0b` with solid `#27272a` active background capsule.

### 2. Ephemeral Notification Toast (Zero Map Clutter)
- Appears floating at the top center (`top: 24px, left: 50%, transform: translateX(-50%)`).
- **Styling:** Solid `#18181b`, `1px solid rgba(255, 255, 255, 0.12)`, radius 9999px, padding `8px 18px`.
- **Content:**
  - Satellite Ingest: `"🛰️ NASA VIIRS / INSAT-3DR Pass Ingested · 18 Hotspots Classified"` in 11px Space Grotesk.
  - Emergency Alert: `"🚨 CRITICAL ANOMALY: Industrial Surge in Hazira (+4.2σ)"` in 11px Space Grotesk with `#ef4444` accent.
- **Behavior:** Slides down `y: -10 -> 0` in 200ms, stays for 4.5 seconds, slides out. Clickable to snap camera directly to the incident. Leaves the map 100% clean.

### 3. Universal Date & Hour Scrubber
- Located bottom-center.
- Allows picking **any date from Jan 1, 2026 to today** via the calendar popover.
- For the selected date, scrubs 00:00 to 24:00 (UTC and IST) across the 24-hour diurnal distribution.
- For today's date, defaults to the latest live satellite overpass time.
