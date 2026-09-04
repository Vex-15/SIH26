# 🔥 ThermalWatch AI — Complete Stitch & UI Prompt Suite (Prompts 1 to 8)

This document contains the complete, unabridged, copy-pasteable prompt specifications for all 8 UI layers and views in the **ThermalWatch AI** geospatial intelligence platform.

---

## 🛰️ Prompt 1: National Overview Defense Cockpit (Core HUD)

```text
A high-tech, minimalist military-grade geospatial thermal intelligence dashboard for India. 
The basemap is pitch black Carto Dark Matter (#0d0e11) with subtle, muted state and national boundaries in faint gray (#1e2029).

1. Map Viewport & Data Mesh:
   - Centered on India (zoom level 4.6).
   - Thermal detections across India render as a dense, organic continuous flow field of 1.0 km hexagonal cells (H3 resolution 7).
   - Color ramp represents Brightness Temperature (Kelvin): Quantile ramp transitioning from deep violet-plum (<312K) to dark magenta, crimson, warm amber, bright golden-yellow, and white-hot peaks (>367K).
   - The hexbins seamlessly merge into continuous glowing ribbons across major agricultural basins (Punjab, Indo-Gangetic plain) and industrial belts, leaving natural pitch-black terrain voids across unburnt regions.

2. Minimalist Floating macOS-Style Spring-Physics Docks:
   - Left Floating Dock: Vertical rounded glass pill (#12151c at 95% opacity, backdrop blur 20px) containing Home, Layers/Filter, Telemetry Sliders, Calendar/Timeline, and Settings icons.
   - Right Floating Dock: Vertical rounded glass pill containing Zoom In (+), Zoom Out (-), North Compass, and Theme Toggle (Smooth View Transitions circular clip-path light/dark toggle).

3. Top Sensor Mode Switcher:
   - Top-right floating glass pill with three toggle states: "Thermal (Active)" | "Optical" | "Radar".

4. Bottom Dynamic Legend:
   - Bottom-left floating dark glass capsule showing the continuous color gradient bar with min/max Kelvin labels ("< 312 K" to "> 367 K").
```

---

## 🎨 Prompt 2: Dynamic Multi-Parameter Telemetry Coloring HUD

```text
The dark geospatial thermal intelligence dashboard at national overview, with the 
"TELEMETRY PARAMETER" selector open anchored alongside the left dock.

1. Parameter Popover Card:
   - Glassmorphism dark container (#12151c at 96% opacity, backdrop blur 20px, 16px radius, subtle border rgba(255,255,255,0.12)).
   - Header: "TELEMETRY PARAMETER" with subtext "Select metric to project on 1km hex grid".
   - 8 Selectable Satellite Dimensions:
     1. Brightness Temperature (Kelvin) — Thermal radiance emitted by fire hotspots.
     2. Fire Radiative Power (Megawatts) — Radiative combustion energy release rate.
     3. Nitrogen Dioxide (NO₂) (mmol/m²) — Sentinel-5P combustion exhaust plume index.
     4. Sulfur Dioxide (SO₂) (mDU) — Volcanic, smelter, and refinery sulfur emissions.
     5. Land Cover Classification (ESA 10m) — ESA WorldCover ground surface type (Forest, Cropland, Urban).
     6. Industrial Facility Index (%) — Known manufacturing and refinery cluster ratio.
     7. Topographic Elevation (Meters) — Digital elevation model altitude.
     8. AI-Classified Anomaly Type — Multi-modal stacking ensemble classification.

2. Instant GPU Shader Switching:
   - Selecting any parameter instantly updates the 246,000 hexbins across India in 0 ms via hardware-accelerated WebGL paint properties.
```

---

## 🌾 Prompt 3: District-Level Precision Zoom & Custom Vector SVG Markers

```text
The dark geospatial thermal intelligence dashboard smoothly transitioned to district 
zoom level (zoom 10.5+), centered over an active agricultural and industrial corridor (e.g. Panipat / Karnal / Mathura).

1. Level-of-Detail (LOD) Transition:
   - The coarse 1km aggregate hexbins smoothly fade out (opacity -> 0) between zoom 8.0 and 8.8.
   - Precision individual hotspot detections fade in, rendering as 72,000+ synchronized GPU point markers.

2. Five Custom SVG Classification Glyphs:
   - 🌾 Agricultural Stubble: Amber circular badge (#f59e0b) with white wheat stalk vector icon.
   - 🔥 Forest Wildfire: Crimson circular badge (#ef4444) with white flame vector icon.
   - 🏭 Industrial Persistent: Cobalt indigo badge (#6366f1) with white dual-chimney factory smokestack icon.
   - 🛢️ Gas Flare: Violet badge (#a855f7) with white flare derrick flame icon.
   - 🚨 Accidental / Emergency Fire: Neon danger red badge (#ff3b30) with white alert triangle icon.

3. Concentric Radar Threat Rings:
   - Accidental / Emergency hotspots feature dynamic radiating concentric red radar rings (sonar pulses) expanding outward to draw operator focus.

4. Hover Telemetry Tooltip:
   - Hovering any marker presents an instant floating glass telemetry tooltip with FRP, Brightness, Sensor Name (VIIRS JPSS-1), and Acquisition Date.
```

---

## 📋 Prompt 4: Full-Height Slide-in 40% Telemetry Inspector Drawer

