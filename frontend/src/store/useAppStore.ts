import { create } from 'zustand';
import * as maplibregl from 'maplibre-gl';

export type Theme = 'dark' | 'light';
export type AppMode = 'demo' | 'live';
export type FireClass = 'wildfire' | 'agricultural' | 'industrial' | 'gasflare' | 'accidental';
export type MapMode = 'thermal' | 'optical' | 'radar';

export type VisualMetric = 
  | 'brightness'       // 🌡️ Thermal Radiance (K)
  | 'frp'              // 🔥 Fire Radiative Power (MW)
  | 'tropomi_no2'      // 🌫️ NO2 Pollution Plume (mmol/m²)
  | 'tropomi_so2'      // ⚗️ SO2 Gas Emissions (mDU)
  | 'land_cover_code'  // 🌲 Land Cover Classification
  | 'is_industrial'    // 🏭 Industrial Persistent Facility Density
  | 'elevation'        // ⛰️ Topographic Elevation (m)
  | 'Target_Class';    // 🎯 AI Multi-Modal Predicted Class

export interface FilterSettings {
  minBrightness: number; // 300 - 380 K
  minFrp: number;        // 0 - 200 MW
  minElevation: number;  // 0 - 3000 m
  maxElevation: number;  // 0 - 4000 m
  minNo2: number;        // 0 - 0.3 mmol/m²
  minSo2: number;        // 0 - 0.3 mDU
  onlyAnomalies: boolean;
}

export interface ClusterInfo {
  totalHotspots: number;
  primaryClass: { id: number; name: string; color: string };
  avgFrp: number;
  maxFrp: number;
  avgBrightness: number;
  avgNo2: number;
  avgSo2: number;
  elevation: number;
  landCover: string;
  isIndustrial: number;
  zScore: number | null;
  isAnomaly: boolean;
  lat: number;
  lon: number;
}

export const METRIC_CONFIGS: Record<VisualMetric, { label: string; unit: string; description: string; icon: string }> = {
  brightness: {
    label: 'Brightness Temperature',
    unit: 'Kelvin (K)',
    description: 'Surface thermal radiance emitted by fire hotspots',
    icon: 'Thermometer',
  },
  frp: {
    label: 'Fire Radiative Power (FRP)',
    unit: 'Megawatts (MW)',
    description: 'Radiative combustion energy release rate',
    icon: 'Flame',
  },
  tropomi_no2: {
    label: 'Nitrogen Dioxide (NO₂)',
    unit: 'mmol / m²',
    description: 'Combustion exhaust plume index from Sentinel-5P',
    icon: 'CloudFog',
  },
  tropomi_so2: {
    label: 'Sulfur Dioxide (SO₂)',
    unit: 'mDU',
    description: 'Volcanic, smelter, and refinery sulfur emissions',
    icon: 'FlaskConical',
  },
  land_cover_code: {
    label: 'Land Cover Classification',
    unit: 'ESA 10m Class',
    description: 'ESA WorldCover ground surface classification',
    icon: 'Trees',
  },
  is_industrial: {
    label: 'Industrial Facility Index',
    unit: 'Count / Ratio',
    description: 'Known industrial persistent facility cluster density',
    icon: 'Factory',
  },
  elevation: {
    label: 'Topographic Elevation',
    unit: 'Meters (m)',
    description: 'Digital Elevation Model ground surface altitude',
    icon: 'Mountain',
  },
  Target_Class: {
    label: 'AI Classified Anomaly Type',
    unit: 'Phase 6 Fused',
    description: 'Master multi-modal stacking ensemble classification',
    icon: 'BrainCircuit',
  },
};

interface AppState {
  theme: Theme;
  mode: AppMode;
  mapMode: MapMode;
  activeMetric: VisualMetric;
  map: maplibregl.Map | null;
  activeFilters: Record<FireClass, boolean>;
  filterSettings: FilterSettings;
  isLayersOpen: boolean;
  isMetricSelectorOpen: boolean;
  hoveredCluster: ClusterInfo | null;
  tooltipPos: { x: number; y: number } | null;

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setMode: (mode: AppMode) => void;
  setMapMode: (mode: MapMode) => void;
  setActiveMetric: (metric: VisualMetric) => void;
  setMap: (map: maplibregl.Map | null) => void;
  toggleFilter: (fireClass: FireClass) => void;
  setFilterSettings: (settings: Partial<FilterSettings>) => void;
  resetFilterSettings: () => void;
  setLayersOpen: (open: boolean) => void;
  setMetricSelectorOpen: (open: boolean) => void;
  setHoveredCluster: (cluster: ClusterInfo | null, pos: { x: number; y: number } | null) => void;
}

const DEFAULT_FILTER_SETTINGS: FilterSettings = {
  minBrightness: 300,
  minFrp: 0,
  minElevation: 0,
  maxElevation: 4000,
  minNo2: 0,
  minSo2: 0,
  onlyAnomalies: false,
};

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  mode: 'demo',
  mapMode: 'thermal',
  activeMetric: 'Target_Class',
  map: null,
  activeFilters: {
    wildfire: true,
    agricultural: true,
    industrial: true,
    gasflare: true,
    accidental: true,
  },
  filterSettings: DEFAULT_FILTER_SETTINGS,
  isLayersOpen: false,
  isMetricSelectorOpen: false,
  hoveredCluster: null,
  tooltipPos: null,

  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  setMode: (mode) => set({ mode }),
  setMapMode: (mapMode) => set({ mapMode }),
  setActiveMetric: (activeMetric) => set({ activeMetric }),
  setMap: (map) => set({ map }),
  toggleFilter: (fireClass) =>
    set((s) => ({
      activeFilters: {
        ...s.activeFilters,
        [fireClass]: !s.activeFilters[fireClass],
      },
    })),
  setFilterSettings: (settings) =>
    set((s) => ({
      filterSettings: { ...s.filterSettings, ...settings },
    })),
  resetFilterSettings: () => set({ filterSettings: DEFAULT_FILTER_SETTINGS }),
  setLayersOpen: (open) =>
    set((s) => ({
      isLayersOpen: open,
      isMetricSelectorOpen: open ? false : s.isMetricSelectorOpen,
    })),
  setMetricSelectorOpen: (open) =>
    set((s) => ({
      isMetricSelectorOpen: open,
      isLayersOpen: open ? false : s.isLayersOpen,
    })),
  setHoveredCluster: (hoveredCluster, tooltipPos) => set({ hoveredCluster, tooltipPos }),
}));

export const CLASS_META: Record<number, { name: string; color: string; key: FireClass }> = {
  0: { name: 'Wildfire',             color: '#ef4444', key: 'wildfire'     },
  1: { name: 'Agricultural',         color: '#f59e0b', key: 'agricultural' },
  2: { name: 'Industrial Persistent',color: '#6366f1', key: 'industrial'   },
  3: { name: 'Gas Flare',            color: '#a855f7', key: 'gasflare'     },
  4: { name: 'Accidental Fire',      color: '#fb923c', key: 'accidental'   },
};

export const LAND_COVER_NAMES: Record<number, string> = {
  10: 'Tree Cover / Forest',
  20: 'Shrubland',
  30: 'Grassland',
  40: 'Cropland / Agriculture',
  50: 'Built-up / Urban / Industrial',
  60: 'Bare / Sparse Vegetation',
  70: 'Snow and Ice',
  80: 'Permanent Water Bodies',
  90: 'Herbaceous Wetland',
  95: 'Mangroves',
  100: 'Moss and Lichen',
};
