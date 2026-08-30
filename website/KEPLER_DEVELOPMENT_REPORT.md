# Kepler.gl UI Clone & Web Platform Development Report

> **Repository Subdirectory**: `/website`  
> **Project**: Wildfire & Geospatial Threat Intelligence Dashboard (Iteration 1)  
> **Target Paradigm**: Kepler.gl Architectural & Layout Clone  

---

## 1. Executive Summary & Progress Overview

The `/website` codebase was developed to create a high-performance, real-time geospatial intelligence platform modeled after the **Kepler.gl** visual and interaction paradigm. It serves as the frontend visualization layer for our multimodal fire hotspot prediction pipeline (Phases 1–8).

---

## 2. Core Architecture & Implemented Features

### A. Geospatial & WebGL Rendering Engine
- **MapLibre GL JS Integration** (`ThreatMap.tsx`): 60 FPS WebGL canvas rendering raster and vector basemaps with dynamic pitch (0°–75°) and 360° bearing rotation.
- **Deck.gl Data Overlays** (`@deck.gl/layers`, `@deck.gl/aggregation-layers`):
  - **ScatterplotLayer / IconLayer**: High-performance rendering of active wildfire hotspots with dynamic color coding by risk tier (Low, Medium, High, Extreme).
  - **Hexagon / Heatmap Layers**: Real-time aggregation of thermal anomalies and spatial fire intensity clusters.
  - **Tooltip & Hover Picking**: Fast GPU-based raycasting for instant metadata inspection.

### B. Kepler.gl Layout & UI Components
- **Left Icon & Control Drawer (`LeftPanelStrip.tsx`, `Panel.tsx`)**:
  - **Basemap Switcher Panel** (`BasemapPanel.tsx`): Live switching between dark mode, satellite imagery, topographic terrain, and minimal monochrome basemaps.
  - **Threat Class Filters** (`ClassFilterPanel.tsx`): Granular checkbox and confidence range filters to isolate specific wildfire severity tiers.
  - **Feed Source Toggles** (`FeedSourcePanel.tsx`): Ability to toggle live satellite feeds (MODIS, VIIRS SNPP, Sentinel-2, NOAA-20).
  - **Target Geo Jumps** (`TargetJumpsPanel.tsx`): Instant camera teleports to critical ecological zones (Western Ghats, Central Forests, Himalayan Valleys).
- **Right HUD Action Strip (`RightIconStrip.tsx`)**:
  - Floating vertical toolbar mimicking Kepler.gl's map controls: 3D perspective tilt toggle, compass reset, fullscreen mode, layer visibility triggers, and visual opacity sliders.
- **Contextual Hotspot Intelligence Inspector (`HotspotDetailDrawer.tsx`)**:
  - Side drawer displaying deep multimodal features: Brightness Temperature (K), Fire Radiative Power (MW), ESA WorldCover land use class, diurnal cycle curves, and stacking ensemble confidence outputs.
- **Top Branding & Status Overlay (`TopBrand.tsx`, `StatusBadge.tsx`)**:
  - System telemetry badge displaying active feed status, processed event counts, and real-time clock.

---

## 3. Map Styles & Tile Providers Implemented

| Category | Map Layer | Provider | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **Dark Theme** | CARTO Dark Matter | CARTO / OpenStreetMap | High-contrast situational heatmaps and vector overlays |
| **Clean Dark** | CARTO Dark (No Labels) | CARTO / OpenStreetMap | Uncluttered base geometry for custom vector labeling |
| **Satellite** | ESRI World Imagery | ESRI / Maxar | Sub-meter ground-truth aerial photography |
| **Topography** | ESRI World Topo / OpenTopo | ESRI / OpenTopoMap | Elevation contours, slope gradients, and mountain ridgelines |
| **Light Theme** | CARTO Positron | CARTO / OpenStreetMap | Daylight field operations and printable situation reports |
| **Street Network**| ESRI World Street | ESRI | Municipal road networks and logistics planning |

---

## 4. Key Difficulties Faced During Kepler.gl Layout Cloning

Cloning the exact ergonomics and interaction model of Kepler.gl in a standalone React application presented several non-trivial engineering hurdles:

### 1. Complex Layout Hierarchy & Z-Index Stacking
* **Challenge**: Kepler.gl layers multiple overlapping elements: full-bleed WebGL map, multi-tab collapsible left sidebars, floating HUD toolbars, time-slider playback bars, and popover legends.
* **Friction**: Maintaining proper pointer event isolation (`pointer-events: none` on overlay backdrops and `pointer-events: auto` on interactive panels) while allowing seamless drag-to-pan map interactions beneath transparent HUD glass resulted in event leakage and layout clipping.

### 2. Viewport & WebGL Synchronization between MapLibre and Deck.gl
* **Challenge**: Kepler.gl uses a unified WebGL context via `react-map-gl` and `deck.gl`.
* **Friction**: When switching raster basemap styles dynamically (e.g. from CARTO Dark to ESRI Satellite), MapLibre occasionally triggers a full style re-render (`Style is not done loading`), which caused Deck.gl layer flickering, WebGL context loss warnings, and temporary canvas desynchronization during fast camera pitch transitions.

### 3. Panel Density vs. Operational Simplicity (Visual "Bloat")
* **Challenge**: Kepler.gl is designed as an exhaustive analytical workbench with deep nested menus (Layers, Filters, Interactions, Basemaps, Map Settings).
* **Friction**: Replicating this full drawer hierarchy created excessive visual clutter ("bloat") on small to medium viewports, competing with the primary goal of fast, decisive situational awareness. Streamlining the layout without sacrificing Kepler's modularity required ongoing architectural refactoring.

### 4. Deck.gl Canvas Resizing on Panel Expand/Collapse
* **Challenge**: When opening wide flyout panels or inspector drawers, Kepler smoothly shifts the map viewport center.
* **Friction**: In React, triggering smooth CSS panel transitions caused Deck.gl to render at stale canvas pixel dimensions until an explicit `map.resize()` / `deck.setProps()` was fired, occasionally producing brief tile tearing or blurred resolution during animation frames.

### 5. Multi-Layer Opacity & Color Ramp Harmonization
* **Challenge**: Blending high-intensity wildfire heatmaps and scatter points with photographic satellite imagery versus dark monochrome maps.
* **Friction**: Satellite basemaps have high visual variance (greens, browns, whites), which can obscure lower-intensity heat points, whereas dark basemaps emphasize glowing vectors. Replicating Kepler's automatic layer blending and dynamic color ramp adjustments required complex shader configurations.

---

## 5. Summary & Transition to `website_it2`

While `/website` successfully established the full-featured Kepler.gl architecture with deep panels, drawers, and multi-feed controls, the need for a **cleaner, step-by-step, layer-by-layer build** led to the creation of `/website_it2`.

`website_it2` begins directly with an ultra-minimal, high-performance base map comparison engine (Left Map vs. Right Map with real-time swipe curtain slider), allowing each subsequent data layer (vector points, thermal heatmaps, multimodal predictions) to be added incrementally with zero visual bloat.
