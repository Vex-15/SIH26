# 🔥 ThermalWatch AI — Dual-Mode Live Satellite Radar & Universal Date Playback HUD
### Master Stitch & UI Implementation Specification (1:1 Ground-Truth Match to Google Flow Reference)

Reference Asset: [`docs/stitch/flow_design_reference.png`](file:///Users/aadeshkhande/Documents/Professional/College/assignment_SAD/docs/stitch/flow_design_reference.png)

---

## 1. Design System Tokens (Mandatory — Zero-Chrome Technical Cockpit)

- **Platform:** Web, Desktop-first (1440×900 and 1920×1080).
- **Theme:** Dark defense-grade geospatial command center.
- **Basemap Canvas:** Pitch-black Dark Matter (`#0d0e11` / `#0f1013`), sovereign India boundary rendered with muted `#27272a` borders.
- **Surface Tokens:**
  - Standard Surface: Solid `#18181b` (no blur, no glassmorphism, no gradient wash).
  - Elevated Drawer Surface: Solid `#141416`.
  - Sub-Cards: Solid `#1c1c1f` with `1px solid rgba(255, 255, 255, 0.06)`.
- **Border Tokens:** `1px solid rgba(255, 255, 255, 0.08)` (Neutral); `1px solid rgba(245, 158, 11, 0.35)` (Active Amber).
- **Typography:**
  - Primary UI Font: `Space Grotesk`, sans-serif (Labels, Headers, Navigation, Tags).
  - Numerical & Data Font: `Geist Mono`, monospace (Coordinates, FRP, Timestamps, Histograms, Axes).
- **Color Palette:**
  - Primary Text: `#fafafa` (White)
  - Secondary Text: `#71717a` (Muted Zinc)
  - Active Accent: `#f59e0b` (Amber)
  - Alert / Anomaly: `#ef4444` (Crimson)
  - Baseline Gray: `#27272a`
- **Animation Rules:**
  - **ABSOLUTE PROHIBITION ON LOOPING/PULSING ANIMATIONS.**
  - All interactive states use `150ms ease-out` color and background shifts. No layout shifts.

---

## 2. Top-Left Utility Cluster

- **Position:** `fixed, top: 16px, left: 16px`.
- **Layout:** Horizontal flexbox row, `gap: 8px`, `z-index: 50`.
- **Components (3 square tactical buttons):**
  1. **Menu Button:**
     - Width: `36px`, Height: `36px`, Radius: `8px`.
     - Background: `#18181b`, Border: `1px solid rgba(255, 255, 255, 0.08)`.
     - Icon: `Menu` (Hamburger), size `16px`, color `#71717a`. Hover: color `#fafafa`.
  2. **Calendar Button:**
     - Width: `36px`, Height: `36px`, Radius: `8px`.
     - Background: `#18181b`, Border: `1px solid rgba(255, 255, 255, 0.08)`.
     - Icon: `Calendar`, size `16px`, color `#71717a`. Triggers the Calendar Date Picker Popover.
  3. **Alerts Bell Button:**
     - Width: `36px`, Height: `36px`, Radius: `8px`.
     - Background: `#18181b`, Border: `1px solid rgba(255, 255, 255, 0.08)`.
     - Icon: `Bell`, size `16px`, color `#71717a`. Triggers Emergency Anomaly History.

---

## 3. Top-Center Notification Toast ("TOP-CENTER NOTIFICATION TOAST")

- **Position:** `fixed, top: 16px, left: 50%, transform: translateX(-50%)`, `z-index: 60`.
- **Dimensions:** Width: `auto`, min-width `520px`, Height: `38px`.
- **Styling:**
  - Background: Solid `#18181b`.
  - Border: `1px solid rgba(245, 158, 11, 0.35)`.
  - Border-Radius: `9999px` (full pill).
  - Padding: `0 20px`.
  - Box-Shadow: `0 8px 24px rgba(0, 0, 0, 0.6)`.
- **Layout:** Flex row, `align-items: center`, `justify-content: center`, `gap: 10px`.
- **Content:**
  - Text: `"NASA VIIRS / INSAT-3DR PASS INGESTED · 18 HOTSPOTS CLASSIFIED"`
  - Typography: `Space Grotesk`, `11px`, font-weight `600`, uppercase, `letter-spacing: 0.08em`.
  - Color: `#f59e0b` (Amber).
- **Behavior:**
  - Appears on new pass ingestion or emergency event via a smooth slide-down (`y: -8 -> 0`, `opacity: 0 -> 1`, `180ms ease-out`).
  - Auto-dismisses after 4.5 seconds so the map remains completely clear and uncluttered.

---

## 4. Left Tactical Dock ("LEFT TACTICAL DOCK Fixed (Live Radar Mode) 48px")

- **Position:** `fixed, left: 16px, top: 50%, transform: translateY(-50%)`, `z-index: 40`.
- **Dimensions:** Width: `48px`, Height: `312px`.
- **Styling:**
  - Background: Solid `#18181b`.
  - Border: `1px solid rgba(255, 255, 255, 0.08)`.
  - Border-Radius: `24px`.
  - Padding: `14px 0`.
- **Layout:** Flexbox column, `align-items: center`, `justify-content: space-between`.
- **Buttons (6 tactical slots):**
  1. **Slot 1 (Target / Coordinates):** `Crosshair` icon, `18px`, color `#71717a`, hover `#fafafa`.
  2. **Slot 2 (Telemetry Beam):** `Radio` icon, `18px`, color `#71717a`, hover `#fafafa`.
  3. **Slot 3 (LIVE RADAR MODE TOGGLE - HERO ACTIVE):**
     - Width: `36px`, Height: `36px`, Radius: `50%`.
     - In Archive Mode: Transparent background, icon color `#71717a`.
     - In Live Mode (Active): **Solid `#f59e0b` Amber background**, `border: none`.
     - Icon: `Satellite` dish, size `18px`, **color `#0d0d0d`** (solid dark charcoal).
  4. **Slot 4 (Sensors / Layers):** `Layers` / grid icon, `18px`, color `#71717a`.
  5. **Slot 5 (Temporal Trends):** `Activity` / waveform icon, `18px`, color `#71717a`.
  6. **Slot 6 (Configuration):** `Settings` cog icon, `18px`, color `#71717a`.

---

## 5. Bottom-Center Universal Diurnal Scrubber ("BOTTOM-CENTER UNIVERSAL DIURNAL SCRUBBER 880px")

- **Position:** `fixed, bottom: 16px, left: 50%, transform: translateX(-50%)`, `z-index: 40`.
- **Dimensions:** Width: `880px` (fixed), Height: `64px` (fixed).
- **Styling:**
  - Background: Solid `#18181b`.
  - Border: `1px solid rgba(255, 255, 255, 0.08)`.
  - Border-Radius: `16px`.
  - Padding: `0 18px`.
- **Internal Layout:** 3-section horizontal flex row (`align-items: center`, `justify-content: space-between`).

### Left Section — Playback Controls (Width: 130px)
- Flex row, `align-items: center`, `gap: 8px`.
- **Play/Pause Button:**
  - Width: `34px`, Height: `34px`, Radius: `50%`.
  - Background: `#27272a`, Border: `1px solid rgba(255, 255, 255, 0.12)`.
  - Icon: Filled play triangle, color `#f59e0b` (Amber), size `12px`.
  - Hover: Background `#3f3f46`. Active: `scale(0.95)`.
- **Step Backward Button:**
  - Width: `28px`, Height: `28px`, Radius: `6px`.
  - Icon: `SkipBack`, size `13px`, color `#71717a`. Hover: color `#fafafa`.
- **Step Forward Button:**
  - Width: `28px`, Height: `28px`, Radius: `6px`.
  - Icon: `SkipForward`, size `13px`, color `#71717a`. Hover: color `#fafafa`.

### Center Section — 24-Hour Diurnal Histogram (Width: 500px, Height: 44px)
- Relative container, overflow hidden.
- **24 Diurnal Histogram Bars (00:00 to 23:00):**
  - Equal width distribution across 500px (`~18px` per bar with `2px` gap).
  - Low combustion night hours (00h to 09h): Height `6px` to `12px`, color `#27272a`.
  - Peak agricultural/industrial daytime hours (10h to 17h): Height `22px` to `40px`, **color `#f59e0b`** (solid Amber).
  - Evening decay hours (18h to 23h): Height `8px` to `16px`, color `#3f3f46`.
- **Playhead Needle:**
  - `1.5px` vertical line, color `#fafafa`, spanning full 44px height.
  - Top Needle Pip: `5px × 5px` solid white circle at top of playhead needle.
- **Axis Tick Labels:**
  - `0h`: Left-aligned in `9px Geist Mono`, color `#52525b`.
  - `24h`: Right-aligned in `9px Geist Mono`, color `#52525b`.

### Right Section — Multi-Timezone Telemetry Stack (Width: 180px)
- Flex column, right-aligned, `gap: 1px`.
- Line 1: `8:28 AM  East Mono` in `10px Geist Mono`, color `#a1a1aa`.
- Line 2: `3:33 AM  East Mono` in `10px Geist Mono`, color `#71717a`.
- Line 3: `11:38 TT Geist Mono` in `10px Geist Mono bold`, **color `#f59e0b`** (Amber active overpass indicator).
- Line 4: `6:42 PT  Geist Mono` in `10px Geist Mono`, color `#52525b`.

---

## 6. Right Inspector Drawer ("RIGHT INSPECTOR DRAWER 380px")

- **Position:** `fixed, right: 16px, top: 16px, bottom: 16px, width: 380px`, `z-index: 50`.
- **Dimensions:** Width: `380px`, Height: `calc(100vh - 32px)`.
- **Styling:**
  - Background: Solid `#141416`.
  - Border: `1px solid rgba(255, 255, 255, 0.08)`.
  - Border-Radius: `16px`.
  - Padding: `18px`.
  - Overflow-y: `auto`.
- **Header:**
  - Left: `"RIGHT INSPECTOR DRAWER"` in `13px Space Grotesk bold`, uppercase, `letter-spacing: 0.08em`, color `#fafafa`.
  - Right: Close button (`X`), size `16px`, color `#71717a`, hover `#fafafa`.

### Card 1: AI Multi-Modal Stacking Verdicts
- Container: Solid `#18181b`, border `1px solid rgba(255, 255, 255, 0.06)`, radius `12px`, padding `14px`.
- Sub-header: `"AI Multi-Modal Stacking Verdicts"` in `11px Space Grotesk`, color `#71717a`.
- **Highlighted Alert Pill:**
  - Background: `rgba(245, 158, 11, 0.12)`.
  - Border: `1px solid rgba(245, 158, 11, 0.35)`.
  - Radius: `8px`, padding `8px 12px`.
  - Icon: Amber alert triangle (`AlertCircle`), `14px`, color `#f59e0b`.
  - Text: `"Multi-Modal Stacking"` in `12px Space Grotesk bold`, color `#f59e0b`.
- **Telemetry Bullets List (margin-top: 10px, gap: 6px):**
  - Row 1: Crimson dot (`#ef4444`) + `"AI Multi-Class Score (5)"` in `10px Geist Mono`, color `#d4d4d8`.
  - Row 2: Crimson dot (`#ef4444`) + `"Plume Dispersion (10)"` in `10px Geist Mono`, color `#d4d4d8`.
  - Row 3: Crimson dot (`#ef4444`) + `"Environmental Dispersion (0)"` in `10px Geist Mono`, color `#d4d4d8`.
  - Row 4: Crimson dot (`#ef4444`) + `"Live Radar Satellite (6)"` in `10px Geist Mono`, color `#d4d4d8`.

### Card 2: Model Probability Breakdowns
- Container: Solid `#18181b`, border `1px solid rgba(255, 255, 255, 0.06)`, radius `12px`, padding `14px`.
- Sub-header: `"Model Probability Breakdowns"` in `11px Space Grotesk`, color `#71717a`.
- **Progress Bar 1 (Model 1 Tabular XGBoost):**
  - Row: `"Default Reaction"` (left) · `"96% / 40%"` (right) in `10px Geist Mono`, color `#fafafa`.
  - Track: Height `4px`, background `#27272a`, radius `2px`.
  - Fill: `40%` width, solid `#ffffff`.
- **Progress Bar 2 (Model 2 Diurnal 1D-CNN):**
  - Row: `"Breadth Passing"` (left) · `"30% / 50%"` (right) in `10px Geist Mono`, color `#fafafa`.
  - Track: Height `4px`, background `#27272a`, radius `2px`.
  - Fill: `50%` width, **solid `#f59e0b` (Amber)**.
- **Progress Bar 3 (Model 3 ResNet-18 Vision):**
  - Row: `"Critical Fraction"` (left) · `"45% / 0%"` (right) in `10px Geist Mono`, color `#fafafa`.
  - Track: Height `4px`, background `#27272a`, radius `2px`.
  - Fill: `45%` width, **solid `#ef4444` (Crimson)**.

### Card 3: Model Probability Distribution Histogram Chart
- Container: Solid `#18181b`, border `1px solid rgba(255, 255, 255, 0.06)`, radius `12px`, padding `14px`.
- Sub-header: `"Model Probability Breakdowns"` in `11px Space Grotesk`, color `#71717a`.
- **Bar Chart Canvas:**
  - Y-Axis: Vertical label `"Probability"`, tick marks `0, 20, 40, 60, 80, 100` in `9px Geist Mono`, color `#71717a`.
  - X-Axis: 5 class probability bins: `0.1`, `0.2`, `0.3`, `0.4`, `0.5` in `9px Geist Mono`, color `#71717a`.
  - Grid lines: Subtle horizontal dotted lines, color `rgba(255, 255, 255, 0.04)`.
  - Bars:
    - Bar 1 (`0.1`): Height `12%`, fill `#3f3f46`.
    - Bar 2 (`0.2`): Height `52%`, fill `#71717a`.
    - Bar 3 (`0.3`): Height `58%`, fill `#71717a`.
    - **Bar 4 (`0.4` - Winning Class):** Height `92%`, **solid `#f59e0b` (Amber)**.
    - Bar 5 (`0.5`): Height `8%`, fill `#ef4444` (Crimson).

### Card 4: Environmental Plume Dispersion Cone
- Container: Solid `#18181b`, border `1px solid rgba(255, 255, 255, 0.06)`, radius `12px`, padding `14px`.
- Sub-header: `"Environmental Plume Dispersion"` in `11px Space Grotesk`, color `#71717a`.
- **Plume Graph Canvas:**
  - Y-Axis: Vertical label `"Plume Dispersion (km)"`, tick marks `0, 50, 100, 150, 200, 250` in `9px Geist Mono`, color `#71717a`.
  - X-Axis: Horizontal tick marks `0, 20, 40, 60, 80` in `9px Geist Mono`, color `#71717a`.
  - **Plume Geometry:**
    - Downwind toxic plume dispersion cone radiating from source `(0, 50)` to `(80, 240)`.
    - Core hazard cone (0 to 20 km): `#ef4444` (Danger Red).
    - Secondary dispersion (20 to 45 km): `#f97316` (Orange).
    - Outer dispersion (45 to 80 km): `#fde047` (Warm Yellow).
    - Ambient envelope: Muted `#3f3f46`.
    - Source origin marker: Geometric white spark diamond at `(65, 80)`.
