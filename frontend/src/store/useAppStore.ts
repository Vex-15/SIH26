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
  hasAcknowledgedAnomaly: boolean;
  isMapReady: boolean;

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
  selectedCluster: null,
  tooltipPos: null,
  isAnomalyAlertOpen: false,
  isEmergencySimulationOpen: false,
  isCalendarOpen: false,
  isExportOpen: false,
  isPlaybackControllerOpen: false,
  hasAcknowledgedAnomaly: false,
  isMapReady: false,

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
  setPlaybackControllerOpen: (isPlaybackControllerOpen) => set({ isPlaybackControllerOpen }),
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
