# 📘 ThermalWatch AI — Complete System, AI Phases & UI Prompt Evolution Guide
**Smart India Hackathon (SIH) 2026 | Defense & Industrial Security Subsystem**

---

## 🧭 Overview & Document Purpose
This document provides a complete technical guide connecting:
1. **The 8 AI/ML Engine Phases (Phases 1–8)**: The multi-modal deep learning and statistical pipeline trained on **1,376,035 real satellite detections** across India.
2. **The 8 Frontend UI Evolution Prompts (Prompts 1–8)**: The iterative UI/UX architecture designed to achieve 60 FPS real-time rendering, Kepler.gl-grade visual fidelity, and defense-grade situational awareness.

---

# 🧠 PART 1: THE 8 AI/ML ENGINE PHASES

```
                     ┌─────────────────────────────────────────────────────────┐
                     │          SATELLITE INGESTION LAYER (PHASE 1)            │
                     │  • INSAT-3DR (ISRO, 15-min)  • Himawari-9 (JAXA, 10-min)│
                     │  • NASA FIRMS (VIIRS/MODIS Polar Confirmation Pass)     │
                     └────────────────────────────┬────────────────────────────┘
                                                  │
                                                  ▼
                     ┌─────────────────────────────────────────────────────────┐
                     │      MULTI-MODAL FEATURE EXTRACTION (PHASE 2)           │
                     │  • SRTM Elevation (m)       • ESA WorldCover 10m Land   │
                     │  • Sentinel-5P TROPOMI NO₂  • Sentinel-5P TROPOMI SO₂   │
                     │  • OSM Industrial Polygons  • FRP Radiative Power (MW)  │
                     └──────┬─────────────────────┼─────────────────────┬──────┘
                            │                     │                     │
               ┌────────────▼─────────┐ ┌─────────▼─────────┐ ┌─────────▼─────────┐
               │   MODEL 1: XGBOOST   │ │ MODEL 2: 1D-CNN   │ │ MODEL 3: RESNET-18│
               │  Spatial Tabular (P3)│ │Temporal Curve (P4)│ │Vision Chips (P5)  │
               │   Acc: 99.74%        │ │  Acc: 86.67%      │ │  Acc: 82.71%      │
               └────────────┬─────────┘ └─────────┬─────────┘ └─────────┬─────────┘
                            │                     │                     │
                            └─────────────────────┼─────────────────────┘
                                                  │
                                                  ▼
                     ┌─────────────────────────────────────────────────────────┐
                     │     PHASE 6: MULTI-MODAL STACKING ENSEMBLE META-LEARNER │
                     │   • Balanced Stacking Logistic Meta-Classifier          │
                     │   • Overall Accuracy: 99.17% | Balanced Acc: 98.62%     │
                     │   • Accidental Factory Explosion Recall: 95.52%         │
                     └────────────────────────────┬────────────────────────────┘
                                                  │
                                                  ▼
                     ┌─────────────────────────────────────────────────────────┐
                     │     PHASE 7: ROLLING 30-DAY Z-SCORE ANOMALY ENGINE      │
                     │   • Scans 128k Industrial Observations for Spikes       │
                     │   • Flags Critical Outliers (Z > 3.0σ) with Emergency ID│
                     └────────────────────────────┬────────────────────────────┘
                                                  │
                                                  ▼
                     ┌─────────────────────────────────────────────────────────┐
                     │     PHASE 8: SHAP EXPLAINABILITY & GEOJSON DISPATCH     │
                     │   • Feature Attribution & Decision Receipts             │
                     │   • Real-Time GeoJSON Feed to Defense Tactical UI       │
                     └─────────────────────────────────────────────────────────┘
```

### Phase 1: Dual-Feed Satellite Ingestion Pipeline
* **Purpose**: Solves the 3–6 hour polar latency bottleneck by combining **INSAT-3DR** (ISRO, 15-min cadence) and **Himawari-9** (JAXA, 10-min cadence) geostationary feeds with NASA FIRMS VIIRS/MODIS confirmation passes.
* **Outputs**: Raw geolocated infrared brightness temperature ($T_{3.9\mu\text{m}}$) and Fire Radiative Power (MW).

### Phase 2: Multi-Modal Feature Extraction & 1.37M Master Dataset
* **Purpose**: Enriches each raw thermal detection with auxiliary spatial and atmospheric dimensions.
* **Features Extracted**:
  * Digital Elevation Model (SRTM altitude in meters)
  * Land Cover classification (ESA WorldCover 10m resolution)
  * Atmospheric trace gases (Sentinel-5P TROPOMI $\text{NO}_2$ and $\text{SO}_2$ columns)
  * OpenStreetMap industrial facility boundaries and gas flare buffers.
