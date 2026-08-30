# ThermalWatch AI — Frontend UI Design Specification
*Status: Approved (Sections 1–5). Drawer internals pending Stitch mockup review.*
*Last updated: 2026-08-30*

---

## 1. Visual Identity & Viewport Layout

### Viewport
- The map occupies **100vw × 100vh** at all times. Nothing clips or shrinks the map.
- No header bar, no navbar, no footer, no sidebar. Zero chrome.
- This is a research/operational tool — no branding, no marketing text, no logos anywhere on the map canvas.

### Theme System
- **Two Modes:** Dark (default) ↔ Light. User-toggled.
- **Theme Toggle:** The `ThemeToggle` button from `personal/Portfolio/src/components/theme-toggle.tsx` is ported as-is. Uses the circular View Transition clip-path animation (`document.startViewTransition`) + sun↔moon SVG morph from `classic-svg.tsx`.
- **Panel Containers (Solid, Adaptive):**
  - Dark mode: `bg-zinc-950` surface, `text-zinc-50`, border `1px solid rgba(255,255,255,0.08)`, rounded-2xl.
  - Light mode: `bg-white` surface, `text-zinc-900`, border `1px solid rgba(0,0,0,0.08)`, rounded-2xl.
- **No glassmorphism / no translucent surfaces.**

### Typography
| Role | Font | Source |
|------|------|--------|
| All labels, headings, body text | **Space Grotesk** | Google Fonts |
| All numbers, coordinates, metrics, timestamps, codes | **Geist Mono** | Vercel / Google Fonts |

### Color Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `--class-wildfire` | `#ef4444` (Deep Red) | Wildfire markers |
| `--class-agri` | `#f97316` (Amber) | Agricultural burning markers |
| `--class-industrial` | `#a855f7` (Electric Purple) | Industrial persistent markers |
| `--class-gasflare` | `#eab308` (Solar Gold) | Gas flare markers |
| `--class-accidental` | `#ff0000` flashing w/ `#ffffff` | Accidental fire/explosion markers |
| `--hexbin-ramp-0` | `#4b0082` | Hexbin quantile 0 (darkest/lowest density) |
| `--hexbin-ramp-5` | `#fde047` | Hexbin quantile 5 (brightest/highest density) |

---

## 2. Map Layer Architecture

### Base Tile
- **Dark Mode:** Esri Dark Gray Canvas (`https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`)
- **Light Mode:** Esri Light Gray Canvas (`https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`)
- Basemap switches automatically when the global theme toggles.

### Layer 1 — Hexbin Density (zoom < 11)
- **Cell size:** 5 km radius hexbins.
- **Color ramp:** Sequential Magenta → Deep Red → Orange-Red → Orange → Gold → Bright Yellow (matching the kepler.gl screenshot reference).
- **Metric encoded:** Hotspot density / average FRP per cell.
- **Total dataset:** 1.3M points from `master_2024_training.csv`.

#### Hexbin Hover Tooltip
Shows the following for an NTRO officer:
1. **Total Hotspots** — Count of anomalies inside the bin.
2. **Primary Class** — Dominant classification in this bin (e.g., *Agricultural Stubble*).
3. **Avg FRP (MW) / Max FRP (MW)** — Thermal intensity in Geist Mono.
4. **Avg Brightness Temp (K)** — Satellite brightness reading.
5. **Atmospheric Index** — Mean TROPOMI NO₂ + SO₂ levels (industrial combustion verification).
6. **Z-Score Alert** — If any coordinate in this bin has Z > 3.0, displays a flashing `⚠ ACCIDENTAL SPIKE` badge.

### Layer 2 — Point Markers (zoom ≥ 11)
Hexbins dissolve via opacity crossfade into individual point markers.

#### Marker Design
| Class | Color | Icon |
|-------|-------|------|
| Wildfire | Deep Red (`#ef4444`) | 🌲 Tree |
| Agricultural Stubble | Amber (`#f97316`) | 🌾 Wheat / Crop |
| Industrial Persistent | Electric Purple (`#a855f7`) | 🏭 Factory |
| Gas Flare | Solar Gold (`#eab308`) | 🔥 Flame Stack |
| Accidental Fire | Flashing Red/White | ⚠ Explosion/Alert |

- Each marker is a solid filled circle in its class color with a white SVG icon centered inside.
- Accidental markers have an aggressive CSS pulse ring animation.

#### Hover Tooltip (point level)
- Class icon + classification name
- Region / District
- FRP (MW) in Geist Mono
- Acquisition timestamp (UTC)

#### Click on Marker
- Opens the **InspectorDrawer** (right edge) — see Section 4.

---

## 3. Floating Controls & Layout

### Top-Right — Mode Switcher Pill
- A horizontal segmented pill with exactly two options: `2024 DEMO` and `LIVE FEED`.
- **Animation:** Uses the same circular View Transition clip-path animation as the `ThemeToggle` when switching between modes.
- Position: `fixed`, `top: 16px`, `right: 16px`.
- Style: Solid, theme-adaptive container.

