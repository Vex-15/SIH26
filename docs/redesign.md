# ThermalWatch AI — UI/UX Redesign Implementation Plan
**For: Antigravity Development Team**
**Prepared by: Suresh**
**Date: 2026-08-30**
**Version: 1.0**

---

## The Core Problem (Read This First)

The current UI has a **navbar monopoly problem**: every control — live counter, target jumps, class filters, feed toggles — is crammed into a single top bar. This forces the map into a constrained box rather than letting it breathe as the primary surface.

**The kepler.gl principle this redesign follows:**
> The map owns 100% of the canvas. Every control is a floating overlay. Nothing is rendered below or above the map — only *on top of it*, minimally.

The redesign does not remove features. It redistributes every existing control across floating icon panels on both sides, matching how professional geospatial intelligence tools (kepler.gl, Palantir Gotham, Esri Operations Dashboard) are structured.

---

## Design Reference

**Primary reference:** kepler.gl 3.x (see Screenshot 2)
- Left sidebar: collapsed by default, expands on icon click
- Right side: floating icon strip for utilities
- Map: true full-bleed, no chrome above or below
- Status indicators: bottom-left floating badge only

**Color palette stays the same.** Do not change any of the existing class colors or the dark background. Only layout and chrome change.

---

## Layout Architecture (Before vs After)

### BEFORE (Current)
```
┌──────────────────────────────────────────────────────────┐
│ [LOGO] [LIVE 505] [Target Jumps ×5] [Class Filters ×6]  │  ← Packed navbar ~64px
│ [ALL] [15m NRT] [FIRMS]                                  │  ← Second row
├──────────────────────────────────────────────────────────┤
│                                                          │
│                      MAP                                 │
│                                                          │
│ [Legend: bottom-left]            [Zoom icons: right]     │
└──────────────────────────────────────────────────────────┘
```

### AFTER (Target)
```
┌──────────────────────────────────────────────────────────┐
│ [●] [TW]   ← 40px floating top-left only                 │  ← Minimal brand strip
│                                                          │
│                                                          │
│ [L]          FULL BLEED MAP (100vw × 100vh)         [R] │
│ [E]                                                 [I]  │
│ [F]                                                 [G]  │
│ [T]                                                 [H]  │
│                                                     [T]  │
│                                                          │
│ [Status Badge: bottom-left]          [Scale: bottom-right]│
└──────────────────────────────────────────────────────────┘
```

The navbar is **completely removed**. Every feature lives in one of four zones:
1. **Top-left:** Brand identity only (logo + app name + live badge)
2. **Left floating panel:** Primary mission controls
3. **Right floating icon strip:** Utility controls
4. **Bottom-left:** Status / legend badge

---

## Zone-by-Zone Specification

---

### Zone 1: Top-Left Brand Strip

**Position:** `fixed`, top: 16px, left: 16px  
**Size:** auto-width, ~40px tall  
**Style:** No background. Just the logo mark + wordmark + live badge inline.

```
[🔥] THERMALWATCH AI  ●LIVE (505)
     NTRO Geospatial Surveillance
```

**Implementation:**
```tsx
// TopBrand.tsx
<div className="fixed top-4 left-4 z-50 flex items-center gap-3 pointer-events-none">
  <FlameIcon className="w-8 h-8 text-orange-400" />
  <div>
    <div className="flex items-center gap-2">
      <span className="text-white font-bold text-sm tracking-wider">THERMALWATCH AI</span>
      <LiveBadge count={activeCount} />  {/* pulsing red dot + count */}
    </div>
    <span className="text-slate-400 text-xs">NTRO Geospatial Surveillance</span>
  </div>
</div>
```

**LiveBadge:** Small pill — `bg-red-500/20 border border-red-500 text-red-400 text-xs px-2 py-0.5 rounded-full` with a 2s pulse animation on the dot. That's it.

---

### Zone 2: Left Floating Panel (Primary Mission Controls)