```text
The dark geospatial thermal intelligence dashboard at district zoom level, 
identical to Prompt 3's map background (markers visible, dark terrain). 
The officer has clicked on an ACCIDENTAL FIRE marker. A full-height 
drawer has slid in from the right edge of the viewport covering 40% of the screen.

1. Drawer Architecture:
   - Width: 40% of viewport, full height (100vh).
   - Background: Obsidian dark glass (#0a0a12 at 97% opacity, backdrop blur 28px) with a glowing danger accent border along the left edge.
   - Map Viewport: The map camera smoothly eases to offset the clicked incident into the remaining left 60% viewport so it remains completely unobscured.

2. Header & Coordinates:
   - Title: "THERMAL EVENT · CLASS 4 · ACCIDENTAL FIRE".
   - Coordinates: Precise lat/lon readout (e.g., 29.4590° N, 76.8671° E).
   - Close button (X) in the top-right corner.

3. Telemetry Matrix:
   - Hotspot Count (1), Risk Level ("Critical" / "High" in color-coded pills), Elevation (237m).
   - ESA Land Cover ("Built_up / Industrial"), Satellite Sensor ("VIIRS_JPSS1"), Acquisition Date ("2024-06-23").
   - Mean & Peak Fire Radiative Power (6.50 MW), Average & Peak Brightness (340.9 K).
   - Sentinel-5P TROPOMI NO₂ column (0.14 mol/m²) & SO₂ column (0.23 mol/m²).

4. AI Model Diagnostic Explainability:
   - Anomaly Alert Badge: "Anomalous Spike Detected — Z-score +4.12σ exceeds 3.0σ baseline".
   - Stacking Ensemble Per-Model Confidence Scores:
     * XGBoost (Phase 3 Tabular): 98.7%
     * 1D-CNN (Phase 4 Himawari-9 Diurnal Time-Series): 86.1%
     * ResNet-18 (Phase 5 ESA 10m Spatial Tile): 80.5%
     * Stacking Meta-Classifier (Phase 6 Fused): 99.8% Accidental Fire Confidence.
```

---

## 🚨 Prompt 5: High-Priority Emergency Anomaly Alert Modal

```text
The dark geospatial thermal intelligence dashboard with a high-priority emergency 
anomaly alert modal centered on the screen, triggered automatically when a severe 
Z-score (> 3.8σ) accidental industrial fire is selected.

1. Modal Visual Structure:
   - Centered floating glass modal (520px width) with dark crimson backdrop blur (#160b0f at 96% opacity) and pulsing neon red outer border.
   - Danger Siren Icon: Animated pulsing exclamation badge with radial glow.

2. Emergency Diagnostics:
   - Alert Title: "CRITICAL ANOMALY DETECTED — ACCIDENTAL FIRE SPIKE".
   - Z-Score Metric: Large animated counter ramping to "+4.12σ" with danger badge ("EXCEEDS 3.0σ MULTI-YEAR INDUSTRIAL BASELINE").
   - Location & Facility Context: "MIDC Industrial Estate, Panipat District, Haryana".
   - Threat Assessment: Sudden non-cyclical thermal surge in urban/built-up land cover co-located with high SO₂ combustion emissions.

3. Action Controls:
   - "Dispatch Alert to State Disaster Control Room (SDMA)" (Primary pulsing crimson button).
   - "Trigger Sentinel-2 10m Optical Tasking" (Secondary glass button).
   - "Acknowledge & Dismiss" (Ghost button).
```

---

## 🛰️ Prompt 6: Sentinel-2 10m Optical vs Thermal Split-Screen Wipe

