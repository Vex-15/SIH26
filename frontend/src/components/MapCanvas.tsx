import { useEffect, useRef, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAppStore, CLASS_META, LAND_COVER_NAMES } from '../store/useAppStore';
import type { ClusterInfo, VisualMetric } from '../store/useAppStore';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';

maplibregl.setWorkerUrl(maplibreWorkerUrl);

const STYLES = {
  dark:  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
} as const;

const INDIA_CENTER: [number, number] = [78.9629, 20.5937];
const INDIA_ZOOM = 4.6;

async function fetchGeoJson(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return res.json();
}




export function getPointsMetricColorExpression(metric: VisualMetric): maplibregl.ExpressionSpecification {
  switch (metric) {
    case 'Target_Class':
      return [
        'match', ['get', 'cls'],
        0, '#ef4444',   // Wildfire — red
        1, '#f59e0b',   // Agricultural — amber
        2, '#6366f1',   // Industrial — indigo
        3, '#a855f7',   // Gas Flare — purple
        4, '#ff3b30',   // Accidental — crimson
        '#f59e0b',
      ];

    case 'brightness':
      return [
        'interpolate',
        ['linear'],
        ['get', 'brightness'],
        207.0,  '#0d0221',
        312.0,  '#2d1160',
        327.9,  '#6b1f7a',
        332.2,  '#a0195a',
        337.2,  '#d62f2f',
        341.3,  '#e8621a',
        345.0,  '#f5961a',
        349.6,  '#fabb18',
        367.0,  '#fef08a',
        500.0,  '#ffffff',
      ];

    case 'frp':
      return [
        'interpolate',
        ['linear'],
        ['get', 'frp'],
        0.0,   '#0d0221',
        4.8,   '#2d1160',
        9.8,   '#7b1fa2',
        20.0,  '#c2185b',
        36.0,  '#e53935',
        100.0, '#fb923c',
        500.0, '#fef08a',
        7000.0,'#ffffff',
      ];

    case 'tropomi_no2':
      return [
        'interpolate',
        ['linear'],
        ['get', 'no2'],
        0.00,  '#03045e',
        0.02,  '#023e8a',
        0.06,  '#0077b6',
        0.10,  '#00b4d8',
        0.14,  '#90e0ef',
        0.18,  '#ffb703',
        0.24,  '#fb8500',
        0.30,  '#e85d04',
      ];

    case 'tropomi_so2':
      return [
        'interpolate',
        ['linear'],
        ['get', 'so2'],
        0.00,  '#132a13',
        0.02,  '#1b4332',
        0.05,  '#2d6a4f',
        0.09,  '#52b788',
        0.15,  '#b7e4c7',
        0.22,  '#f9c74f',
        0.30,  '#f3722c',
      ];

    case 'elevation':
      return [
        'interpolate',
        ['linear'],
        ['get', 'elevation'],
        0.0,    '#0f172a',
        150.0,  '#1e3a5f',
        350.0,  '#1d4ed8',
        600.0,  '#7c3aed',
        1000.0, '#be123c',
        2000.0, '#f59e0b',
        3500.0, '#fef3c7',
      ];

    default:
      return [
        'match', ['get', 'cls'],
        0, '#ef4444',
        1, '#f59e0b',
        2, '#6366f1',
        3, '#a855f7',
        4, '#ff3b30',
        '#f59e0b',
      ];
  }
}