**Position:** `fixed`, top: 50%, left: 16px, transform: translateY(-50%)  
**Style:** Vertical icon strip. Default state = icons only, 48px wide. Each icon expands a panel on click.

**The strip contains 4 icons, in this order top to bottom:**

```
┌────┐
│ 🎯 │  ← Target Jumps (replaces the 5 quick-jump buttons)
├────┤
│ 🏷 │  ← Class Filter (replaces the 6 class toggle buttons)
├────┤
│ 📡 │  ← Feed Source (replaces ALL / 15m NRT / FIRMS toggles)
├────┤
│ 🗺 │  ← Basemap Switcher (already existed on right side)
└────┘
```

**Strip container styles:**
```css
.left-panel-strip {
  position: fixed;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 8px;
}

.left-panel-strip button {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;   /* slate-400 default */
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.left-panel-strip button:hover,
.left-panel-strip button.active {
  background: rgba(255,255,255,0.08);
  color: #f8fafc;  /* white */
}

.left-panel-strip button.active {
  color: #f97316; /* orange accent when panel is open */
}
```

---

#### Left Panel — Icon 1: Target Jumps

**Icon:** Crosshair / Target SVG  
**Tooltip on hover:** `"Target Intelligence"`

**Expanded panel** (slides in from left, 280px wide):
```
┌─────────────────────────────┐
│  TARGET INTELLIGENCE     ✕  │
│  ─────────────────────────  │
│  ⚡ Hazira Petrochemical    │  ← click → fly to + open drawer
│     Gujarat · Accidental    │
│  ─────────────────────────  │
│  🔶 Jamnagar Refinery       │
│     Gujarat · Gas Flare     │
│  ─────────────────────────  │
│  🔶 Digboi Oil Field        │
│     Assam · Gas Flare       │
│  ─────────────────────────  │
│  🟢 Ludhiana                │
│     Punjab · Agricultural   │
│  ─────────────────────────  │
│  🌲 Uttarakhand Ridge       │
│     Uttarakhand · Wildfire  │
└─────────────────────────────┘
```

Each row: icon (colored by class) + facility name bold + location + class label muted. Full-width clickable row with hover highlight.

---

#### Left Panel — Icon 2: Class Filter

**Icon:** Layers / Filter SVG  
**Tooltip:** `"Filter by Class"`

**Expanded panel** (280px wide):
```
┌─────────────────────────────┐
│  FIRE CLASS FILTER       ✕  │
│  ─────────────────────────  │
│  [●] All Classes  505 pts   │  ← "All" toggle, count shown
│  ─────────────────────────  │
│  [●] Accidental Fire    23  │  ← colored toggle pill per class
│  [●] Industrial Pers.   87  │
│  [●] Gas Flare          12  │
│  [●] Agricultural      301  │
│  [●] Wildfire           82  │
└─────────────────────────────┘
```

Toggle pill style: when active, `bg-[classColor]/20 border border-[classColor] text-[classColor]`. When inactive, `bg-transparent border border-slate-700 text-slate-500`. Count number right-aligned.

---

#### Left Panel — Icon 3: Feed Source

**Icon:** Satellite dish SVG  
**Tooltip:** `"Satellite Feed Source"`

**Expanded panel:**
```
┌─────────────────────────────┐
│  SATELLITE FEED          ✕  │
│  ─────────────────────────  │
│  [●] All Sources            │
│  [⚡] 15m NRT               │
│       INSAT-3DR / Himawari  │
│  [✓] FIRMS Confirmed        │
│       NASA VIIRS / MODIS    │
└─────────────────────────────┘
```

Single-select radio group. Active state: full row highlighted with `bg-white/5 border-l-2 border-orange-400`.

---

#### Left Panel — Icon 4: Basemap

**Icon:** Map layers SVG  
**Tooltip:** `"Basemap Layer"`

