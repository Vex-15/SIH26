import { useEffect, useRef, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAppStore, CLASS_META, LAND_COVER_NAMES } from '../store/useAppStore';
import type { ClusterInfo, VisualMetric } from '../store/useAppStore';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';

maplibregl.setWorkerUrl(maplibreWorkerUrl);

// Kepler.gl Official Vector Styles (Carto Dark Matter & Positron)
const STYLES = {
  dark:  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
} as const;

// India center [lng, lat]
const INDIA_CENTER: [number, number] = [78.9629, 20.5937];
const INDIA_ZOOM = 4.6;

// ── Immediate Module-Level In-Memory Cache & Preload ─────────────────────────
let inMemoryHexbinGeoJson: any = null;
const preloadedPromise: Promise<any> = fetch('/data/india_thermal_hexbins_multiparam.geojson')
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then((json) => {
    inMemoryHexbinGeoJson = json;
    return json;
  })
  .catch((err) => {
    console.warn('Preload failed:', err);
    return null;
  });

async function loadHexbinData(): Promise<any> {
  if (inMemoryHexbinGeoJson) return inMemoryHexbinGeoJson;
  return preloadedPromise;
}

// ── Kepler.gl Quantile Color Expressions ─────────────────────────────────────
export function getMetricColorExpression(metric: VisualMetric): maplibregl.ExpressionSpecification {
  switch (metric) {
    case 'brightness':
      return [
        'step', ['get', 'b_m'],
        '#480032',        // < 326 K (Deep Plum)
        326.0, '#7e0037', // 326 - 332 K (Dark Wine Crimson)
        332.0, '#bd1e28', // 332 - 335 K (Intense Fire Red)
        335.0, '#e85617', // 335 - 337 K (Fiery Coral)
        337.0, '#f59e0b', // 337 - 341 K (Golden Amber)
        341.0, '#fef08a', // >= 341 K (Bright Yellow)
      ];

    case 'frp':
      return [
        'step', ['get', 'f_m'],
        '#2b0b3f',       // < 5 MW (Deep Violet)
        5.0,  '#57156e', // 5 - 12 MW
        12.0, '#8c2981', // 12 - 25 MW
        25.0, '#c53c74', // 25 - 50 MW
        50.0, '#f1605d', // 50 - 100 MW
        100.0, '#fe9f6d', // >= 100 MW (Intense Flame)
      ];

    case 'tropomi_no2':
      return [
        'step', ['get', 'n_m'],
        '#03045e',       // < 0.04 (Low Nitrogen)
        0.04, '#0077b6',
        0.08, '#00b4d8',
        0.12, '#90e0ef',
        0.16, '#ffb703',
        0.22, '#fb8500', // >= 0.22 (Dense Exhaust Plume)
      ];

    case 'tropomi_so2':
      return [
        'step', ['get', 's_m'],
        '#132a13',       // < 0.02 (Baseline)
        0.02, '#31572c',
        0.05, '#4f772d',
        0.09, '#90a955',
        0.15, '#ecf39e',
        0.25, '#f9c74f', // >= 0.25 (Heavy Sulfur Flaring)
      ];

    case 'land_cover_code':
      return [
        'match', ['get', 'lc'],
        10, '#059669', // Tree Cover (Forest)
        20, '#84cc16', // Shrubland
        30, '#eab308', // Grassland
        40, '#f97316', // Cropland / Agriculture
        50, '#a855f7', // Built-up / Urban / Industrial
        60, '#d97706', // Bare / Desert
        90, '#06b6d4', // Wetland
        95, '#0d9488', // Mangroves
        '#71717a',
      ];

    case 'is_industrial':
      return [
        'step', ['get', 'ind_r'],
        '#27272a',       // 0 Industrial (Dark Non-Industrial)
        0.15, '#6366f1',
        0.40, '#a855f7',
        0.70, '#ec4899',
        0.90, '#f59e0b', // High Industrial Facility Hotspot
      ];

    case 'elevation':
      return [
        'step', ['get', 'elev'],
        '#1e1b4b',        // < 150 m (Coastal / Gangetic Lowlands)
        150.0, '#312e81', // 150 - 350 m
        350.0, '#6b21a8', // 350 - 600 m (Plateau)
        600.0, '#b91c1c', // 600 - 1000 m (Highlands)
        1000.0, '#fbbf24', // >= 1000 m (Mountains)
      ];

    case 'Target_Class':
      return [
        'match', ['get', 'cls'],
        0, '#ef4444', // Wildfire (Red)
        1, '#f59e0b', // Agricultural (Amber)
        2, '#6366f1', // Industrial (Indigo)
        3, '#a855f7', // Gas Flare (Purple)
        4, '#fb923c', // Accidental (Bright Orange)
        '#71717a',
      ];

    default:
      return [
        'step', ['get', 'b_m'],
        '#480032',
        326.0, '#7e0037',
        332.0, '#bd1e28',
        335.0, '#e85617',
        337.0, '#f59e0b',
        341.0, '#fef08a',
      ];
  }
}