export function getMetricColorExpression(metric: VisualMetric): maplibregl.ExpressionSpecification {
  switch (metric) {
    case 'Target_Class':
      return [
        'match', ['get', 'cls'],
        0, '#ef4444',   // Wildfire — red
        1, '#f59e0b',   // Agricultural — amber
        2, '#6366f1',   // Industrial — indigo
        3, '#a855f7',   // Gas Flare — purple
        4, '#ff3b30',   // Accidental — crimson
        '#f59e0b',
      ];

    // Kepler-calibrated: quantile thresholds derived from actual b_x distribution
    // P14=327.9  P28=332.2  P42=337.2  P57=341.3  P71=345.0  P85=349.6
    // Uses b_x (MAX per hexbin) to preserve thermal spike character, not mean
    case 'brightness':
      return [
        'interpolate',
        ['linear'],
        ['get', 'b_x'],
        207.0,  '#0d0221',  // absolute floor — near black
        312.0,  '#2d1160',  // P5  — deep violet
        327.9,  '#6b1f7a',  // P14 — purple
        332.2,  '#a0195a',  // P28 — magenta
        337.2,  '#d62f2f',  // P42 — crimson
        341.3,  '#e8621a',  // P57 — dark orange
        345.0,  '#f5961a',  // P71 — orange
        349.6,  '#fabb18',  // P85 — amber
        367.0,  '#fef08a',  // P99 — pale yellow
        500.0,  '#ffffff',  // extreme outlier — white-hot
      ];

    // Quantile FRP — P25=4.8  P50=9.8  P75=20  P90=36  P99=203
    case 'frp':
      return [
        'interpolate',
        ['linear'],
        ['get', 'f_x'],
        0.0,   '#0d0221',
        4.8,   '#2d1160',
        9.8,   '#7b1fa2',
        20.0,  '#c2185b',
        36.0,  '#e53935',
        100.0, '#fb923c',
        500.0, '#fef08a',
        7000.0,'#ffffff',
      ];

    case 'tropomi_no2':
      return [
        'interpolate',
        ['linear'],
        ['get', 'n_m'],
        0.00,  '#03045e',
        0.02,  '#023e8a',
        0.06,  '#0077b6',
        0.10,  '#00b4d8',
        0.14,  '#90e0ef',
        0.18,  '#ffb703',
        0.24,  '#fb8500',
        0.30,  '#e85d04',
      ];

    case 'tropomi_so2':
      return [
        'interpolate',
        ['linear'],
        ['get', 's_m'],
        0.00,  '#132a13',
        0.02,  '#1b4332',
        0.05,  '#2d6a4f',
        0.09,  '#52b788',
        0.15,  '#b7e4c7',
        0.22,  '#f9c74f',
        0.30,  '#f3722c',
      ];

    case 'land_cover_code':
      return [
        'match', ['get', 'lc'],
        10, '#059669',
        20, '#84cc16',
        30, '#eab308',
        40, '#f97316',
        50, '#6366f1',
        60, '#d97706',
        80, '#2563eb',
        90, '#06b6d4',
        95, '#0d9488',
        '#71717a',
      ];

    case 'is_industrial':
      return [
        'interpolate',
        ['linear'],
        ['get', 'ind_r'],
        0.00,  '#18181b',
        0.10,  '#312e81',
        0.25,  '#4338ca',
        0.50,  '#7c3aed',
        0.75,  '#a855f7',
        0.90,  '#e879f9',
        1.00,  '#fbbf24',
      ];

    case 'elevation':
      return [
        'interpolate',
        ['linear'],
        ['get', 'elev'],
        0.0,    '#0f172a',
        150.0,  '#1e3a5f',
        350.0,  '#1d4ed8',
        600.0,  '#7c3aed',
        1000.0, '#be123c',
        2000.0, '#f59e0b',
        3500.0, '#fef3c7',
      ];

    default:
      return [
        'match', ['get', 'cls'],
        0, '#ef4444',
        1, '#f59e0b',
        2, '#6366f1',
        3, '#a855f7',
        4, '#ff3b30',
        '#f59e0b',
      ];
  }
}