### Left Dock — Feature Panel Launchers
- **Component:** Magic UI `<Dock direction="vertical">` with hover magnification.
- **Behavior:** Clicking an icon opens a **floating popover card** anchored right next to the active dock icon (not a full-height sidebar).
- **Icons & Panels:** *(Final list deferred until feature list is finalized by the user)*

### Right Dock — Direct Utility Controls
- **Component:** Magic UI `<Dock direction="vertical">` with same hover magnification.
- **Bottom of dock:** `ThemeToggle` component.
- **Icons:** *(Final list deferred until feature list is finalized by the user)*
- **Future feature:** Guided onboarding tour (spotlight-style walkthrough — screen dims, only the active UI element is visible, "Next" button advances to the next step).

### Bottom-Left — Credits Button
- A minimal floating button labeled `Credits` sitting directly on the map.
- **Hover interaction:** Partner logos (NASA, JAXA, ESA, Copernicus, FSI, Esri, Open-Meteo) smoothly slide/drag out horizontally from behind the button using Framer Motion `AnimatePresence`.
- Mouse-leave: Logos retract back into the button.

---

## 4. Interaction Model — Hotspot Detail

> **Note:** Drawer internal layout and content structure are **deferred pending Stitch mockup review**. The list below is the intended content, not a finalized layout spec.

### Hover on Marker
Small tooltip near cursor. Content: class icon, classification name, region, FRP, timestamp.

### Click on Marker
The `InspectorDrawer` slides in from the right edge.

**Intended content (order and layout TBD after Stitch mockup):**
1. Classification header (class color + name + facility/region)
2. Hero metrics (FRP in MW + Brightness Temp in K)
3. Acquisition metadata (coordinates, sensor, land cover, date/time) — key-value rows
4. **Diurnal Heat Curve** — *Preferred: Radial Sonar Dial (24-hr polar clock). Final decision pending Stitch mockup comparison of Radial Dial vs. Smooth Line Area Chart.*
5. Atmospheric trace — TROPOMI NO₂ and SO₂ with fill bars
6. AI model breakdown — XGBoost, CNN, ResNet confidence scores + ensemble final
7. SHAP feature explanation — human-readable AI reasoning summary
8. Z-Score anomaly banner — displayed if Z > 3.0 (flashing high-alert header)

---

## 5. Emergency Alert System

### Trigger
- A thermal anomaly coordinate is flagged with Z-Score > 3.0 against its rolling 30-day FRP baseline.
- This indicates an accidental industrial fire, explosion, or pipeline rupture.

### Alert Sequence
1. **Immediate audio:** Full system volume alarm/horn via Web Audio API.
2. **Full-screen red flash:** Entire viewport covered by a red overlay that blinks 3 times via GSAP (`opacity` cycling animation).
3. **Alert screen displays:**
   - Large warning title: `⚠ ACCIDENTAL INDUSTRIAL FIRE ALERT`
   - Facility name, district/state
   - Coordinates in Geist Mono
   - Current FRP (MW) and Z-Score value
   - Acquisition timestamp
4. **Dismiss:** `Acknowledge & Investigate` button — available at any point during the blinks. Click silences the alarm and closes the overlay.

### Post-Dismiss Behavior
1. Map smoothly flies (animated pan+zoom) to the event coordinates.
2. `InspectorDrawer` slides open from the right showing the full event telemetry.
3. Target Dock panel expands with this event pinned at the top of the target list.

---

## 6. Deferred / Future Features
*(Noted for future design sprints — not part of the current implementation scope)*

- **Guided Onboarding Tour:** Spotlight-style walkthrough. Screen dims, active UI element is highlighted, "Next" advances steps.
- **Drawer internal layout:** Full visual spec pending Stitch mockup review.
- **Diurnal visualization:** Radial Sonar Dial vs. Line Area Chart — needs Stitch mockup comparison.
- **Dock icon lists:** Final feature list to be locked by the user before implementation.
- **Analytics Dashboard Modal:** Statistical overview with charts per class, region, and temporal analysis.
- **Export Controls:** Download filtered GeoJSON / CSV from the current map state.
- **Temporal Playback:** Scrub through the 2024 archive day-by-day.

---

## 7. Theme Toggle Source Reference

Ported from `personal/Portfolio` — do not rewrite from scratch, copy directly:

| File | Path |
|------|------|
| Toggle component | `personal/Portfolio/src/components/theme-toggle.tsx` |
| Icon SVG morph | `personal/Portfolio/src/components/ui/classic-svg.tsx` |

Copy to: `website/src/components/ui/theme-toggle.tsx` and `website/src/components/ui/classic-svg.tsx`.
Dependencies: `flushSync` from `react-dom`, `View Transition API` (native browser).

---

## 8. Tech Stack for Implementation

| Concern | Library |
|---------|---------|
| Map engine | Leaflet + react-leaflet (current) — Hexbin via `leaflet-hexbin` plugin |
| Dock | Magic UI `<Dock>` |
| Animations | Framer Motion + GSAP |
| Drawer / Popover / Sheet | shadcn/ui |
| Charts (if needed) | Recharts |
| State | Zustand |
| Theme transition | View Transition API (ported from Portfolio) |
| Alert audio | Web Audio API |
| Fonts | Google Fonts CDN — Space Grotesk + Geist Mono |