```text
A full-screen split-sensor geospatial comparison view built for an NTRO research officer.
The entire viewport is occupied by the map. Zero chrome. Zero branding. The wipe divider
IS the interface. Identical design system to the core dashboard — no new tokens introduced.

DESIGN SYSTEM (REQUIRED — identical to core dashboard):
- Platform: Web, Desktop-first, 1440×900
- Theme: Dark, zero-chrome operational research tool
- Background (map): Esri Dark Gray Canvas basemap — near-black (#0d0d0d), muted labels.
  Full viewport. No margins. No padding.
- Surface (floating panels): Solid #18181b. No glass, no blur.
  Border: 1px solid rgba(255,255,255,0.06). Radius: 16px.
- Text Primary: #fafafa. Text Secondary: #71717a.
- Accent: Amber #f59e0b — active states only.
- Font Primary: Space Grotesk. Font Numbers: Geist Mono.
- Danger: #ef4444. No drop shadows. No gradients.

MAP STATE:
- Centered at 29.387° N, 76.980° E (MIDC Industrial Estate, Panipat, Haryana). Zoom: 12.5.
- Left half of wipe: VIIRS MODIS thermal infrared layer — individual hotspot detections rendered
  as filled circular markers, color-coded by Brightness Temperature:
    340–350 K → #f59e0b (amber), 350–360 K → #ef4444 (red), >360 K → #ffffff (white-hot).
  The specific accidental fire incident has a 3-ring pulsing sonar animation (SVG circles,
  stroke: #ef4444, opacity fading from 0.6 to 0, radius expanding 20px → 80px, 2.4s loop).
- Right half of wipe: Sentinel-2 Level-2A 10m true-color (RGB) optical imagery. Visible:
  factory roof structures (grey), brown smoke plume drifting NNW, surrounding green cropland
  and yellow stubble-burnt agricultural parcels. No custom markers on optical side.

PAGE STRUCTURE:

1. SPLIT WIPE DIVIDER (Primary Interaction Surface):
   Position: absolute, centered at 50% x by default. Height: 100vh.
   The divider is a 2px wide line, color: rgba(255, 255, 255, 0.35).
   No background on the line itself. It is purely a clipping boundary between the two map layers.

   HANDLE (Drag Target):
   - A solid #18181b pill (not glass, not blurred — matches surface tokens).
   - Width: 40px. Height: 72px. Border-radius: 20px.
   - Border: 1px solid rgba(255,255,255,0.10).
   - Vertically centered on the divider at 50% viewport height.
   - Contains two chevron icons side-by-side: ‹ and › in #71717a, 14px each, 8px apart.
   - On hover: chevron color shifts to #fafafa. Handle border brightens to rgba(255,255,255,0.20).
   - Cursor: ew-resize.
   - Drag behavior: As handle drags left/right, the clip-path of the thermal layer adjusts
     in real-time (CSS clip-path: inset(0 calc(100% - {x}px) 0 0)).
   - Drag constraints: minimum 15% from left edge, maximum 85% from left edge.

2. TOP-CENTER — Sensor Context Pill:
   Position: fixed, top: 16px, left: 50%, transform: translateX(-50%).
   A horizontal capsule — background: #18181b solid. Border-radius: 9999px.
   Border: 1px solid rgba(255,255,255,0.08). Padding: 8px 16px.
   Left label: "THERMAL · VIIRS 375m" in 10px Space Grotesk uppercase, letter-spacing: 0.08em,
     color: #f59e0b (amber — this side is active/thermal).
   Center divider: 1px solid #27272a, height: 14px, margin: 0 12px.
   Right label: "OPTICAL · SENTINEL-2 10m" in 10px Space Grotesk uppercase, color: #71717a.
   Below right label — a status micro-badge: "ACQUIRED 2024-06-23 · CLOUD 1.2%"
     in 9px Geist Mono, color: #52525b, displayed inline after a · separator.
   No shadow. No blur. Matches surface token exactly.

3. TOP-RIGHT CORNER — Mode Switcher Pill (identical to core dashboard):
   Position: fixed, top: 16px, right: 16px.
   Background: #18181b. Border: 1px solid rgba(255,255,255,0.08). Rounded-full.
   LEFT segment "2024 DEMO": active — solid amber #f59e0b fill, #0d0d0d text.
   RIGHT segment "LIVE FEED": inactive — #71717a text.

4. LEFT DOCK (unchanged from core dashboard):
   Position: fixed, left: 16px, vertically centered.
   Width: 48px. Background: #18181b. Border: 1px solid rgba(255,255,255,0.06). Rounded-2xl.
   5 icon buttons, 10px gap. The Layers icon is in ACTIVE amber state (#f59e0b).

5. RIGHT DOCK (unchanged from core dashboard):
   Position: fixed, right: 16px, vertically centered.
   Width: 48px. Same styling. Zoom In, Zoom Out, Compass, Theme Toggle icons.

6. BOTTOM-CENTER — Comparison Mode Selector:
   Position: fixed, bottom: 16px, left: 50%, transform: translateX(-50%).
   A horizontal segmented pill — background: #18181b. Border: 1px solid rgba(255,255,255,0.06).
   Border-radius: 9999px. Padding: 4px (inner gap around segments).
   Three segments, 10px horizontal padding each, 8px vertical, 11px Space Grotesk uppercase:
   - "WIPE ⟷": ACTIVE state — background: #f59e0b, color: #0d0d0d, border-radius: 9999px.
   - "SIDE-BY-SIDE": inactive — color: #71717a, no fill.
   - "BLEND ◑": inactive — color: #71717a, no fill.
   Transition between segments: 150ms ease-out background color and color change.
   No shadow. Identical solid surface token.

7. OPTICAL SIDE ANNOTATIONS (rendered directly on the right map layer, NOT in a floating panel):
   a. Burn Area Bounding Box:
      - SVG polyline overlay in screen-space. Stroke: #ef4444. Stroke-width: 1.5.
        Stroke-dasharray: 5 4. Fill: rgba(239,68,68,0.04).
      - Positioned around the factory site on the optical imagery (~240×180px bounding box).
      - A small inline label: "~38 ha ESTIMATED BURN PERIMETER" in 9px Geist Mono, color: #ef4444,
        positioned at the top-left corner of the box with 4px offset.
   b. Wind / Smoke Plume Arrow:
      - An SVG arrow originating at the plume source, pointing NNW at ~340° bearing.
        Length: ~120px screen-space. Stroke: rgba(255,255,255,0.45). Stroke-width: 1.5.
        Arrow cap: a small filled triangle, 6px. No fill on the body.
      - Inline label beside arrowhead: "WIND 340° · 14 km/h" in 9px Geist Mono, color: #71717a.

8. BOTTOM-LEFT CORNER — Credits Button (unchanged):
   Position: fixed, bottom: 16px, left: 16px.
   "© Credits" — 10px Space Grotesk, color: #71717a.
   Background: #18181b. Border: 1px solid rgba(255,255,255,0.06). Rounded-full. Px: 8px.

MOTION NOTES:
- Wipe divider drag: No easing — real-time 1:1 cursor tracking. Clip-path updates every frame.
- Sensor Context Pill entrance: on page load, slides down from y: -8 with opacity 0→1 in 220ms,
  ease: power2.out.
- Mode Switcher (Comparison pill): switching segments triggers a 150ms clip-path slide of the
  active fill pill from one segment to the next (layout animation, not opacity swap).
- Hover on dock icons: neighbor icons magnify 1.15× (Magic UI dock magnification).
- All color transitions on interactive elements: 200ms ease. No layout shifts.

FUTURE SCOPE & LIVE SYSTEM INTEGRATION:
- Emergency Warning Simulation Trigger: The left dock includes a dedicated siren/radio broadcast simulation trigger that displays an explicit operational warning dialog explaining that this triggers a full-volume alert broadcast before redirecting into real-time optical satellite reconnaissance.
- Real-Time Atmospheric Wind & Fire Spread Engine: Connected to the live Open-Meteo meteorological API to fetch authentic wind vectors, temperature, and humidity for the target coordinate. Dynamic Rothermel/Huygens elliptical fire spread modeling generates 1-hour (red), 3-hour (orange), and 6-hour (amber) downwind perimeter hazard cones directly on the Sentinel-2 / Esri HD satellite layer.
```

