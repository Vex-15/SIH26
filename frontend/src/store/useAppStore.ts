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

export interface ScaleTier {
  id: string;
  name: string;
  rangeLabel: string;
  color: string;
  min?: number;
  max?: number;
  codes?: number[];
}

export interface MetricScaleFilter {
  metric: VisualMetric;
  tierId: string;
  min?: number;
  max?: number;
  codes?: number[];
  label: string;
}

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
  // Sub-class breakdown counts (from GeoJSON w_c / a_c / i_c / fl_c / ac_c)
  classCounts: { wildfire: number; agricultural: number; industrial: number; gasflare: number; accidental: number };
  avgFrp: number;
  maxFrp: number;
  avgBrightness: number;
  maxBrightness: number;
  avgNo2: number;
  avgSo2: number;
  elevation: number;
  landCoverCode: number;
  landCover: string;
  isIndustrial: number;   // 0.0 – 1.0 cluster ratio
  zScore: number | null;
  isAnomaly: boolean;
  baselineMeanFrp: number | null;  // 30-day rolling baseline µ (MW)
  lat: number;
  lon: number;
  // Point-level extras (null when clicked feature is a hexbin aggregate)
  source: string | null;    // e.g. 'VIIRS_JPSS1' / 'MODIS'
  acqDate: string | null;   // e.g. '2024-04-18'
}

export const METRIC_CONFIGS: Record<VisualMetric, { label: string; unit: string; description: string; icon: string }> = {
  Target_Class: {
    label: 'Fire Class Segregation',
    unit: '5-Class Multi-Modal AI',
    description: 'Master multi-modal AI classification (Wildfire, Stubble, Industrial, Flare, Accidental)',
    icon: 'BrainCircuit',
  },
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
};

export type TemporalScope = '24h' | '7d' | '30d' | '1h';
export type TimeFilterMode = 'window' | 'cumulative' | 'all_day';

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
  selectedCluster: ClusterInfo | null;
  tooltipPos: { x: number; y: number } | null;
  isAnomalyAlertOpen: boolean;
  isEmergencySimulationOpen: boolean;
  isCalendarOpen: boolean;
  isExportOpen: boolean;
  isPlaybackControllerOpen: boolean;
  isSimulating: boolean;
  hasAcknowledgedAnomaly: boolean;
  isMapReady: boolean;
  metricScaleFilter: MetricScaleFilter | null;

  // Location Search State
  isLocationSearchOpen: boolean;
  searchedLocation: { name: string; lat: number; lon: number } | null;
  savedLocations: Array<{ id: string; name: string; lat: number; lon: number }>;
  allowMultipleSelection: boolean;

  // Temporal Diurnal State (Prompt 7)
  startDate: string;
  endDate: string;
  selectedDate: string;
  currentHour: number; // 0 to 23.99
  isPlaying: boolean;
  playbackSpeed: number; // 1, 2, 5, 10
  temporalScope: TemporalScope;
  timeFilterMode: TimeFilterMode;

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setMode: (mode: AppMode) => void;
  setMapMode: (mode: MapMode) => void;
  setActiveMetric: (metric: VisualMetric) => void;
  setMap: (map: maplibregl.Map | null) => void;
  toggleFilter: (fireClass: FireClass) => void;
  setSoloFilter: (fireClass: FireClass) => void;
  resetActiveFilters: () => void;
  setMetricScaleFilter: (filter: MetricScaleFilter | null) => void;
  setFilterSettings: (settings: Partial<FilterSettings>) => void;
  resetFilterSettings: () => void;
  setLayersOpen: (open: boolean) => void;
  setMetricSelectorOpen: (open: boolean) => void;
  setLocationSearchOpen: (open: boolean) => void;
  setSearchedLocation: (loc: { name: string; lat: number; lon: number } | null) => void;
  addSavedLocation: (loc: { name: string; lat: number; lon: number }) => void;
  removeSavedLocation: (id: string) => void;
  setAllowMultipleSelection: (allow: boolean) => void;
  setHoveredCluster: (cluster: ClusterInfo | null, pos: { x: number; y: number } | null) => void;
  setSelectedCluster: (cluster: ClusterInfo | null) => void;
  setAnomalyAlertOpen: (open: boolean) => void;
  setEmergencySimulationOpen: (open: boolean) => void;
  setCalendarOpen: (open: boolean) => void;
  setExportOpen: (open: boolean) => void;
  setPlaybackControllerOpen: (open: boolean) => void;
  setIsSimulating: (isSimulating: boolean) => void;
  exitSimulation: () => void;
  setHasAcknowledgedAnomaly: (ack: boolean) => void;
  setIsMapReady: (ready: boolean) => void;

  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  setSelectedDate: (date: string) => void;
  setCurrentHour: (hour: number | ((prev: number) => number)) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setTemporalScope: (scope: TemporalScope) => void;
  setTimeFilterMode: (mode: TimeFilterMode) => void;
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