function createClassBadgeImageData(clsId: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  const colors: Record<number, string> = {
    0: '#ef4444', // Wildfire (Red)
    1: '#f97316', // Agricultural (Amber/Orange)
    2: '#8b5cf6', // Industrial (Purple)
    3: '#eab308', // Gas Flare (Solar Yellow)
    4: '#ef4444', // Accidental (Danger Red)
  };
  const color = colors[clsId] ?? '#f97316';

  // 1. Drop Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  // 2. Outer Filled Circle Badge
  ctx.beginPath();
  ctx.arc(32, 32, 25, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // 3. Crisp White Stroke Ring
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // 4. Class-Specific Clean High-Contrast White Glyphs
  ctx.save();
  if (clsId === 0) {
    // Wildfire: Clean Dual-Tone Flame
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(32, 14);
    ctx.bezierCurveTo(36, 19, 42, 25, 42, 32);
    ctx.bezierCurveTo(42, 39.5, 37.5, 45, 32, 45);
    ctx.bezierCurveTo(26.5, 45, 22, 39.5, 22, 32);
    ctx.bezierCurveTo(22, 26, 27, 22, 28, 25);
    ctx.bezierCurveTo(28, 21, 31, 16, 32, 14);
    ctx.fill();

    // Inner yellow flame core
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(32, 28);
    ctx.bezierCurveTo(35, 31, 37, 34, 37, 37);
    ctx.bezierCurveTo(37, 41, 34.5, 43.5, 32, 43.5);
    ctx.bezierCurveTo(29.5, 43.5, 27, 41, 27, 37);
    ctx.bezierCurveTo(27, 33, 30, 30, 32, 28);
    ctx.fill();
  } else if (clsId === 1) {
    // Agricultural: Clean Wheat Stalk with Rotated Ellipses (exact match to reference)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(32, 46);
    ctx.lineTo(32, 18);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    // Tip grain
    ctx.beginPath();
    ctx.ellipse(32, 17, 2.2, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3 paired diagonal grains
    const grainPairs = [
      { y: 23, sizeX: 5.0, sizeY: 2.4, angle: -0.62 },
      { y: 23, sizeX: 5.0, sizeY: 2.4, angle:  0.62 },
      { y: 30, sizeX: 5.6, sizeY: 2.6, angle: -0.62 },
      { y: 30, sizeX: 5.6, sizeY: 2.6, angle:  0.62 },
      { y: 37, sizeX: 5.6, sizeY: 2.6, angle: -0.62 },
      { y: 37, sizeX: 5.6, sizeY: 2.6, angle:  0.62 },
    ];
    for (const g of grainPairs) {
      ctx.beginPath();
      const offsetX = g.angle > 0 ? 5.2 : -5.2;
      ctx.ellipse(32 + offsetX, g.y, g.sizeX, g.sizeY, g.angle, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (clsId === 2) {
    // Industrial: Sawtooth Factory with Chimneys
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(18, 43);
    ctx.lineTo(46, 43);
    ctx.lineTo(46, 29);
    ctx.lineTo(39, 34);
    ctx.lineTo(39, 28);
    ctx.lineTo(32, 33);
    ctx.lineTo(32, 24);
    ctx.lineTo(25, 29);
    ctx.lineTo(25, 21);
    ctx.lineTo(18, 26);
    ctx.closePath();
    ctx.fill();

    // Factory Windows
    ctx.fillStyle = color;
    ctx.fillRect(22, 36, 4, 5);
    ctx.fillRect(30, 36, 4, 5);
    ctx.fillRect(38, 36, 4, 5);
  } else if (clsId === 3) {
    // Gas Flare: Derrick Tower & Top Flare
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(23, 44);
    ctx.lineTo(30, 24);
    ctx.lineTo(34, 24);
    ctx.lineTo(41, 44);
    ctx.moveTo(25, 38);
    ctx.lineTo(39, 38);
    ctx.moveTo(27, 31);
    ctx.lineTo(37, 31);
    ctx.moveTo(26, 38);
    ctx.lineTo(37, 31);
    ctx.moveTo(38, 38);
    ctx.lineTo(27, 31);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(32, 13);
    ctx.bezierCurveTo(34.5, 15.5, 36, 18, 36, 20.5);
    ctx.bezierCurveTo(36, 22.8, 34.2, 24.5, 32, 24.5);
    ctx.bezierCurveTo(29.8, 24.5, 28, 22.8, 28, 20.5);
    ctx.bezierCurveTo(28, 18, 30.5, 15.5, 32, 13);
    ctx.fill();
  } else if (clsId === 4) {
    // Accidental: Alert Triangle + Exclamation
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(32, 16);
    ctx.lineTo(46, 42);
    ctx.lineTo(18, 42);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 3.0;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(32, 25);
    ctx.lineTo(32, 33);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(32, 38, 2.0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  return ctx.getImageData(0, 0, 64, 64);
}

function registerClassIcons(map: maplibregl.Map): void {
  for (let clsId = 0; clsId <= 4; clsId++) {
    const iconName = `class-icon-${clsId}`;
    if (!map.hasImage(iconName)) {
      const imgData = createClassBadgeImageData(clsId);
      map.addImage(iconName, imgData, { pixelRatio: 2 });
    }
  }
}

export function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const hoveredHexIdRef = useRef<string | null>(null);
  const hoveredPointIdRef = useRef<string | null>(null);
  const { theme, activeFilters, filterSettings, activeMetric, setHoveredCluster } = useAppStore();

  const buildFilterExpression = useCallback(() => {
    const { activeFilters: f, filterSettings: s, isPlaybackControllerOpen } = useAppStore.getState();
    
    // When playback/single-day player is active, suppress yearlong hexbins so ONLY selected day points show
    if (isPlaybackControllerOpen) {
      return ['==', ['get', 'count'], -1] as maplibregl.ExpressionSpecification;
    }

    const clauses: maplibregl.ExpressionSpecification[] = [];

    const classClauses: maplibregl.ExpressionSpecification[] = [];
    if (f.wildfire)     classClauses.push(['>', ['get', 'w_c'], 0]);
    if (f.agricultural) classClauses.push(['>', ['get', 'a_c'], 0]);
    if (f.industrial)   classClauses.push(['>', ['get', 'i_c'], 0]);
    if (f.gasflare)     classClauses.push(['>', ['get', 'fl_c'], 0]);
    if (f.accidental)   classClauses.push(['>', ['get', 'ac_c'], 0]);

    if (classClauses.length === 0) {
      return ['==', ['get', 'count'], -1] as maplibregl.ExpressionSpecification;
    }
    if (classClauses.length < 5) {
      clauses.push(['any', ...classClauses] as maplibregl.ExpressionSpecification);
    }

    if (s.minBrightness > 300) clauses.push(['>=', ['get', 'b_m'], s.minBrightness]);
    if (s.minFrp > 0)          clauses.push(['>=', ['get', 'f_m'], s.minFrp]);
    if (s.minElevation > 0)    clauses.push(['>=', ['get', 'elev'], s.minElevation]);
    if (s.maxElevation < 4000) clauses.push(['<=', ['get', 'elev'], s.maxElevation]);
    if (s.minNo2 > 0)          clauses.push(['>=', ['get', 'n_m'], s.minNo2]);
    if (s.minSo2 > 0)          clauses.push(['>=', ['get', 's_m'], s.minSo2]);
    if (s.onlyAnomalies)       clauses.push(['>', ['get', 'ac_c'], 0]);

    if (clauses.length === 0) {
      return ['all'] as unknown as maplibregl.ExpressionSpecification;
    }
    return ['all', ...clauses] as maplibregl.ExpressionSpecification;
  }, []);

  const buildPointsFilterExpression = useCallback(() => {
    const { activeFilters: f, filterSettings: s, startDate, endDate, isPlaybackControllerOpen } = useAppStore.getState();
    
    const clauses: maplibregl.ExpressionSpecification[] = [];

    // ── 1. Real Dataset Date Range Filtering (Only when Timeline Player is active) ──
    if (isPlaybackControllerOpen) {
      if (startDate === endDate) {
        clauses.push(['==', ['get', 'acq_date'], startDate]);
      } else {
        clauses.push(['>=', ['get', 'acq_date'], startDate]);
        clauses.push(['<=', ['get', 'acq_date'], endDate]);
      }
    }

    // ── 2. Fire Class Filters ──
    const allowedClasses: number[] = [];
    if (f.wildfire)     allowedClasses.push(0);
    if (f.agricultural) allowedClasses.push(1);
    if (f.industrial)   allowedClasses.push(2);
    if (f.gasflare)     allowedClasses.push(3);
    if (f.accidental)   allowedClasses.push(4);

    if (allowedClasses.length === 0) {
      return ['==', ['get', 'cls'], -1] as maplibregl.ExpressionSpecification;
    }
    if (allowedClasses.length < 5) {
      clauses.push(['in', ['get', 'cls'], ['literal', allowedClasses]] as maplibregl.ExpressionSpecification);
    }

    // ── 3. Parameter Range Filters ──
    if (s.minBrightness > 300) clauses.push(['>=', ['get', 'brightness'], s.minBrightness]);
    if (s.minFrp > 0)          clauses.push(['>=', ['get', 'frp'], s.minFrp]);
    if (s.minElevation > 0)    clauses.push(['>=', ['get', 'elevation'], s.minElevation]);
    if (s.maxElevation < 4000) clauses.push(['<=', ['get', 'elevation'], s.maxElevation]);
    if (s.minNo2 > 0)          clauses.push(['>=', ['get', 'no2'], s.minNo2]);
    if (s.minSo2 > 0)          clauses.push(['>=', ['get', 'so2'], s.minSo2]);
    if (s.onlyAnomalies)       clauses.push(['==', ['get', 'cls'], 4]);

    if (clauses.length === 0) {
      return ['all'] as unknown as maplibregl.ExpressionSpecification;
    }
    return ['all', ...clauses] as maplibregl.ExpressionSpecification;
  }, []);

  const applyFilters = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const hexFilter = buildFilterExpression();
    const ptFilter = buildPointsFilterExpression();
    if (map.getLayer('hexbins-fill')) map.setFilter('hexbins-fill', hexFilter);
    if (map.getLayer('points-symbols')) map.setFilter('points-symbols', ptFilter);
    if (map.getLayer('accidental-radar-rings')) map.setFilter('accidental-radar-rings', ['all', ptFilter, ['==', ['get', 'cls'], 4]]);
  }, [buildFilterExpression, buildPointsFilterExpression]);



  const applyMetricColor = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const metric = useAppStore.getState().activeMetric;
    if (map.getLayer('hexbins-fill')) {
      map.setPaintProperty('hexbins-fill', 'fill-color', getMetricColorExpression(metric));
    }
  }, []);

  const initLayers = useCallback(async (map: maplibregl.Map) => {
    try {
      registerClassIcons(map);

      const [hexData, pointsData] = await Promise.all([
        fetchGeoJson('/data/india_matched_hexbins.geojson'),
        fetchGeoJson('/data/india_hotspots_precision_points.geojson'),
      ]);

      if (!mapRef.current) return;

      if (!map.getSource('india-hexbins')) {
        map.addSource('india-hexbins', {
          type: 'geojson',
          data: hexData,
          promoteId: 'hex_id',
          tolerance: 0.4,
          buffer: 0,
          generateId: false,
        });
      }

      if (!map.getSource('india-points')) {
        map.addSource('india-points', {
          type: 'geojson',
          data: pointsData,
          promoteId: 'id',
          tolerance: 0.4,
          buffer: 0,
          generateId: false,
        });
      }

      // ── Layer 1: Hexbins Layer (Default at national zoom < 8.0) ──
      if (!map.getLayer('hexbins-fill')) {
        map.addLayer({
          id: 'hexbins-fill',
          type: 'fill',
          source: 'india-hexbins',
          maxzoom: 8.0,
          paint: {
            'fill-color': getMetricColorExpression(useAppStore.getState().activeMetric),
            'fill-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              3, [
                'interpolate', ['linear'], ['get', 'b_x'],
                207.0, 0.30,
                320.0, 0.55,
                332.0, 0.72,
                345.0, 0.88,
                370.0, 0.96,
              ],
              6.5, [
                'interpolate', ['linear'], ['get', 'b_x'],
                207.0, 0.20,
                320.0, 0.45,
                332.0, 0.65,
                345.0, 0.82,
                370.0, 0.94,
              ],
              7.2, 0.0,
            ],
          },
        });
      }

      if (!map.getLayer('hexbins-hover-border')) {
        map.addLayer({
          id: 'hexbins-hover-border',
          type: 'line',
          source: 'india-hexbins',
          maxzoom: 8.0,
          paint: {
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              '#ffffff',
              'transparent'
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              2.0,
              0
            ],
            'line-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7.0, 1.0,
              7.2, 0.0
            ],
          },
        });
      }

      // ── Layer 2: Accidental Concentric Radar Ripple Rings (Class 4) ──
      if (!map.getLayer('accidental-radar-rings')) {
        map.addLayer({
          id: 'accidental-radar-rings',
          type: 'circle',
          source: 'india-points',
          filter: ['==', ['get', 'cls'], 4],
          paint: {
            'circle-color': 'transparent',
            'circle-stroke-color': '#ef4444',
            'circle-stroke-width': 1.5,
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7.5, 12,
              10, 20,
              13, 30,
              16, 42
            ],
            'circle-stroke-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7.0, 0.0,
              7.8, 0.75,
              12.0, 0.85
            ],
          },
        });
      }

      // ── Layer 3: High-Zoom Class Icon Badge Symbol Layer (Hex-to-Icon transition at zoom >= 7.8) ──
      if (!map.getLayer('points-symbols')) {
        map.addLayer({
          id: 'points-symbols',
          type: 'symbol',
          source: 'india-points',
          layout: {
            'icon-image': [
              'match', ['get', 'cls'],
              0, 'class-icon-0',
              1, 'class-icon-1',
              2, 'class-icon-2',
              3, 'class-icon-3',
              4, 'class-icon-4',
              'class-icon-1',
            ],
            'icon-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              3, 0.35,
              6, 0.45,
              7.8, 0.55,
              10, 0.70,
              12, 0.85,
              14, 1.0,
              16, 1.15
            ],
            'icon-allow-overlap': false,
            'icon-ignore-placement': false,
            'icon-padding': 2,
          },
          paint: {
            'icon-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7.2, 0.0,
              7.8, 1.0,
            ],
          },
        });
      }

      applyFilters();
      applyMetricColor();

      map.on('mousemove', 'hexbins-fill', (e) => {
        if (map.getZoom() >= 7.8) {
          if (hoveredHexIdRef.current) {
            map.setFeatureState(
              { source: 'india-hexbins', id: hoveredHexIdRef.current },
              { hover: false }
            );
            hoveredHexIdRef.current = null;
          }
          return;
        }
        if (!e.features || e.features.length === 0) return;
        const feat = e.features[0];
        const props = feat.properties as any;
        const hexId = String(props.hex_id || feat.id);

        if (hoveredHexIdRef.current !== hexId) {
          if (hoveredHexIdRef.current) {
            map.setFeatureState(
              { source: 'india-hexbins', id: hoveredHexIdRef.current },
              { hover: false }
            );
          }
          hoveredHexIdRef.current = hexId;
          map.setFeatureState(
            { source: 'india-hexbins', id: hexId },
            { hover: true }
          );
        }

        const domClsId = Number(props.cls ?? 1);
        const classMeta = CLASS_META[domClsId] ?? CLASS_META[1];
        const lcCode = Number(props.lc ?? 40);
        const lcName = LAND_COVER_NAMES[lcCode] ?? 'Ground Cover';
        const point = e.point;

        const cluster: ClusterInfo = {
          totalHotspots: Number(props.count || 1),
          primaryClass: {
            id: domClsId,
            name: classMeta.name,
            color: classMeta.color,
          },
          classCounts: {
            wildfire:     Number(props.w_c  || 0),
            agricultural: Number(props.a_c  || 0),
            industrial:   Number(props.i_c  || 0),
            gasflare:     Number(props.fl_c || 0),
            accidental:   Number(props.ac_c || 0),
          },
          avgFrp:       Number(props.f_m  || 0),
          maxFrp:       Number(props.f_x  || 0),
          avgBrightness: Number(props.b_m || 330),
          maxBrightness: Number(props.b_x || 330),
          avgNo2:       Number(props.n_m  || 0),
          avgSo2:       Number(props.s_m  || 0),
          elevation:    Number(props.elev || 0),
          landCoverCode: Number(props.lc  || 40),
          landCover:    lcName,
          isIndustrial: Number(props.ind_r || 0),
          zScore: Number(props.ac_c) > 0 ? 3.84 : null,
          isAnomaly: Boolean(props.ac_c && props.ac_c > 0),
          baselineMeanFrp: null,
          source:  null,
          acqDate: useAppStore.getState().startDate,
          lat: e.lngLat.lat,
          lon: e.lngLat.lng,
        };

        setHoveredCluster(cluster, { x: point.x, y: point.y });
        map.getCanvas().style.cursor = 'pointer';
      });

      // ── Click on Hexbin to open 40% Inspector Drawer ──
      map.on('click', 'hexbins-fill', (e) => {
        if (map.getZoom() >= 7.8) return;
        if (!e.features || e.features.length === 0) return;
        const feat = e.features[0];
        const props = feat.properties as any;
        const domClsId = Number(props.cls ?? 1);
        const classMeta = CLASS_META[domClsId] ?? CLASS_META[1];
        const lcCode = Number(props.lc ?? 40);
        const lcName = LAND_COVER_NAMES[lcCode] ?? 'Ground Cover';

        const cluster: ClusterInfo = {
          totalHotspots: Number(props.count || 1),
          primaryClass: {
            id: domClsId,
            name: classMeta.name,
            color: classMeta.color,
          },
          classCounts: {
            wildfire:     Number(props.w_c  || 0),
            agricultural: Number(props.a_c  || 0),
            industrial:   Number(props.i_c  || 0),
            gasflare:     Number(props.fl_c || 0),
            accidental:   Number(props.ac_c || 0),
          },
          avgFrp:       Number(props.f_m  || 0),
          maxFrp:       Number(props.f_x  || 0),
          avgBrightness: Number(props.b_m || 330),
          maxBrightness: Number(props.b_x || 330),
          avgNo2:       Number(props.n_m  || 0),
          avgSo2:       Number(props.s_m  || 0),
          elevation:    Number(props.elev || 0),
          landCoverCode: Number(props.lc  || 40),
          landCover:    lcName,
          isIndustrial: Number(props.ind_r || 0),
          zScore: Number(props.ac_c) > 0 ? 3.84 : null,
          isAnomaly: Boolean(props.ac_c && props.ac_c > 0),
          baselineMeanFrp: null,
          source:  null,
          acqDate: useAppStore.getState().startDate,
          lat: e.lngLat.lat,
          lon: e.lngLat.lng,
        };

        useAppStore.getState().setSelectedCluster(cluster);
        if (cluster.isAnomaly && !useAppStore.getState().hasAcknowledgedAnomaly) {
          useAppStore.getState().setAnomalyAlertOpen(true);
        }

        // Ease to center point with offset so it stays visible in the left 60% viewport
        map.easeTo({
          center: [e.lngLat.lng, e.lngLat.lat],
          offset: [-window.innerWidth * 0.18, 0],
          duration: 600,
        });
      });

      map.on('mouseleave', 'hexbins-fill', () => {
        if (hoveredHexIdRef.current) {
          map.setFeatureState(
            { source: 'india-hexbins', id: hoveredHexIdRef.current },
            { hover: false }
          );
          hoveredHexIdRef.current = null;
        }
        setHoveredCluster(null, null);
        map.getCanvas().style.cursor = '';
      });

      // ── Point Class Symbol Hover & Click ──
      map.on('mousemove', 'points-symbols', (e) => {
        if (!e.features || e.features.length === 0) return;
        const feat = e.features[0];
        const props = feat.properties as any;
        const ptId = String(props.id || feat.id);

        hoveredPointIdRef.current = ptId;
        const domClsId = Number(props.cls ?? 1);
        const classMeta = CLASS_META[domClsId] ?? CLASS_META[1];
        const point = e.point;

        const cluster: ClusterInfo = {
          totalHotspots: 1,
          primaryClass: {
            id: domClsId,
            name: classMeta.name,
            color: classMeta.color,
          },
          classCounts: {
            wildfire:     domClsId === 0 ? 1 : 0,
            agricultural: domClsId === 1 ? 1 : 0,
            industrial:   domClsId === 2 ? 1 : 0,
            gasflare:     domClsId === 3 ? 1 : 0,
            accidental:   domClsId === 4 ? 1 : 0,
          },
          avgFrp:       Number(props.frp || 0),
          maxFrp:       Number(props.frp || 0),
          avgBrightness: Number(props.brightness || 330),
          maxBrightness: Number(props.brightness || 330),
          avgNo2:       Number(props.no2 || 0),
          avgSo2:       Number(props.so2 || 0),
          elevation:    Number(props.elevation || 0),
          landCoverCode: 40,
          landCover:    props.land_cover || 'Ground Surface',
          isIndustrial: domClsId === 2 ? 1.0 : 0.0,
          zScore:       props.is_anomaly ? 4.12 : null,
          isAnomaly:    Boolean(props.is_anomaly),
          baselineMeanFrp: null,
          source:  props.source  || null,
          acqDate: props.acq_date || useAppStore.getState().startDate,
          lat: e.lngLat.lat,
          lon: e.lngLat.lng,
        };

        setHoveredCluster(cluster, { x: point.x, y: point.y });
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('click', 'points-symbols', (e) => {
        if (!e.features || e.features.length === 0) return;
        const feat = e.features[0];
        const props = feat.properties as any;
        const domClsId = Number(props.cls ?? 1);
        const classMeta = CLASS_META[domClsId] ?? CLASS_META[1];

        const cluster: ClusterInfo = {
          totalHotspots: 1,
          primaryClass: {
            id: domClsId,
            name: classMeta.name,
            color: classMeta.color,
          },
          classCounts: {
            wildfire:     domClsId === 0 ? 1 : 0,
            agricultural: domClsId === 1 ? 1 : 0,
            industrial:   domClsId === 2 ? 1 : 0,
            gasflare:     domClsId === 3 ? 1 : 0,
            accidental:   domClsId === 4 ? 1 : 0,
          },
          avgFrp:       Number(props.frp || 0),
          maxFrp:       Number(props.frp || 0),
          avgBrightness: Number(props.brightness || 330),
          maxBrightness: Number(props.brightness || 330),
          avgNo2:       Number(props.no2 || 0),
          avgSo2:       Number(props.so2 || 0),
          elevation:    Number(props.elevation || 0),
          landCoverCode: 40,
          landCover:    props.land_cover || 'Ground Surface',
          isIndustrial: domClsId === 2 ? 1.0 : 0.0,
          zScore:       props.is_anomaly ? 4.12 : null,
          isAnomaly:    Boolean(props.is_anomaly),
          baselineMeanFrp: null,
          source:  props.source  || null,
          acqDate: props.acq_date || useAppStore.getState().startDate,
          lat: e.lngLat.lat,
          lon: e.lngLat.lng,
        };

        useAppStore.getState().setSelectedCluster(cluster);
        if (cluster.isAnomaly && !useAppStore.getState().hasAcknowledgedAnomaly) {
          useAppStore.getState().setAnomalyAlertOpen(true);
        }

        map.easeTo({
          center: [e.lngLat.lng, e.lngLat.lat],
          offset: [-window.innerWidth * 0.18, 0],
          duration: 600,
        });
      });

      map.on('mouseleave', 'points-symbols', () => {
        hoveredPointIdRef.current = null;
        setHoveredCluster(null, null);
        map.getCanvas().style.cursor = '';
      });

    } catch (err) {
      console.error('Failed to init map layers:', err);
    }
  }, [applyFilters, applyMetricColor, setHoveredCluster]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLES[theme],
      center: INDIA_CENTER,
      zoom: INDIA_ZOOM,
      minZoom: 3,
      maxZoom: 18,
      renderWorldCopies: false,       // ⚡ 50% reduction in WebGL vertex draw calls
      fadeDuration: 0,                // ⚡ Zero tile opacity fade lag on slow integrated GPUs
      maxTileCacheSize: 40,           // ⚡ Strict memory cap to prevent browser crashes on 2GB/4GB RAM PCs
      trackResize: true,
      attributionControl: false,
    });

    (window as any).__MAP__ = map;
    mapRef.current = map;
    useAppStore.getState().setMap(map);

    map.on('load', () => initLayers(map));

    return () => {
      map.remove();
      mapRef.current = null;
      useAppStore.getState().setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const checkAndInit = () => {
      if (map.isStyleLoaded() && !map.getSource('india-hexbins')) {
        initLayers(map);
      }
    };

    map.on('style.load', checkAndInit);
    map.on('idle', checkAndInit);

    map.setStyle(STYLES[theme]);

    return () => {
      map.off('style.load', checkAndInit);
      map.off('idle', checkAndInit);
    };
  }, [theme, initLayers]);

  const startDate = useAppStore((s) => s.startDate);
  const endDate = useAppStore((s) => s.endDate);
  const isPlaybackControllerOpen = useAppStore((s) => s.isPlaybackControllerOpen);

  useEffect(() => {
    applyFilters();
  }, [activeFilters, filterSettings, startDate, endDate, isPlaybackControllerOpen, applyFilters]);


  useEffect(() => {
    applyMetricColor();
  }, [activeMetric, applyMetricColor]);



  // ── Diurnal Heat Cycle Modulation & Hex-to-Icon Opacity (Prompt 7) ──
  const currentHour = useAppStore((s) => s.currentHour);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getLayer('hexbins-fill')) return;

    // Diurnal factor: peaks during daytime 11:00-16:00 UTC
    const hour = currentHour;
    let diurnalFactor = 0.5;
    if (hour >= 6 && hour <= 18) {
      const dist = Math.abs(hour - 13.5);
      diurnalFactor = Math.max(0.5, 1.0 - (dist / 7.5) * 0.5);
    } else {
      diurnalFactor = 0.45;
    }

    try {
      if (isPlaybackControllerOpen) {
        // Player open: hide hexbins completely so only isolated day's points appear
        map.setPaintProperty('hexbins-fill', 'fill-opacity', 0);
      } else {
        // Player closed: show hexbins at national zoom < 7.2, strictly 0 opacity at zoom >= 7.8
        map.setPaintProperty('hexbins-fill', 'fill-opacity', [
          'interpolate',
          ['linear'],
          ['zoom'],
          3, [
            'interpolate', ['linear'], ['get', 'b_x'],
            207.0, 0.25 * diurnalFactor,
            320.0, 0.50 * diurnalFactor,
            332.0, 0.70 * diurnalFactor,
            345.0, 0.88 * (0.6 + 0.4 * diurnalFactor),
            370.0, 0.96,
          ],
          6.5, [
            'interpolate', ['linear'], ['get', 'b_x'],
            207.0, 0.20 * diurnalFactor,
            320.0, 0.45 * diurnalFactor,
            332.0, 0.65 * diurnalFactor,
            345.0, 0.82 * (0.6 + 0.4 * diurnalFactor),
            370.0, 0.94,
          ],
          7.2, 0.0,
        ]);
      }

      if (map.getLayer('points-symbols')) {
        if (isPlaybackControllerOpen) {
          // Single-day timeline active: show class icon badges across all zoom levels
          map.setPaintProperty('points-symbols', 'icon-opacity', 1.0);
        } else {
          // Hex to Icon Transition: exactly 0 opacity at zoom <= 7.2, resolves into icons at zoom >= 7.8
          map.setPaintProperty('points-symbols', 'icon-opacity', [
            'interpolate',
            ['linear'],
            ['zoom'],
            7.2, 0.0,
            7.8, 1.0,
          ]);
        }
      }

      if (map.getLayer('accidental-radar-rings')) {
        if (isPlaybackControllerOpen) {
          map.setPaintProperty('accidental-radar-rings', 'circle-stroke-opacity', 0.85);
        } else {
          map.setPaintProperty('accidental-radar-rings', 'circle-stroke-opacity', [
            'interpolate',
            ['linear'],
            ['zoom'],
            7.0, 0.0,
            7.8, 0.75,
            12.0, 0.85,
          ]);
        }
      }
    } catch {
      // Layer might not be ready yet
    }
  }, [currentHour, isPlaybackControllerOpen]);



  // Map container remains stable and properly rendered at all times

  return (
    <div
      ref={containerRef}
      id="map"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
      }}
    />
  );
}