---


## ⏱️ Prompt 7: 24-Hour Diurnal Time-Series & Playback Controller

```text
A full-screen geospatial thermal intelligence playback dashboard for an NTRO research officer.
The map IS the product. The bottom-anchored timeline scrubber is the ONLY new UI element.
It does not cover the docks. It does not have a backdrop blur.
All tokens are identical to the core dashboard.

DESIGN SYSTEM (REQUIRED — identical to core dashboard):
- Platform: Web, Desktop-first, 1440×900. Theme: Dark, zero-chrome.
- Background (map): Esri Dark Gray Canvas. Full viewport. No margins.
- Surface: Solid #18181b. No glass, no blur. Border: 1px solid rgba(255,255,255,0.06). Radius: 16px.
- Text Primary: #fafafa. Text Secondary: #71717a. Accent: #f59e0b. Danger: #ef4444.
- Font Primary: Space Grotesk. Font Numbers: Geist Mono. No shadows. No gradients.

MAP STATE:
- Centered on India (zoom 4.6). The hexbin thermal mesh is visible — same color ramp as Prompt 1.
- The map is in "animated" state: hotspot hexbins pulse, grow, and fade as the playhead moves.
  Active detections for the current playhead timestamp render at full opacity.
  Detections not yet reached render at 0 opacity.
  Detections passed render as faded burn scars: opacity 0.25, color shifted to #831843 (plum-red).
- At playhead 03:00 AM: the MIDC Panipat anomaly hexbin pulses with a bright danger red glow
  (box-shadow-equivalent via WebGL: #ef4444 at 0.9 opacity, spread 12px), distinct from all others.

PAGE STRUCTURE:

1. BACKGROUND — Identical to core dashboard (map, docks, mode switcher, credits unchanged).

2. TOP-RIGHT CORNER — Mode Switcher Pill (unchanged from core).

3. LEFT DOCK (unchanged — Layers icon in active amber state).

4. RIGHT DOCK (unchanged — Zoom, Compass, Theme icons).

5. ABOVE SCRUBBER — Preset Selector Chips Row:
   Position: fixed, bottom: 88px, left: 50%, transform: translateX(-50%).
   A horizontal row of 4 chips. No container background — chips are standalone.
   Each chip: background: #18181b. Border: 1px solid rgba(255,255,255,0.06).
   Border-radius: 9999px. Padding: 5px 12px.
   Font: 10px Space Grotesk uppercase, letter-spacing: 0.06em.
   Gap between chips: 6px.

   Chip 1 — "24H DIURNAL": ACTIVE state.
     Background: #f59e0b. Color: #0d0d0d. Border: none.
   Chip 2 — "7-DAY SURGE": inactive. Color: #71717a.
   Chip 3 — "30-DAY SEASONAL": inactive. Color: #71717a.
   Chip 4 — "1H REAL-TIME": inactive. Color: #71717a.

   On chip click: active chip snaps to #f59e0b fill in 150ms.
   The timeline below re-renders its sparkline data to match the selected preset range.

6. BOTTOM-CENTER — Main Timeline Scrubber Capsule:
   Position: fixed, bottom: 16px, left: 50%, transform: translateX(-50%).
   Width: 864px (fixed, does not resize). Height: 64px.
   Background: #18181b solid. Border: 1px solid rgba(255,255,255,0.06).
   Border-radius: 16px. Padding: 0 16px.
   No shadow. No blur. Strict surface token.
   Internal layout: Flexbox row, align-items: center, gap: 16px.

   LEFT SECTION — Playback Controls (flex-shrink: 0):
   Width: 144px. Flex row, align-items: center, gap: 8px.

   a. Play/Pause Button:
      - Width: 32px, Height: 32px. Border-radius: 50%.
      - Background: #f59e0b (amber). No border.
      - Icon: filled triangle (play) or two vertical bars (pause), color: #0d0d0d, size: 12px.
      - Hover: background shifts to #fbbf24 (brighter amber) in 150ms.
      - Active press: scale(0.92) in 80ms, release spring-back.

   b. Step Back Button (⟨ 1H):
      - 28px × 28px. Background: transparent. Border: 1px solid rgba(255,255,255,0.08). Border-radius: 8px.
      - Icon: skip-back or rewind chevron, color: #71717a, size: 12px.
      - Hover: border color → rgba(255,255,255,0.20), icon color → #fafafa.

   c. Step Forward Button (1H ⟩):
      - Identical to Step Back. Icon: skip-forward or forward chevron.

   d. Speed Multiplier Pill:
      - Width: 40px. Height: 24px. Background: #27272a.
        Border: 1px solid rgba(255,255,255,0.06). Border-radius: 6px.
      - Text: "2×" in 11px Geist Mono, color: #fafafa, centered.
      - On click: cycles through 1×, 2×, 5×, 10×. Text updates in-place.

   CENTER SECTION — FRP Sparkline Track (flex: 1, min-width: 0):
   Height: 36px. Position: relative. Overflow: hidden.

   a. Histogram Bars:
      - 24 bars (one per hour, 00:00–23:00 UTC).
      - Bar width: equal-divided across the center section width, 2px gap between bars.
      - Bar heights are proportional to FRP intensity for that hour.
        Low-FRP hours (00:00–05:00 and 20:00–23:00): bar height 4–8px, color: #27272a.
        Peak agricultural hours (11:00–16:00): bar height 20–36px, color: #f59e0b.
        Moderate transition hours: bar height 10–18px, color: #52525b.
      - The anomalous 03:00 AM bar is color: #ef4444, height: 28px (unusually tall for that hour).
        A 4px × 4px filled red circle sits at the top of this bar — the anomaly pip.

   b. Playhead:
      - A 1px × 36px vertical line, color: #fafafa, positioned at the current playhead time offset.
      - At the top of the playhead: a 6px × 6px circle, color: #fafafa. Filled.
      - As playback runs, the playhead translates left-to-right across the sparkline at constant speed.
      - On drag: cursor snaps to nearest hour. The playhead jumps smoothly (200ms ease-out translate).

   c. Hover Behavior on Sparkline:
      - Hovering any bar column shows a floating micro-tooltip ABOVE the capsule:
        Background: #18181b. Border: 1px solid rgba(255,255,255,0.08). Rounded-lg. Padding: 6px 10px.
        Content: "14:00 UTC" in 10px Geist Mono, color: #71717a.
               + "FRP: 847 MW" in 11px Geist Mono bold, color: #fafafa.
        Appears with y: +4 → 0 translate, opacity 0 → 1, duration: 120ms ease-out.

   RIGHT SECTION — Live Timestamp Display (flex-shrink: 0, width: 168px, text-align: right):
   Line 1: Current timestamp — e.g., "14:20 UTC" in 15px Geist Mono bold, color: #fafafa.
   Line 2: Local equivalent — e.g., "19:50 IST" in 11px Geist Mono, color: #71717a.
   Line 3 (conditional, appears when playhead is near peak or anomaly hours):
     At peak agricultural hours → "PEAK STUBBLE FLUX" in 9px Space Grotesk uppercase, color: #f59e0b.
     At the 03:00 anomaly → "⚠ ANOMALY DETECTED" in 9px Space Grotesk uppercase, color: #ef4444.
     Otherwise: empty / hidden (display: none, no layout shift).

7. BOTTOM-LEFT CORNER — Credits Button (unchanged).

MOTION NOTES:
- Timeline capsule entrance: on page load, slides up from y: +12, opacity 0→1,
  duration: 280ms, ease: power2.out. Preset chips slide up 40ms after capsule.
- Play button: when transitioning play→pause, the icon morphs with a cross-fade in 100ms.
- Speed multiplier text: when cycling values, old text exits upward (y: -8, opacity: 0, 80ms),
  new text enters from below (y: +8 → 0, opacity: 0 → 1, 80ms). Staggered replace.
- Anomaly bar pip: perpetual pulse animation — scale 1 → 1.6 → 1, opacity 1 → 0.2 → 1,
  2.0s ease-in-out loop. Does NOT stop during playback.
- Map hexbins: as playhead advances, detections animate in with scale 0.6 → 1.0, opacity 0 → 1,
  100ms ease-out per hexbin. Burn-scar fade: opacity 1 → 0.25, color #f59e0b → #831843, 300ms.
- All dock/switcher interactions: 200ms color transitions. No layout shifts.
```

