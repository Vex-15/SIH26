import { create } from 'zustand';
import type { Map as LeafletMap } from 'leaflet';

export type LeftPanelId = 'targets' | 'filter' | 'feed' | 'basemap';
export type BasemapId = 'esri_dark' | 'satellite' | 'osm_dark';

interface UIState {
  /** Which left mission panel is expanded. Only one at a time (kepler.gl behavior). */
  activeLeftPanel: LeftPanelId | null;
  toggleLeftPanel: (id: LeftPanelId) => void;
  setActiveLeftPanel: (id: LeftPanelId | null) => void;

  /** Active basemap tile layer (controlled by BasemapPanel, consumed by ThreatMap). */
  activeBasemap: BasemapId;
  setActiveBasemap: (id: BasemapId) => void;

  /** Leaflet instance registry — lets the right utility strip drive the map via ref. */
  mapInstance: LeafletMap | null;
  setMapInstance: (map: LeafletMap | null) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  activeLeftPanel: null,
  toggleLeftPanel: (id) =>
    set({ activeLeftPanel: get().activeLeftPanel === id ? null : id }),
  setActiveLeftPanel: (id) => set({ activeLeftPanel: id }),

  activeBasemap: 'esri_dark',
  setActiveBasemap: (id) => set({ activeBasemap: id }),

  mapInstance: null,
  setMapInstance: (map) => set({ mapInstance: map }),
}));