**Expanded panel:**
```
┌─────────────────────────────┐
│  BASEMAP                 ✕  │
│  ─────────────────────────  │
│  [■] Esri Dark Canvas       │  ← thumbnail tiles (40×40px each)
│  [■] Esri Satellite         │
│  [■] OpenStreetMap          │
└─────────────────────────────┘
```

Each option has a small map thumbnail (static image), name, and active indicator.

---

### Zone 3: Right Floating Icon Strip (Utility Controls)

**Position:** `fixed`, top: 50%, right: 16px, transform: translateY(-50%)  
**Style:** Same as left strip — vertical pill container.

**Contains 4 icons:**

```
┌────┐
│ 🔍 │  ← Zoom In
├────┤
│ 🔍 │  ← Zoom Out
├────┤
│ 🧭 │  ← Reset North / Recenter India
├────┤
│ ℹ  │  ← About / System Info (model version, accuracy, team)
└────┘
```

Same strip container styles as left. These are action buttons (not expanding panels), except ℹ which opens a small floating card.

**Zoom and recenter** call the Leaflet map methods directly:
```ts
map.zoomIn();
map.zoomOut();
map.flyTo([22.5, 82.0], 5); // center of India
```

---

### Zone 4: Bottom-Left Status Badge

**Position:** `fixed`, bottom: 24px, left: 16px

Replaces the current bottom-left legend box. Keeps exactly the same information but in a tighter, single-line chip format:

```
[⚡ INSAT-3DR / H-9]  [✓ FIRMS Confirmed]  |  505 ACTIVE
●  Accidental  ●  Industrial  ●  Gas Flare  ●  Agricultural  ●  Wildfire
```

Two rows. Row 1: feed source tags + active count. Row 2: color legend dots. Total height ~52px.

```css
.status-badge {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 8px 12px;
  max-width: 420px;
}
```

---

## Panel Interaction Behavior