---

## 📑 Prompt 8: Executive Defense Brief & Multi-Format Intelligence Export

```text
A full-screen geospatial thermal intelligence dashboard with a centered command-dispatch modal open.
The modal is triggered from an "Export / Brief" action in the left dock. It represents the final
operational output layer — the interface a General or State Secretary would view.
All design tokens are strictly identical to the core dashboard. No new tokens, no glass, no blur.

DESIGN SYSTEM (REQUIRED — identical to core dashboard):
- Platform: Web, Desktop-first, 1440×900. Theme: Dark, zero-chrome.
- Background (map): Esri Dark Gray Canvas, full viewport. National hexbin mesh visible (dimmed to 40%
  opacity while modal is open, no blur applied — the map remains legible underneath).
- Surface: Solid #18181b. No glass, no blur. Border: 1px solid rgba(255,255,255,0.06). Radius: 16px.
- Text Primary: #fafafa. Text Secondary: #71717a. Accent: #f59e0b. Danger: #ef4444.
- Font Primary: Space Grotesk. Font Numbers: Geist Mono. No shadows. No gradients.
- MODAL OVERLAY: A full-viewport dim layer behind the modal.
  Background: rgba(0, 0, 0, 0.72). No blur. No color cast.

PAGE STRUCTURE:

1. BACKGROUND — Map at 40% opacity (all hexbins, docks, mode switcher remain rendered but dimmed).

2. CENTERED MODAL — Executive Defense Brief:
   Position: fixed, top: 50%, left: 50%, transform: translate(-50%, -50%).
   Width: 800px. Height: auto (max-height: 840px, overflow-y: auto, custom scrollbar).
   Background: #18181b. Border: 1px solid rgba(255,255,255,0.08). Border-radius: 16px. No shadow.

   MODAL HEADER:
   Padding: 24px 28px 16px 28px.
   Left: "NATIONAL THERMAL INTELLIGENCE SUMMARY" in 13px Space Grotesk uppercase,
     letter-spacing: 0.10em, color: #71717a.
   Below that: "Defense Briefing — NTRO Research Division · 2024 Annual Cycle" in 18px Space Grotesk
     Semibold, color: #fafafa.
   Right corner: a live status indicator pill:
     Background: rgba(34,197,94,0.10). Border: 1px solid rgba(34,197,94,0.25).
     Border-radius: 9999px. Padding: 4px 10px.
     Left: a 6px × 6px circle, background: #22c55e (green), with a CSS keyframe pulse animation
       (opacity 1 → 0.3 → 1, 1.8s ease-in-out loop).
     Text: "SECURE · DISPATCH READY" in 9px Space Grotesk uppercase, letter-spacing: 0.08em, color: #22c55e.
   Below header: a full-width 1px divider, color: #27272a.

   KPI CARD GRID (2×2):
   Padding: 20px 28px. Gap: 12px between all cards.
   Each card: Background: #1c1c1f. Border: 1px solid rgba(255,255,255,0.06).
     Border-radius: 12px. Padding: 16px 20px. Flex column.

   Card 1 — Total Anomalies:
     Top row: Globe icon (16px, color: #3b82f6) + "TOTAL DETECTIONS" in 9px Space Grotesk uppercase, #71717a.
     Value: "1,372,035" in 28px Geist Mono bold, color: #fafafa. Letter-spacing: -0.02em.
     Sub-row: "+ 12% MoM" in 10px Geist Mono, color: #22c55e (positive trend, green).
     Left accent: a 2px × 100% vertical strip on the left edge of the card, color: #3b82f6.

   Card 2 — Emergency Incidents:
     Top row: AlertTriangle icon (16px, color: #ef4444) + "ACCIDENTAL / EMERGENCY" in 9px uppercase, #71717a.
     Value: "1,666" in 28px Geist Mono bold, color: #ef4444 (danger — the ONLY value shown in red).
     Sub-row: "> 98% XGBoost Confidence" in 10px Geist Mono, color: #71717a.
     Left accent: 2px strip, color: #ef4444.

   Card 3 — Stubble Burning:
     Top row: Wind icon (16px, color: #f59e0b) + "AGRICULTURAL STUBBLE BURN" in 9px uppercase, #71717a.
     Value: "450k ha" in 28px Geist Mono bold, color: #fafafa.
     Sub-row: "Severe AQI Impact Index · Class V" in 10px Geist Mono, color: #71717a.
     Left accent: 2px strip, color: #f59e0b.

   Card 4 — Gas Flares:
     Top row: Factory icon (16px, color: #8b5cf6) + "PERSISTENT GAS FLARE EMITTERS" in 9px uppercase, #71717a.
     Value: "131,041" in 28px Geist Mono bold, color: #fafafa.
     Sub-row: "Verified facility signatures" in 10px Geist Mono, color: #71717a.
     Left accent: 2px strip, color: #8b5cf6.

   Hover state on each card: border color brightens to rgba(255,255,255,0.12) in 150ms.

   SECTION DIVIDER after KPIs:
   A full-width 1px line, color: #27272a.
   Label centered above line: "EXPORT & DISPATCH" in 9px Space Grotesk uppercase, #52525b,
     background: #18181b, padding: 0 12px (makes it appear inline with the divider line).

   EXPORT ACTION ROWS (3 rows, stacked vertically):
   Padding: 16px 28px. Gap: 8px between rows.
   Each row: Flexbox. Align-items: center. Height: 60px.
   Background: transparent (default). Border: 1px solid rgba(255,255,255,0.06). Border-radius: 10px.
   Padding: 12px 16px. Cursor: pointer.

   Row 1 — GeoJSON Export:
     Left: FileJson icon (20px, color: #71717a).
     Center text column:
       "Export Incident Telemetry (GeoJSON)" in 13px Space Grotesk Medium, color: #fafafa.
       "RFC 7946 format · coordinates, FRP, gas columns · GIS-ready" in 11px Space Grotesk, color: #71717a.
     Right: ChevronRight icon (16px, color: #52525b).
     Hover: background → rgba(255,255,255,0.03), border-color → rgba(255,255,255,0.12),
       right icon color → #fafafa. Transition: 150ms ease.

   Row 2 — PDF Export:
     Left: FileText icon (20px, color: #71717a).
     Center text column:
       "Download Defense Brief (PDF)" in 13px Space Grotesk Medium, color: #fafafa.
       "Multi-page · SHAP charts · high-res map captures · model audit trail" in 11px, #71717a.
     Right: ChevronRight icon (16px, color: #52525b). Identical hover state to Row 1.

   Row 3 — Emergency Webhook Dispatch (DANGER ACTION):
     Left: Siren/Radio icon (20px, color: #ef4444).
     Center text column:
       "Dispatch Emergency Webhook" in 13px Space Grotesk Medium, color: #ef4444.
       "Broadcast telemetry packet to SDMA · NDRF command centers — IRREVERSIBLE" in 11px, #71717a.
     Right: SendHorizontal icon (16px, color: #ef4444).
     Border: 1px solid rgba(239,68,68,0.20) (subtle danger border).
     Background: rgba(239,68,68,0.04).
     Hover: background → rgba(239,68,68,0.10), border-color → rgba(239,68,68,0.40).
     Transition: 150ms ease.

     ON CLICK — 3-Stage Framer Motion Sequence:
     Stage 1 (0–600ms): Row background transitions to rgba(239,68,68,0.12).
       The text "Dispatch Emergency Webhook" swaps to a loading state:
       A 16px Spinner (border: 2px solid rgba(239,68,68,0.3), border-top: 2px solid #ef4444)
       rotates at 1 spin/800ms. Label text: "TRANSMITTING..." in 11px Geist Mono, #ef4444.
     Stage 2 (600ms–1400ms): Spinner fades out (opacity 0, 200ms). 
     Stage 3 (1400ms+): A CheckCircle icon (20px, color: #22c55e) fades in.
       Label swaps to "PAYLOAD DELIVERED · SDMA ACKNOWLEDGED" in 11px Geist Mono, #22c55e.
       Row border transitions to rgba(34,197,94,0.25). Row is no longer clickable (pointer-events: none).

   MODAL FOOTER:
   Padding: 12px 28px 20px 28px. Flex row, justify-content: space-between, align-items: center.
   Left: "Generated: 2024-06-23 · 10:14 UTC · ThermalWatch AI v2.4.1" in 10px Geist Mono, color: #52525b.
   Right: "Close" text button — 12px Space Grotesk, color: #71717a.
     Hover: color → #fafafa in 150ms. No background, no border. Cursor: pointer.
     On click: modal exits with the CLOSE MOTION described below.

3. TOP-RIGHT — Mode Switcher Pill (rendered but dimmed to 40% opacity while modal is open).

4. LEFT DOCK & RIGHT DOCK (rendered and functional but dimmed to 40% opacity).

5. BOTTOM-LEFT — Credits Button (unchanged, dimmed to 40% opacity).

MOTION NOTES:
- Modal entrance: scale(0.96) → scale(1.0), opacity 0 → 1, duration: 220ms, ease: power2.out.
  Overlay behind modal: opacity 0 → 0.72, duration: 200ms.
- Modal exit (on Close): scale(1.0) → scale(0.96), opacity 1 → 0, duration: 180ms ease-in.
  Overlay: opacity 0.72 → 0, 180ms.
- KPI cards entrance (staggered, after modal opens): each card animates from
  y: +8 → 0, opacity 0 → 1, stagger: 40ms per card, starting 80ms after modal open.
- Export row hover: all transitions 150ms ease. No layout shifts.
- Dispatch button 3-stage sequence: described above. All state changes are Framer Motion layout transitions.
- Background hexbin mesh dim: opacity → 0.40 in 300ms ease when modal opens.
  Restores to 1.0 in 300ms ease when modal closes.
```