* **Scale**: 1,376,035 contiguous records covering all of India across 2024.

### Phase 3: Model 1 — XGBoost Spatial Tabular Classifier
* **Architecture**: Gradient boosted decision trees on spatial & atmospheric tabular features.
* **Performance**: **`99.74%`** Standard Accuracy | **`96.17%`** Balanced Accuracy.
* **Role**: Rapid 50ms preliminary triage on terrain, gas plumes, and cropland boundaries.

### Phase 4: Model 2 — 1D-CNN Diurnal Temporal Classifier
* **Architecture**: 1D Convolutional Neural Network operating on $(Batch, 1, 144)$ time-series vectors.
* **Input**: 144 ten-minute brightness temperature readings over a 24-hour diurnal cycle from Himawari-9.
* **Performance**: **`83.33%`** Balanced Accuracy.
* **Role**: Distinguishes short-lived daytime stubble burning from continuous 24/7 industrial furnace baselines.

### Phase 5: Model 3 — ResNet-18 Land Cover Vision Classifier
* **Architecture**: Deep convolutional network processing $224 \times 224 \times 3$ satellite image chips from 76 ESA WorldCover GeoTIFFs (5.57 GB).
* **Performance**: **`82.71%`** Overall Accuracy | **`95.22%`** Industrial Site Recall.
* **Role**: Physical ground inspection of structures, smokestacks, forest canopies, and agricultural plots.

### Phase 6: Multi-Modal Stacking Ensemble Meta-Learner
* **Architecture**: Balanced Logistic Regression meta-learner fusing probability vectors $[P_{\text{XGBoost}}, P_{\text{ResNet}}] \in \mathbb{R}^{10}$.
* **Performance**: **`99.17%`** Overall Accuracy (3,243 / 3,270 correct on held-out test split) | **`98.62%`** Balanced Accuracy | **`96.24%`** Macro F1.
* **Critical Metric**: **`95.52%`** Recall on Accidental Industrial Explosions (Class 4).

### Phase 7: Rolling 30-Day Z-Score Anomaly Engine
* **Purpose**: Identifies unexpected thermal spikes exceeding historical facility baselines ($Z > 3.0\sigma$).
* **Results**: Scanned 128,467 industrial observations, flagging 1,780 accidental explosion events with automated dispatch receipts.

### Phase 8: SHAP Explainability & Real-Time GIS Dispatch
* **Purpose**: Generates mathematical feature attribution receipts for emergency commanders and exports real-time GIS feeds to the interactive frontend.

---

# 🎨 PART 2: THE 8 FRONTEND UI PROMPTS & EVOLUTION

```
┌───────────────────────────────────────────────────────────────────────────┐
│                    THERMALWATCH AI TACTICAL UI COCKPIT                    │
├───────────────────────────────────────────────────────────────────────────┤
│  [LEFT DOCK]           [TOP BAR: MODE PILL]               [RIGHT DOCK]    │
│  🏠 Home               [Thermal | Optical | Radar]        ➕ Zoom In      │
│  🗂️ Class Filters                                         ➖ Zoom Out     │
│  🎛️ Parameter Selector                                    🧭 Recenter     │
│  📅 Temporal Select                                       🌙/☀️ Theme Sw  │
│  ⚙️ Config                                                                │
│                                                                           │
│                      [60 FPS MAPLIBRE CANVAS]                             │
│       • High-Contrast Carto Dark Matter / Positron Basemap                │
│       • 65k Seamless Density-Weighted Flowing Hexbin Mesh                 │
│       • Instant 0ms GPU Step Expression Parameter Coloring                │
│                                                                           │
│  [DYNAMIC LEGEND]                              [HOVER TELEMETRY CARD]     │
│  BRIGHTNESS TEMP (K)                           1km Cell Telemetry         │
│  <325K ═════════ >345K                         Observations: 7            │
│                                                Avg FRP: 7.3 MW            │
│                                                NO₂: 0.067 mmol/m²         │
└───────────────────────────────────────────────────────────────────────────┘
```

### 🛰️ Prompt 1: Core Tactical Defense Cockpit Foundation
* **Goal**: Establish the minimalist military HUD layout inspired by Stitch and Apple macOS.
* **Key Components**:
  * Full-bleed interactive WebGL map canvas.
  * Floating macOS-style spring-physics Left & Right Docks using Framer Motion.
  * Top-right `Thermal | Optical | Radar` sensor mode switcher.
  * Right dock smooth **View Transitions API** circular clip-path light/dark theme toggle.

