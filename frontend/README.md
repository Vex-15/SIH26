# 🛰️ ThermalWatch AI — Defense-Grade Thermal Anomaly Intelligence Dashboard
**Smart India Hackathon (SIH) 2026 | Multi-Modal Satellite Fire Intelligence**

---

## 🧭 Executive Summary
ThermalWatch AI is an ultra-high-performance, military-grade satellite situational cockpit built for monitoring, triaging, and predicting thermal combustion events across the entire Indian subcontinent in real-time.

It visualizes **1,376,035 contiguous satellite fire records** across 2024 with zero latency (60 FPS WebGL rendering) using an optimized H3 hexagonal density mesh and deep-learning multi-modal classification.

---

## 🌟 What is in the Website Now

### 1. 🗺️ High-Contrast Defense Map Cockpit
* **Carto Dark Matter & Positron Vector Basemaps**: Pitch-black tactical contrast (`#0d0e11`) with smooth 0ms layer preservation across Light and Dark themes.
* **Density-Weighted Flowy Heatmap**: Dynamic opacity scaling (`interpolate ['linear'] ['get', 'count']`) suppressing transient single-fire noise and highlighting intense agricultural corridors, wildfire ridges, and industrial clusters.
* **Instant HTML Preload Pipeline**: Pre-cached GeoJSON/ArrayBuffer pipelines eliminate loading delays, providing instantaneous interactive rendering.

### 2. 🎛️ Multi-Dimensional Telemetry Coloring & Filters
* **Default AI Classification Rendering**: Direct 1-to-1 visual synchronization with canonical fire channels:
  * 🔴 **Wildfire / Forest Fire**: Crimson Red (`#ef4444`)
  * 🟡 **Agricultural Stubble**: Warm Amber (`#f59e0b`)
  * 🔵 **Industrial Persistent Facility**: Cobalt Indigo (`#6366f1`)
  * 🟪 **Gas Flare**: Electric Violet (`#a855f7`)
  * 🚨 **Accidental Explosion**: Emergency Neon Orange (`#ff3b30`)
* **8 Dynamic Telemetry Metrics** (via Left Dock Icon 3):
  1. `brightness`: Surface Thermal Radiance (Kelvin)
  2. `frp`: Fire Radiative Power (MW)
  3. `tropomi_no2`: Sentinel-5P Nitrogen Dioxide column ($\text{mmol/m}^2$)
  4. `tropomi_so2`: Sentinel-5P Sulfur Dioxide flaring index ($\text{mDU}$)
  5. `land_cover_code`: ESA WorldCover 10m Ground Classification
  6. `is_industrial`: Persistent Facility Cluster Density ($\%$)
  7. `elevation`: SRTM Topographic Altitude (meters)
  8. `Target_Class`: Phase 6 AI Multi-Modal Stacking Decision

### 3. 📊 Real-Time Telemetry & Fire Class Popover (Left Dock Icon 2)
* 5 Classification toggles with real dataset totals (`170,987` Wildfire, `1,072,341` Agricultural, `125,965` Industrial, `5,076` Flare, `1,666` Accidental).
* Interactive threshold sliders: **Min Brightness** ($300 - 360\text{ K}$), **Min FRP** ($0 - 80\text{ MW}$), **Min NO₂** ($0 - 0.20$), and **Max Elevation** ($200 - 4000\text{ m}$).
* Strictly bounded viewport containment (`maxHeight: min(480px, calc(100vh - 120px))`) with internal scrolling to prevent viewport leaking.

### 4. 🎯 Tactical Hover HUD & Dynamic Cluster Summary Card
Hovering any 1km hexagon anywhere in India displays an instant telemetry readout:
* **Total Observation Count** in cell
* **Primary Classified Fire Type** with status dot
* **Brightness Temperature** (Kelvin)
* **Average & Maximum Fire Radiative Power** (MW)
* **Sentinel-5P NO₂ & SO₂ Emissions**
* **ESA WorldCover Land Classification** (Tree Cover, Cropland, Urban)
* **Digital Elevation** (meters)
* **Rolling 30-Day Z-Score Anomaly Badge** ($Z > 3.0\sigma$)

### 5. 🪟 Tactical Docks & Controls
* **Left Spring Dock**: Home / Center India (`[78.96, 20.59]`, Zoom 4.6), Fire Class Filters, Parameter Color Switcher, Temporal Selector, Config.
* **Top Sensor Mode Pill**: `Thermal | Optical | Radar` spectral modes.
* **Right Control Dock**: Smooth Zoom In/Out, Recenter Compass, Circular View Transitions light/dark theme toggle.
* **Bottom Synchronized Legend**: Adapts dynamically between discrete AI classification chips and continuous sensor gradient bars.

---

## 🚀 Quick Start

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build
```

---
*Powered by React 19, TypeScript, MapLibre GL, Framer Motion, and Vite.*