---

## 🛰️ Prompt 9: Dual-Mode Live Satellite Radar & Universal Date Playback HUD (Ground-Truth Stitch Specification)

Reference Visual Asset: `docs/stitch/flow_design_reference.png`

```text
A full-screen geospatial thermal intelligence defense dashboard for India, implementing a Dual-Mode Live Satellite Radar & Universal Date Scrubber HUD.
The map IS the product. All UI elements adhere to a strict, minimalist, zero-chrome technical aesthetic.
NO pulse animations anywhere. No glassmorphism or distracting blur. Solid tactical surface tokens only.

DESIGN SYSTEM TOKENS (MANDATORY — identical to core dashboard):
- Platform: Web, Desktop-first, 1440×900 and 1920×1080. Theme: Dark, zero-chrome.
- Background: Esri Dark Gray Canvas / Carto Dark Matter, full viewport.
- Surface: Solid #18181b. Border: 1px solid rgba(255, 255, 255, 0.08). Radius: 16px.
- Drawer Surface: Solid #141416. Border-left: 1px solid rgba(255, 255, 255, 0.08).
- Text Primary: #fafafa. Text Secondary: #71717a. Accent: #f59e0b (Amber). Critical: #ef4444 (Crimson).
- Font Primary: Space Grotesk (Labels, Titles, Buttons). Font Numbers: Geist Mono (Coordinates, FRP, Timestamps, Histograms).
- Animations: Subtle 150ms–200ms linear/ease transitions. ZERO pulse or looping animations.

PAGE STRUCTURE & EXACT ELEMENT SPECIFICATIONS:

1. TOP-LEFT UTILITY CLUSTER:
   - Position: fixed, top: 16px, left: 16px.
   - 3 square tactical buttons in a horizontal row, gap: 8px.
   - Button 1: Menu icon (36×36px, solid #18181b, border 1px solid rgba(255,255,255,0.08), radius 8px, icon color #71717a).
   - Button 2: Calendar icon (36×36px, identical styling, icon color #71717a).
   - Button 3: Bell icon (36×36px, identical styling, icon color #71717a).

2. TOP-CENTER NOTIFICATION TOAST:
   - Position: fixed, top: 16px, left: 50%, transform: translateX(-50%).
   - Layout: Horizontal capsule, min-width: 520px, height: 38px, radius: 9999px.
   - Background: solid #18181b. Border: 1px solid rgba(245, 158, 11, 0.35). Padding: 0 20px.
   - Text: "NASA VIIRS / INSAT-3DR PASS INGESTED · 18 HOTSPOTS CLASSIFIED"
     in 11px Space Grotesk uppercase, font-weight: 600, letter-spacing: 0.08em, color: #f59e0b.
   - Auto-dismisses after 4.5 seconds so map remains 100% clean.

3. LEFT TACTICAL DOCK (Fixed Live Radar Mode - 48px):
   - Position: fixed, left: 16px, top: 50%, transform: translateY(-50%).
   - Width: 48px. Height: 312px. Background: solid #18181b. Border: 1px solid rgba(255,255,255,0.08). Radius: 24px.
   - 6 tactical icon buttons, flex column, gap: 12px, padding: 14px 0:
     1. Slot 1: Crosshair / Reticle icon (18px, color #71717a).
     2. Slot 2: Radio / Telemetry beam icon (18px, color #71717a).
     3. Slot 3 (HERO LIVE RADAR TOGGLE):
        - Circular button 36×36px.
        - Active Live Mode state: Solid #f59e0b Amber background, icon: Satellite dish, 18px, color: #0d0d0d.
        - Archive Mode state: Transparent background, icon color: #71717a.
     4. Slot 4: Layers / Sensor grid icon (18px, color #71717a).
     5. Slot 5: Activity / Waveform icon (18px, color #71717a).
     6. Slot 6: Settings cog icon (18px, color #71717a).

4. BOTTOM-CENTER UNIVERSAL DIURNAL SCRUBBER (880px × 64px):
   - Position: fixed, bottom: 16px, left: 50%, transform: translateX(-50%).
   - Dimensions: width: 880px, height: 64px. Solid #18181b. Border: 1px solid rgba(255,255,255,0.08). Radius: 16px. Padding: 0 18px.
   - 3-Section Flexbox Row:
     LEFT SECTION (Width: 130px):
       - Play/Pause Button: 34×34px circle, background #27272a, border 1px solid rgba(255,255,255,0.12), amber #f59e0b play triangle.
       - Step Back & Step Forward buttons: 28×28px, color #71717a.
     CENTER SECTION (Width: 500px, Height: 44px):
       - 24 Diurnal Combustion Histogram Bars (00:00 to 23:00):
         - Baseline night hours (00h–09h): height 6–12px, color #27272a.
         - Peak daytime combustion hours (10h–17h): height 22–40px, solid #f59e0b Amber.
         - Evening decay hours (18h–23h): height 8–16px, color #3f3f46.
       - Playhead Needle: 1.5px solid #fafafa vertical line with 5×5px white top pip.
       - Axis Ticks: "0h" (start) and "24h" (end) in 9px Geist Mono, color #52525b.
     RIGHT SECTION (Width: 180px, right-aligned):
       - Line 1: "8:28 AM  East Mono" in 10px Geist Mono, color #a1a1aa.
       - Line 2: "3:33 AM  East Mono" in 10px Geist Mono, color #71717a.
       - Line 3: "11:38 TT Geist Mono" in 10px Geist Mono bold, color #f59e0b (Amber overpass indicator).
       - Line 4: "6:42 PT  Geist Mono" in 10px Geist Mono, color #52525b.

5. RIGHT INSPECTOR DRAWER (380px Width):
   - Position: fixed, right: 16px, top: 16px, bottom: 16px, width: 380px.
   - Background: solid #141416. Border: 1px solid rgba(255,255,255,0.08). Radius: 16px. Padding: 18px.
   - Header: "RIGHT INSPECTOR DRAWER" in 13px Space Grotesk bold, uppercase, color #fafafa + Close (X) button.
   - CARD 1 — AI Multi-Modal Stacking Verdicts:
     - Highlighted Pill: background rgba(245,158,11,0.12), border 1px solid rgba(245,158,11,0.35), text: "Multi-Modal Stacking" in 12px Space Grotesk bold (#f59e0b) with alert icon.
     - Telemetry list: 4 items with crimson dots (#ef4444) in 10px Geist Mono (#d4d4d8):
       - "• AI Multi-Class Score (5)"
       - "• Plume Dispersion (10)"
       - "• Environmental Dispersion (0)"
       - "• Live Radar Satellite (6)"
   - CARD 2 — Model Probability Breakdowns:
     - 3 labeled progress bars (height 4px, background #27272a):
       - "Default Reaction" · "96% / 40%" (fill: #ffffff white, 40%)
       - "Breadth Passing" · "30% / 50%" (fill: #f59e0b amber, 50%)
       - "Critical Fraction" · "45% / 0%" (fill: #ef4444 crimson, 45%)
   - CARD 3 — Model Probability Histogram Chart:
     - Y-Axis: "Probability" with ticks 0, 20, 40, 60, 80, 100 in 9px Geist Mono (#71717a).
     - X-Axis: 5 class probability bins 0.1, 0.2, 0.3, 0.4, 0.5.
     - 5 vertical bars: winning class (0.4) highlighted at 92% height in solid #f59e0b Amber.
   - CARD 4 — Environmental Plume Dispersion Cone:
     - Y-Axis: "Plume Dispersion (km)" with ticks 0, 50, 100, 150, 200, 250 in 9px Geist Mono.
     - X-Axis: 0, 20, 40, 60, 80 in 9px Geist Mono.
     - Zoned plume dispersion cone: Red #ef4444 core (0–20km), Orange #f97316 (20–45km), Yellow #fde047 (45–80km), ambient envelope #3f3f46, origin spark diamond at (65, 80).
```