### 🔥 Prompt 2: 1.37M Dataset & Kepler-Style Hexbin Integration
* **Goal**: Transition from discrete, laggy point clusters to a continuous, flowy thermal density field.
* **Key Components**:
  * Sourced all 1,376,035 records from `master_2024_training.csv`.
  * Pre-aggregated data into tight H3 hexagonal polygons.
  * Removed dark stroke lines so hexagons seamlessly merge into an organic thermal flow across river basins and agricultural corridors.

### 🎨 Prompt 3: Dynamic Multi-Parameter Telemetry Coloring HUD
* **Goal**: Allow operators to dynamically switch the map coloring dimension across all satellite variables.
* **Supported Dimensions**:
  1. `brightness`: Surface thermal radiance (Kelvin)
  2. `frp`: Fire Radiative Power (Megawatts)
  3. `tropomi_no2`: Sentinel-5P Nitrogen Dioxide plume ($\text{mmol/m}^2$)
  4. `tropomi_so2`: Sulfur Dioxide flaring emissions ($\text{mDU}$)
  5. `land_cover_code`: ESA WorldCover classification (Forests, Croplands, Urban)
  6. `is_industrial`: Known persistent facility clusters ($\%$)
  7. `elevation`: Digital Elevation Model terrain altitude (meters)
  8. `Target_Class`: Phase 6 AI multi-modal fused prediction.
* **Hardware Acceleration**: Instant **0 ms GPU paint property switching** via `map.setPaintProperty`.

### 🎛️ Prompt 4: Real-Time Telemetry & Fire Class Filters Popover
* **Goal**: Multi-dimensional filtering across fire categories and physical sensor readings.
* **Interactive Controls**:
  * 5 Classification toggles with real dataset totals (170k Wildfire, 1.07M Agri, 125k Industrial, 5k Flare, 1.6k Accidental).
  * Interactive range sliders: **Min Brightness** ($300 - 360\text{ K}$), **Min FRP** ($0 - 80\text{ MW}$), **Min NO₂** ($0 - 0.20$), **Max Elevation** ($200 - 4000\text{ m}$).
  * One-click filter reset button.

### 📊 Prompt 5: Tactical Tooltip & Dynamic Cluster Summary Card
* **Goal**: Instant telemetry HUD on hovering any 1km hexagon across India.
* **Live Telemetry Surface**:
  * Total observation count in cell.
  * Primary classified fire type with color-coded status dot.
  * Brightness temperature, Average & Maximum FRP power.
  * Sentinel-5P NO₂ plume index & SO₂ emissions.
  * Human-readable ESA land cover name & elevation.
  * Industrial anomaly badge with Z-score outlier metric ($Z > 3.8\sigma$).

### 🌌 Prompt 6: High-Contrast Carto Dark Matter Visual Calibration
* **Goal**: Eliminate washed-out gray landmasses and achieve the exact pitch-black Kepler.gl aesthetic.
* **Key Changes**:
  * Switched basemap to official **Carto Dark Matter** (`#0d0e11` pitch black).
  * Implemented Kepler.gl 6-step calibrated quantile color stops (`#480032` $\rightarrow$ `#7e0037` $\rightarrow$ `#bd1e28` $\rightarrow$ `#e85617` $\rightarrow$ `#f59e0b` $\rightarrow$ `#fef08a`).
  * Added **HTML `<link rel="preload">` + module-level memory execution** reducing initial page load by over 60%.

### 🌊 Prompt 7: Density-Weighted Flowy Opacity & Noise Suppression
* **Goal**: Prevent the map from looking like a solid flat carpet by suppressing single-fire noise.
* **GPU Shader Logic**:
  * Opacity scales dynamically with density: `interpolate ['linear'] ['get', 'count'] (1 -> 0.45, 4 -> 0.70, 15 -> 0.90, 50 -> 1.00)`.
  * Single-fire background noise becomes semi-transparent, allowing high-intensity fire ribbons and industrial nodes to pop with vivid contrast.

### 🪟 Prompt 8: Viewport-Safe Containment & Dual-Theme Stability
* **Goal**: Prevent popovers from clipping laptop viewports and ensure 100% layer preservation on theme toggle.
* **Key Fixes**:
  * Bounded popovers with `maxHeight: min(480px, calc(100vh - 120px))` and smooth internal scrolling.
  * In-memory geometry caching ensures that switching between **Dark Matter** and **Positron Light** renders the full thermal field in **0 ms** without re-fetching.

---

## 🚀 Quick Start & Development

```bash
# Clone the repository
git clone https://github.com/your-username/ThermalWatch-AI.git
cd ThermalWatch-AI/frontend

# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build
```

---
*Built with React 19, Vite, TypeScript, MapLibre GL, Framer Motion, and Lucide Icons.*
