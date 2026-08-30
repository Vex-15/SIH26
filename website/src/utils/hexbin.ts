import keplerHexData from '../data/kepler_hexbins.json';

export interface KeplerMicroHexCell {
  lat: number;
  lon: number;
  count: number;
  meanBrightness: number;
  totalFrp: number;
  dominantClassId: number;
  dominantClassName: string;
}

const CLASS_NAMES = [
  'Wildfire',
  'Agricultural',
  'Industrial Persistent',
  'Gas Flare',
  'Accidental Fire'
];

/**
 * Loads the 59,501 fine-resolution Kepler micro-hexagons.
 */
export function loadKeplerMicroHexbins(): {
  cells: KeplerMicroHexCell[];
  totalPoints: number;
  radiusLat: number;
  radiusLon: number;
} {
  const raw = keplerHexData;
  const radiusLat = raw.radius_lat;
  const radiusLon = raw.radius_lon;

  const cells: KeplerMicroHexCell[] = raw.cells.map((c: any) => {
    const [lat, lon, count, meanBright, totalFrp, dominantClassId] = c;
    return {
      lat,
      lon,
      count,
      meanBrightness: meanBright,
      totalFrp,
      dominantClassId,
      dominantClassName: CLASS_NAMES[dominantClassId] || 'Thermal Source'
    };
  });

  return {
    cells,
    totalPoints: raw.total_points_aggregated,
    radiusLat,
    radiusLon
  };
}

/**
 * High-Contrast Kepler.gl Magma / Inferno Color Palette
 * [Dark Violet -> Crimson -> Flame Orange -> Vivid Amber -> Neon Yellow -> Pure Gold/White]
 */
export const KEPLER_COLOR_RAMP = [
  'rgba(43, 0, 59, 0.45)',    // Level 0: Deep Violet Background
  'rgba(74, 14, 78, 0.70)',    // Level 1: Dark Purple
  'rgba(123, 17, 58, 0.85)',   // Level 2: Crimson Plum
  'rgba(180, 20, 70, 0.90)',   // Level 3: Vivid Magenta
  'rgba(225, 29, 72, 0.92)',   // Level 4: Ruby Crimson
  'rgba(234, 88, 12, 0.95)',   // Level 5: Flame Orange
  'rgba(245, 158, 11, 0.98)',  // Level 6: Radiant Amber
  'rgba(250, 204, 21, 1.0)',   // Level 7: Neon Gold
  'rgba(254, 240, 138, 1.0)'   // Level 8: Peak White-Yellow
];

/**
 * Quantile-based color mapping matching the high-contrast Kepler.gl visualization.
 */
export function getKeplerMicroHexColor(
  cell: KeplerMicroHexCell,
  metric: 'brightness' | 'frp' | 'density' | 'class' = 'brightness'
): string {
  if (metric === 'class') {
    const classColors: Record<number, string> = {
      0: '#10b981', // Wildfire
      1: '#eab308', // Agricultural
      2: '#3b82f6', // Industrial Persistent
      3: '#8b5cf6', // Gas Flare
      4: '#ef4444'  // Accidental Fire
    };
    return classColors[cell.dominantClassId] || '#f59e0b';
  }

  if (metric === 'density') {
    const n = cell.count;
    if (n >= 150) return KEPLER_COLOR_RAMP[8];
    if (n >= 60) return KEPLER_COLOR_RAMP[7];
    if (n >= 25) return KEPLER_COLOR_RAMP[6];
    if (n >= 12) return KEPLER_COLOR_RAMP[5];
    if (n >= 6) return KEPLER_COLOR_RAMP[4];
    if (n >= 3) return KEPLER_COLOR_RAMP[3];
    if (n >= 2) return KEPLER_COLOR_RAMP[2];
    return KEPLER_COLOR_RAMP[1];
  }

  if (metric === 'frp') {
    const f = cell.totalFrp;
    if (f >= 150) return KEPLER_COLOR_RAMP[8];
    if (f >= 60) return KEPLER_COLOR_RAMP[7];
    if (f >= 25) return KEPLER_COLOR_RAMP[6];
    if (f >= 10) return KEPLER_COLOR_RAMP[5];
    if (f >= 5) return KEPLER_COLOR_RAMP[4];
    if (f >= 2) return KEPLER_COLOR_RAMP[3];
    if (f >= 1) return KEPLER_COLOR_RAMP[2];
    return KEPLER_COLOR_RAMP[1];
  }

  // Metric === 'brightness' (Kelvin quantiles)
  // Contrast curve emphasizing hot anomaly regions (Punjab, Refineries, Mining)
  const b = cell.meanBrightness;
  if (b >= 355) return KEPLER_COLOR_RAMP[8]; // Neon White/Yellow Peak
  if (b >= 346) return KEPLER_COLOR_RAMP[7]; // Neon Gold
  if (b >= 340) return KEPLER_COLOR_RAMP[6]; // Radiant Amber
  if (b >= 334) return KEPLER_COLOR_RAMP[5]; // Flame Orange
  if (b >= 328) return KEPLER_COLOR_RAMP[4]; // Ruby Crimson
  if (b >= 323) return KEPLER_COLOR_RAMP[3]; // Vivid Magenta
  if (b >= 319) return KEPLER_COLOR_RAMP[2]; // Crimson Plum
  if (b >= 315) return KEPLER_COLOR_RAMP[1]; // Dark Purple
  return KEPLER_COLOR_RAMP[0];               // Deep Violet
}