export function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const hoveredHexIdRef = useRef<string | null>(null);
  const { theme, activeFilters, filterSettings, activeMetric, setHoveredCluster } = useAppStore();

  // ── Build GPU filter expression from all UI parameters ────────────────────
  const buildFilterExpression = useCallback(() => {
    const { activeFilters: f, filterSettings: s } = useAppStore.getState();
    const clauses: maplibregl.ExpressionSpecification[] = [];

    // 1. Class filter clauses
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

    // 2. Numerical Parameter Thresholds
    if (s.minBrightness > 300) {
      clauses.push(['>=', ['get', 'b_m'], s.minBrightness]);
    }
    if (s.minFrp > 0) {
      clauses.push(['>=', ['get', 'f_m'], s.minFrp]);
    }
    if (s.minElevation > 0) {
      clauses.push(['>=', ['get', 'elev'], s.minElevation]);
    }
    if (s.maxElevation < 4000) {
      clauses.push(['<=', ['get', 'elev'], s.maxElevation]);
    }
    if (s.minNo2 > 0) {
      clauses.push(['>=', ['get', 'n_m'], s.minNo2]);
    }
    if (s.minSo2 > 0) {
      clauses.push(['>=', ['get', 's_m'], s.minSo2]);
    }
    if (s.onlyAnomalies) {
      clauses.push(['>', ['get', 'ac_c'], 0]);
    }

    if (clauses.length === 0) {
      return ['all'] as unknown as maplibregl.ExpressionSpecification;
    }
    return ['all', ...clauses] as maplibregl.ExpressionSpecification;
  }, []);

  // ── Apply active filters in 0ms on GPU ────────────────────────────────────
  const applyFilters = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const filterExpr = buildFilterExpression();
    if (map.getLayer('hexbins-fill')) map.setFilter('hexbins-fill', filterExpr);
  }, [buildFilterExpression]);

  // ── Apply dynamic metric color to the hexbins layer ───────────────────────
  const applyMetricColor = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer('hexbins-fill')) return;
    const expr = getMetricColorExpression(useAppStore.getState().activeMetric);
    map.setPaintProperty('hexbins-fill', 'fill-color', expr);
  }, []);

  // ── Initialize hexbin layer from in-memory cached GeoJSON ─────────────────
  const initLayers = useCallback(async (map: maplibregl.Map) => {
    const data = await loadHexbinData();
    if (!mapRef.current || !data) return;

    if (!map.getSource('india-hexbins')) {
      map.addSource('india-hexbins', {
        type: 'geojson',
        data: data,
        promoteId: 'hex_id',
      });
    }

    if (!map.getLayer('hexbins-fill')) {
      map.addLayer({
        id: 'hexbins-fill',
        type: 'fill',
        source: 'india-hexbins',
        paint: {
          'fill-color': getMetricColorExpression(useAppStore.getState().activeMetric),
          // Kepler density-weighted flowy opacity: dense fire corridors glow vividly
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1.0,
            [
              'interpolate',
              ['linear'],
              ['get', 'count'],
              1,  0.50,
              4,  0.75,
              15, 0.92,
              50, 1.00
            ]
          ],
        },
      });
    }

    if (!map.getLayer('hexbins-hover-border')) {
      map.addLayer({
        id: 'hexbins-hover-border',
        type: 'line',
        source: 'india-hexbins',
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#f59e0b',
            'transparent'
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            2.0,
            0
          ],
        },
      });
    }

    applyFilters();
    applyMetricColor();

    // ── Mouse hover on hexbin ──────────────────────────────────────────────
    map.off('mousemove', 'hexbins-fill', () => {});
    map.on('mousemove', 'hexbins-fill', (e) => {
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
        avgFrp: Number(props.f_m || 0),
        maxFrp: Number(props.f_x || 0),
        avgBrightness: Number(props.b_m || 330),
        avgNo2: Number(props.n_m || 0),
        avgSo2: Number(props.s_m || 0),
        elevation: Number(props.elev || 0),
        landCover: lcName,
        isIndustrial: Number(props.ind_r || 0),
        zScore: Number(props.ac_c) > 0 ? 3.84 : null,
        isAnomaly: Boolean(props.ac_c && props.ac_c > 0),
        lat: e.lngLat.lat,
        lon: e.lngLat.lng,
      };

      setHoveredCluster(cluster, { x: point.x, y: point.y });
      map.getCanvas().style.cursor = 'pointer';
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
  }, [applyFilters, applyMetricColor, setHoveredCluster]);

  // ── Initialize MapLibre instance with Carto Dark Matter ───────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLES[theme],
      center: INDIA_CENTER,
      zoom: INDIA_ZOOM,
      minZoom: 3,
      maxZoom: 18,
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

  // ── Instant theme swap ────────────────────────────────────────────────────
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

  // ── Reactively update filters ─────────────────────────────────────────────
  useEffect(() => {
    applyFilters();
  }, [activeFilters, filterSettings, applyFilters]);

  // ── Reactively update active color metric ─────────────────────────────────
  useEffect(() => {
    applyMetricColor();
  }, [activeMetric, applyMetricColor]);

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