This is critical. Only **one left panel can be open at a time** (like kepler.gl's sidebar).

```ts
// Zustand store
interface UIStore {
  activeLeftPanel: 'targets' | 'filter' | 'feed' | 'basemap' | null;
  setActiveLeftPanel: (panel: UIStore['activeLeftPanel']) => void;
}

// Clicking the same icon again closes the panel
setActiveLeftPanel(panel === activeLeftPanel ? null : panel);
```

**Panel animation:**
```css
.left-expanded-panel {
  position: fixed;
  top: 50%;
  left: 72px;           /* right of the icon strip */
  transform: translateY(-50%);
  width: 280px;
  animation: slideInFromLeft 0.2s ease-out;
}

@keyframes slideInFromLeft {
  from { opacity: 0; transform: translateY(-50%) translateX(-12px); }
  to   { opacity: 1; transform: translateY(-50%) translateX(0); }
}
```

**Clicking the map** (i.e., not a control element) closes the open panel. Add a `map.on('click')` listener that calls `setActiveLeftPanel(null)`.

---

## Hotspot Detail Drawer (No Change Needed to Content)

The existing `HotspotDetailDrawer.tsx` content (multi-model confidence, SHAP, Z-score) is good. Only the positioning needs a small fix:

- **Position:** `fixed`, right: 72px (clears the right icon strip), top: 80px, bottom: 24px
- **Width:** 360px
- **Animation:** slides in from right, same easing as panels

```css
.hotspot-drawer {
  position: fixed;
  right: 72px;
  top: 80px;
  bottom: 24px;
  width: 360px;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  overflow-y: auto;
  animation: slideInFromRight 0.2s ease-out;
}
```

---

## SVG Icons Reference

Use **Lucide React** (already in the stack). Exact icons to use for each control:

| Control | Lucide Icon | Import |
|---|---|---|
| Target Jumps | `Crosshair` | `import { Crosshair } from 'lucide-react'` |
| Class Filter | `Layers` | `import { Layers } from 'lucide-react'` |
| Feed Source | `Satellite` | `import { Satellite } from 'lucide-react'` |
| Basemap | `Map` | `import { Map } from 'lucide-react'` |
| Zoom In | `ZoomIn` | `import { ZoomIn } from 'lucide-react'` |
| Zoom Out | `ZoomOut` | `import { ZoomOut } from 'lucide-react'` |
| Recenter | `Compass` | `import { Compass } from 'lucide-react'` |
| System Info | `Info` | `import { Info } from 'lucide-react'` |
| Close panel | `X` | `import { X } from 'lucide-react'` |

All icons: `size={16}` (16px), `strokeWidth={1.5}`.

---

## Tooltip Behavior

Every icon button on both strips gets a tooltip on hover. Use a custom minimal tooltip — do not use a library for this:

```tsx
// Tooltip appears to the RIGHT of left-strip icons, to the LEFT of right-strip icons
<div className="relative group">
  <button>
    <LayersIcon size={16} strokeWidth={1.5} />
  </button>
  <span className="
    absolute left-full ml-3 top-1/2 -translate-y-1/2
    px-2 py-1 text-xs text-white bg-slate-800 rounded-md
    whitespace-nowrap pointer-events-none
    opacity-0 group-hover:opacity-100 transition-opacity delay-300
  ">
    Filter by Class
  </span>
</div>
```

Tooltip delay: 300ms (using `transition-delay`). This prevents flickering when the mouse passes over buttons without intent.

---

## Component File Structure After Refactor

```
website/src/
├── components/
│   ├── map/
│   │   ├── ThreatMap.tsx           (no change to map logic)
│   │   └── HotspotDetailDrawer.tsx (positioning fix only)
│   ├── overlays/
│   │   ├── TopBrand.tsx            (NEW — logo + live badge)
│   │   ├── LeftPanelStrip.tsx      (NEW — icon strip + panel manager)
│   │   ├── RightIconStrip.tsx      (NEW — zoom/utility icons)
│   │   └── StatusBadge.tsx         (NEW — bottom-left legend)
│   └── panels/
│       ├── TargetJumpsPanel.tsx    (MOVED from Navbar)
│       ├── ClassFilterPanel.tsx    (MOVED from Navbar)
│       ├── FeedSourcePanel.tsx     (MOVED from Navbar)
│       └── BasemapPanel.tsx        (MOVED from right-side switcher)
├── store/
│   └── uiStore.ts                  (add activeLeftPanel state)
└── App.tsx                         (remove Navbar, add overlay components)
```

**The `Navbar.tsx` file is deleted entirely.**

---

## Execution Order for Antigravity

Complete these in sequence. Each step is independently testable.

**Step 1:** Delete `Navbar.tsx` and remove its import from `App.tsx`. The map should now go full-bleed. Confirm the map fills `100vw × 100vh`.

**Step 2:** Add `TopBrand.tsx` and `LiveBadge` component. Position fixed top-left. Confirm it floats over the map correctly.

**Step 3:** Add the `LeftPanelStrip.tsx` with all 4 icon buttons but no expanded panels yet. Add Zustand `activeLeftPanel` state. Add tooltips.

**Step 4:** Build and connect `TargetJumpsPanel.tsx`. Wire it to the crosshair icon. Confirm fly-to and drawer-open behavior.

**Step 5:** Build and connect `ClassFilterPanel.tsx`. Wire it to the layers icon. Confirm map filtering still works.

**Step 6:** Build and connect `FeedSourcePanel.tsx`. Wire it to the satellite icon. Confirm filter still works.

**Step 7:** Build and connect `BasemapPanel.tsx`. Wire it to the map icon. Confirm tile layer switching still works.

**Step 8:** Add `RightIconStrip.tsx` with zoom and recenter. Wire to Leaflet map instance via ref.

**Step 9:** Refactor `StatusBadge.tsx` to replace the existing bottom-left legend box.

**Step 10:** Fix `HotspotDetailDrawer.tsx` positioning so it doesn't overlap the right icon strip.

**Step 11:** Final QA — open each panel, confirm only one is open at a time, confirm clicking the map closes panels, confirm drawer and panels don't overlap.

---

## Rules for All Future Feature Additions

This section is the design system agreement. Every new feature added to ThermalWatch must follow these rules.

**Rule 1: The map never shrinks.**
No feature may push the map into a smaller container. All controls are overlays on top of the map. If a feature requires a dedicated view (e.g., a full analytics dashboard), it opens as a full-screen modal over the map, not beside it.

**Rule 2: New primary controls go in the left strip.**
If a new feature needs a persistent control (e.g., a temporal replay slider), it gets a new icon in the left strip and opens a panel. The left strip can hold up to 6 icons before it needs a separator or overflow treatment.

**Rule 3: New utility controls go in the right strip.**
If a new feature is a single-action utility (e.g., export GeoJSON, screenshot), it goes in the right strip as an icon button.

**Rule 4: Panels slide in from the left, drawers slide in from the right.**
Panels (triggered by left strip) come from the left. The hotspot detail drawer comes from the right. Nothing animates from top or bottom.

**Rule 5: No persistent text labels on controls.**
Icon + tooltip only. Text labels are inside expanded panels, not on the icon strip itself. This keeps the map chrome minimal.

**Rule 6: Background for any floating element must use:**
```css
background: rgba(15, 23, 42, 0.85);
backdrop-filter: blur(8px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 10px;  /* or 12px for panels */
```
Do not use solid backgrounds. Do not use white or light backgrounds. Do not use drop shadows (the border handles separation).

**Rule 7: Color is for data, not chrome.**
The only colored elements are the fire class indicators (red, amber, purple, green, emerald) and the live badge (red). All UI chrome — icons, borders, panel backgrounds, text — stays in the slate/neutral range. Accent orange (`#f97316`) is only used for active/selected icon state.

**Rule 8: Typography scale:**
- Panel titles: `text-xs font-semibold tracking-widest text-slate-400 uppercase`
- Row labels: `text-sm font-medium text-white`
- Muted secondary: `text-xs text-slate-500`
- Data values (FRP, Z-score, coords): `font-mono text-xs text-slate-300`

---

## What This Achieves

After this refactor, the map owns the full canvas — exactly like kepler.gl. Every feature that existed before still exists, just accessed through intentional floating controls instead of a packed navbar. The information density is identical; the visual clutter is eliminated because chrome is only visible when the analyst needs it.

The result reads as a purpose-built intelligence tool, not a web app with a navigation bar bolted on.

---

## Simplicity Rules (v1.1 Amendment — NASA/ESA Grammar)

A second pass, referenced against NASA.gov and ESA.int, added these rules. They **override any earlier example styling** and bind all future features.

1. **Silence by default.** The map is the only always-visible element. Everything else appears on intent (icon click, marker click, hover).
2. **One accent color.** Orange `#f97316` (`--accent`) marks active/selected/live state only. Cyan, indigo, purple, amber, and emerald are banned from chrome.
3. **Class colors are data, not decoration.** The five fire-class colors appear only on map markers and the single dot in the drawer header — never on borders, bars, icons, or text.
4. **Zero emoji.** Lucide icons only, used sparingly (chevrons, close, zoom, radio indicators).
5. **Two type voices.** Sans for labels, sentence case, max `text-sm`. Mono only for numbers. Max sizes: 11px (muted), 12px (labels), 14px (primary), 18px (drawer hero numbers).
6. **Progressive disclosure.** Dense intelligence (model probabilities, SHAP) lives behind collapsed accordions — one click away, never all on screen.
7. **No glow, no shadow.** Separation comes from the glass border, nothing else.
8. **Counts are quiet.** Numbers are right-aligned, muted, mono — never badges or pills.
9. **Detail on hover, not in print.** Secondary descriptions (feed constellations, model provenance) become `title` attributes or accordion content, not permanent rows.