export function getToday2024Date(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `2024-${month}-${day}`;
}

const defaultInitialDate = getToday2024Date();

export const useAppStore = create<AppState>((set, get) => ({
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
  selectedCluster: null,
  tooltipPos: null,
  isAnomalyAlertOpen: false,
  isEmergencySimulationOpen: false,
  isCalendarOpen: false,
  isExportOpen: false,
  isPlaybackControllerOpen: false,
  isSimulating: false,
  hasAcknowledgedAnomaly: false,
  isMapReady: false,
  metricScaleFilter: null,

  // Location Search State Initial Values
  isLocationSearchOpen: false,
  searchedLocation: null,
  savedLocations: [
    { id: '1', name: 'New Delhi, India', lat: 28.6139, lon: 77.2090 },
    { id: '2', name: 'Mumbai, Maharashtra', lat: 19.0760, lon: 72.8777 },
    { id: '3', name: 'Bengaluru, Karnataka', lat: 12.9716, lon: 77.5946 },
    { id: '4', name: 'Kolkata, West Bengal', lat: 22.5726, lon: 88.3639 },
  ],
  allowMultipleSelection: false,

  startDate: defaultInitialDate,
  endDate: defaultInitialDate,
  selectedDate: defaultInitialDate,
  currentHour: 14.33, // 14:20 UTC
  isPlaying: false,
  playbackSpeed: 2,
  temporalScope: '24h',
  timeFilterMode: 'all_day',

  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  setMode: (mode) => set({ mode }),
  setMapMode: (mapMode) => set({ mapMode }),
  setActiveMetric: (activeMetric) => set({ activeMetric, metricScaleFilter: null }),
  setMetricScaleFilter: (metricScaleFilter) => set({ metricScaleFilter }),
  setMap: (map) => set({ map }),
  toggleFilter: (fireClass) =>
    set((s) => ({
      activeFilters: {
        ...s.activeFilters,
        [fireClass]: !s.activeFilters[fireClass],
      },
    })),
  setSoloFilter: (fireClass) =>
    set((s) => {
      const activeKeys = (Object.keys(s.activeFilters) as FireClass[]).filter(
        (k) => s.activeFilters[k]
      );
      // If this class is already the only one active, reset to all active (un-solo)
      if (activeKeys.length === 1 && activeKeys[0] === fireClass) {
        return {
          activeFilters: {
            wildfire: true,
            agricultural: true,
            industrial: true,
            gasflare: true,
            accidental: true,
          },
        };
      }
      // Otherwise isolate this class and disable the others
      return {
        activeFilters: {
          wildfire: fireClass === 'wildfire',
          agricultural: fireClass === 'agricultural',
          industrial: fireClass === 'industrial',
          gasflare: fireClass === 'gasflare',
          accidental: fireClass === 'accidental',
        },
      };
    }),
  resetActiveFilters: () =>
    set({
      activeFilters: {
        wildfire: true,
        agricultural: true,
        industrial: true,
        gasflare: true,
        accidental: true,
      },
    }),
  setFilterSettings: (settings) =>
    set((s) => ({
      filterSettings: { ...s.filterSettings, ...settings },
    })),
  resetFilterSettings: () => set({ filterSettings: DEFAULT_FILTER_SETTINGS }),
  setLayersOpen: (open) =>
    set((s) => ({
      isLayersOpen: open,
      isMetricSelectorOpen: open ? false : s.isMetricSelectorOpen,
      isCalendarOpen: open ? false : s.isCalendarOpen,
      isLocationSearchOpen: open ? false : s.isLocationSearchOpen,
    })),
  setMetricSelectorOpen: (open) =>
    set((s) => ({
      isMetricSelectorOpen: open,
      isLayersOpen: open ? false : s.isLayersOpen,
      isCalendarOpen: open ? false : s.isCalendarOpen,
      isLocationSearchOpen: open ? false : s.isLocationSearchOpen,
    })),
  setLocationSearchOpen: (open) =>
    set((s) => ({
      isLocationSearchOpen: open,
      isLayersOpen: open ? false : s.isLayersOpen,
      isMetricSelectorOpen: open ? false : s.isMetricSelectorOpen,
      isCalendarOpen: open ? false : s.isCalendarOpen,
    })),
  setSearchedLocation: (searchedLocation) => set({ searchedLocation }),
  addSavedLocation: (loc) =>
    set((s) => ({
      savedLocations: [
        ...s.savedLocations,
        { ...loc, id: Date.now().toString() },
      ],
    })),
  removeSavedLocation: (id) =>
    set((s) => ({
      savedLocations: s.savedLocations.filter((item) => item.id !== id),
    })),
  setAllowMultipleSelection: (allowMultipleSelection) => set({ allowMultipleSelection }),
  setHoveredCluster: (hoveredCluster, tooltipPos) => set({ hoveredCluster, tooltipPos }),
  setSelectedCluster: (selectedCluster) => set({ selectedCluster }),
  setAnomalyAlertOpen: (isAnomalyAlertOpen) => set({ isAnomalyAlertOpen }),
  setEmergencySimulationOpen: (isEmergencySimulationOpen) => set({ isEmergencySimulationOpen }),
  setCalendarOpen: (open) =>
    set((s) => ({
      isCalendarOpen: open,
      isLayersOpen: open ? false : s.isLayersOpen,
      isMetricSelectorOpen: open ? false : s.isMetricSelectorOpen,
    })),
  setExportOpen: (isExportOpen) => set({ isExportOpen }),
  setPlaybackControllerOpen: (isPlaybackControllerOpen) =>
    set((s) => ({
      isPlaybackControllerOpen,
      isPlaying: isPlaybackControllerOpen ? s.isPlaying : false,
      selectedCluster: isPlaybackControllerOpen ? null : s.selectedCluster,
    })),
  setIsSimulating: (isSimulating) => set({ isSimulating }),
  exitSimulation: () => {
    const { map } = get();
    if (map) {
      map.flyTo({ center: [78.9629, 20.5937], zoom: 4.8, duration: 1600, essential: true });
    }
    const defaultDate = getToday2024Date();
    set({
      isSimulating: false,
      isEmergencySimulationOpen: false,
      selectedCluster: null,
      mapMode: 'thermal',
      isPlaybackControllerOpen: false,
      isPlaying: false,
      startDate: defaultDate,
      endDate: defaultDate,
      selectedDate: defaultDate,
    });
  },
  setHasAcknowledgedAnomaly: (hasAcknowledgedAnomaly) => set({ hasAcknowledgedAnomaly }),
  setIsMapReady: (isMapReady) => set({ isMapReady }),

  setStartDate: (startDate) => set({ startDate, selectedDate: startDate }),
  setEndDate: (endDate) => set({ endDate }),
  setDateRange: (startDate, endDate) => set({ startDate, endDate, selectedDate: startDate }),
  setSelectedDate: (selectedDate) => set({ selectedDate, startDate: selectedDate, endDate: selectedDate }),
  setCurrentHour: (hour) =>
    set((s) => ({
      currentHour: typeof hour === 'function' ? hour(s.currentHour) : hour,
    })),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setTemporalScope: (temporalScope) => set({ temporalScope }),
  setTimeFilterMode: (timeFilterMode) => set({ timeFilterMode }),
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

export const METRIC_SCALE_TIERS: Partial<Record<VisualMetric, ScaleTier[]>> = {
  brightness: [
    { id: 'b_cool',     name: 'Cool',     rangeLabel: '< 320 K',   color: '#2d1160', max: 320 },
    { id: 'b_moderate', name: 'Moderate', rangeLabel: '320–335 K', color: '#6b1f7a', min: 320, max: 335 },
    { id: 'b_elevated', name: 'Elevated', rangeLabel: '335–345 K', color: '#d62f2f', min: 335, max: 345 },
    { id: 'b_high',     name: 'High',     rangeLabel: '345–360 K', color: '#f5961a', min: 345, max: 360 },
    { id: 'b_extreme',  name: 'Extreme',  rangeLabel: '> 360 K',   color: '#fef08a', min: 360 },
  ],
  frp: [
    { id: 'f_low',      name: 'Low',      rangeLabel: '< 10 MW',   color: '#2d1160', max: 10 },
    { id: 'f_moderate', name: 'Moderate', rangeLabel: '10–30 MW',  color: '#7b1fa2', min: 10, max: 30 },
    { id: 'f_high',     name: 'High',     rangeLabel: '30–80 MW',  color: '#e53935', min: 30, max: 80 },
    { id: 'f_severe',   name: 'Severe',   rangeLabel: '80–200 MW', color: '#fb923c', min: 80, max: 200 },
    { id: 'f_extreme',  name: 'Extreme',  rangeLabel: '> 200 MW',  color: '#fef08a', min: 200 },
  ],
  tropomi_no2: [
    { id: 'n_clean',    name: 'Clean',    rangeLabel: '< 0.05',      color: '#023e8a', max: 0.05 },
    { id: 'n_low',      name: 'Low Plume',rangeLabel: '0.05–0.12',  color: '#0077b6', min: 0.05, max: 0.12 },
    { id: 'n_moderate', name: 'Moderate', rangeLabel: '0.12–0.20',  color: '#00b4d8', min: 0.12, max: 0.20 },
    { id: 'n_heavy',    name: 'Heavy',    rangeLabel: '0.20–0.28',  color: '#ffb703', min: 0.20, max: 0.28 },
    { id: 'n_dense',    name: 'Dense',    rangeLabel: '> 0.28',      color: '#e85d04', min: 0.28 },
  ],
  tropomi_so2: [
    { id: 's_clean',    name: 'Clean',    rangeLabel: '< 0.03',      color: '#1b4332', max: 0.03 },
    { id: 's_low',      name: 'Low',      rangeLabel: '0.03–0.08',  color: '#2d6a4f', min: 0.03, max: 0.08 },
    { id: 's_moderate', name: 'Moderate', rangeLabel: '0.08–0.16',  color: '#52b788', min: 0.08, max: 0.16 },
    { id: 's_elevated', name: 'Elevated', rangeLabel: '0.16–0.24',  color: '#f9c74f', min: 0.16, max: 0.24 },
    { id: 's_dense',    name: 'Dense',    rangeLabel: '> 0.24',      color: '#f3722c', min: 0.24 },
  ],
  land_cover_code: [
    { id: 'lc_forest',  name: 'Forest',      rangeLabel: 'Tree Cover',   color: '#059669', codes: [10] },
    { id: 'lc_shrub',   name: 'Shrub/Grass', rangeLabel: 'Vegetation',   color: '#84cc16', codes: [20, 30] },
    { id: 'lc_agri',    name: 'Cropland',    rangeLabel: 'Agriculture',  color: '#f97316', codes: [40] },
    { id: 'lc_urban',   name: 'Urban/Built', rangeLabel: 'Infrastructure', color: '#6366f1', codes: [50] },
    { id: 'lc_wetland', name: 'Wetland/Water', rangeLabel: 'Aquatic',    color: '#06b6d4', codes: [80, 90, 95] },
  ],
  is_industrial: [
    { id: 'ind_none',   name: 'Non-Ind',     rangeLabel: '< 15%',        color: '#312e81', max: 0.15 },
    { id: 'ind_low',    name: 'Low Ratio',   rangeLabel: '15–40%',       color: '#4338ca', min: 0.15, max: 0.40 },
    { id: 'ind_mod',    name: 'Moderate',    rangeLabel: '40–70%',       color: '#7c3aed', min: 0.40, max: 0.70 },
    { id: 'ind_high',   name: 'High Facility', rangeLabel: '70–90%',     color: '#a855f7', min: 0.70, max: 0.90 },
    { id: 'ind_pure',   name: 'Industrial',  rangeLabel: '> 90%',        color: '#fbbf24', min: 0.90 },
  ],
  elevation: [
    { id: 'el_coast',   name: 'Coastal/Low', rangeLabel: '< 150 m',      color: '#1e3a5f', max: 150 },
    { id: 'el_plain',   name: 'Plains',      rangeLabel: '150–400 m',    color: '#1d4ed8', min: 150, max: 400 },
    { id: 'el_plat',    name: 'Plateau',     rangeLabel: '400–800 m',    color: '#7c3aed', min: 400, max: 800 },
    { id: 'el_high',    name: 'Highland',    rangeLabel: '800–1500 m',   color: '#be123c', min: 800, max: 1500 },
    { id: 'el_alpine',  name: 'Alpine',      rangeLabel: '> 1500 m',     color: '#f59e0b', min: 1500 },
  ],
};
