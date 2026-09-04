# 🔥 ThermalWatch AI — Dual-Mode Live Satellite Radar & Universal Date Playback Design

## 1. Executive Summary & Objective
ThermalWatch AI is an AI-driven geospatial thermal intelligence platform designed to segregate industrial operational heat sources, accidental explosions, agricultural stubble burning, and forest wildfires across India. 

For the internal physical showcase, the platform implements a **Dual-Mode System**:
1. **Historical Calibrated Archive Mode:** Provides the full 366-day verified seasonal playback across India, demonstrating long-term baseline persistence.
2. **Live Real-Time Satellite Radar Mode:** Ingests live polar (VIIRS/MODIS via NASA FIRMS NRT) and geostationary thermal anomalies, processes them through the trained **Phases 1–8 AI Stack** (XGBoost, 1D-CNN, ResNet-18, and Phase 6 Stacking Meta-Learner), and projects classified hotspots on the map in real time.
3. **Universal Date Scrubber:** Allows selecting and scrubbing the 24-hour diurnal combustion cycle for **any date from Jan 1, 2026 to today**.
4. **Visual Ground-Truth Specification:** 100% strictly aligned with the approved Google Flow design specification: [`docs/stitch/flow_design_reference.png`](file:///Users/aadeshkhande/Documents/Professional/College/assignment_SAD/docs/stitch/flow_design_reference.png).

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

## 4. UI/UX Specifications (1:1 Google Flow Ground-Truth Match)

Refer to: [`docs/stitch/flow_design_reference.png`](file:///Users/aadeshkhande/Documents/Professional/College/assignment_SAD/docs/stitch/flow_design_reference.png)

### Design System Tokens (Strict Zero-Chrome)
- **Philosophy:** Minimalist, utilitarian military cockpit. No glass blur, no gradients, **NO pulse animations**.
- **Surface Token:** Solid `#18181b` (Panels, Docks, Toasts, Drawer). Border: `1px solid rgba(255, 255, 255, 0.08)`.
- **Text:** Primary `#fafafa`, Secondary `#71717a`, Accent `#f59e0b` (Amber), Critical `#ef4444` (Crimson).
- **Typography:** `Space Grotesk` (Labels, Controls, Headers), `Geist Mono` (Numerical Telemetry, Timestamps, Bar Chart).

### Component 1: Top Utility Cluster & Notification Toast
1. **Top-Left Utility Buttons:**
   - 3 icon buttons: Menu (`Menu`), Calendar (`Calendar`), Alerts (`Bell`).
   - Style: Square 36×36px, radius 8px, solid `#18181b`, border `1px solid rgba(255,255,255,0.08)`.
2. **Top-Center Ephemeral Notification Toast:**
   - Position: `fixed, top: 20px, left: 50%, transform: translateX(-50%)`.
   - Style: Capsule shape, solid `#18181b`, border `1px solid rgba(255, 255, 255, 0.12)`, radius 9999px, padding `6px 18px`.
   - Content: `"NASA VIIRS / INSAT-3DR PASS INGESTED · 18 HOTSPOTS CLASSIFIED"` in amber (`#f59e0b`).
   - Behavior: Disappears after 4.5s; leaves map canvas clean.

### Component 2: Left Tactical Dock (48px Width)
- Position: `fixed, left: 16px, top: 50%, transform: translateY(-50%)`.
- Width: `48px`, radius 24px, solid `#18181b`, border `1px solid rgba(255,255,255,0.06)`.
- Buttons (from top to bottom):
  1. Target / Reticle (`Crosshair`)
  2. Telemetry Beam (`Radio`)
  3. **Live Radar Mode Switcher:** Highlighted circular amber capsule (`#f59e0b` fill, dark icon `#0d0d0d`) when live mode is active.
  4. Layer Grid (`Layers`)
  5. Trend Graph (`Activity`)
  6. Settings Cog (`Settings`)

### Component 3: Universal Diurnal Scrubber (880px Width × 64px Height)
- Position: `fixed, bottom: 16px, left: 50%, transform: translateX(-50%)`.
- Dimensions: `width: 880px; height: 64px; border-radius: 16px; background: #18181b; border: 1px solid rgba(255,255,255,0.08)`.
- Internal Layout:
  - **Left Controls:** Circular Play/Pause button (amber `#f59e0b`), Previous Step (`SkipBack`), Next Step (`SkipForward`).
  - **Center Histogram:** 24 diurnal combustion bars (00:00 to 23:00) with vertical playhead needle and pip. Active peak hours rendered in amber; baseline hours in muted gray. Axis tick labels: `0h`, `24h`.
  - **Right Telemetry:** Multi-timezone timestamps (`UTC` and `IST`) in `Geist Mono`.

### Component 4: Right Inspector Drawer (380px Width)
- Position: `fixed, right: 0, top: 0, bottom: 0, width: 380px, background: #18181b, border-left: 1px solid rgba(255,255,255,0.08)`.
- Header: Title and close (`X`) button.
- **Section 1: AI Multi-Modal Stacking Verdicts:**
  - Highlighted status badge: `⚠️ Multi-Modal Stacking` (amber accent).
  - Metric breakdown list with colored indicators.
- **Section 2: Model Probability Breakdowns:**
  - Model 1 (XGBoost Tabular): Progress bar percentage.
  - Model 2 (Diurnal Curve): Progress bar percentage (amber).
  - Model 3 (ResNet-18 Vision): Progress bar percentage.
- **Section 3: Probability Distribution Bar Chart:**
  - Class probability distribution histogram (Classes 0–4), with predicted class highlighted in bright amber.
- **Section 4: Environmental Plume Dispersion:**
  - Live wind-driven toxic smoke dispersion cone graph (distance km vs plume width), color zoned (red, orange, yellow).
