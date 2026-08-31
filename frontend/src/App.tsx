import './index.css';
import { MapCanvas } from './components/MapCanvas';
import { LeftDock } from './components/LeftDock';
import { RightDock } from './components/RightDock';
import { LayersPopover } from './components/LayersPopover';
import { MetricSelectorPopover } from './components/MetricSelectorPopover';
import { LocationSearchPopover } from './components/LocationSearchPopover';
import { CalendarPopover } from './components/CalendarPopover';
import { HotspotTooltip } from './components/HotspotTooltip';
import { ThermalLegend } from './components/ThermalLegend';
import { ModePill } from './components/ModePill';
import { InspectorDrawer } from './components/InspectorDrawer';
import { AnomalyAlertModal } from './components/AnomalyAlertModal';
import { EmergencySimulationModal } from './components/EmergencySimulationModal';
import { DiurnalPlaybackController } from './components/prompt7/DiurnalPlaybackController';
import { SplitWipeView } from './components/prompt6/SplitWipeView';
import { ExportModal } from './components/ExportModal';
import { LoadingScreen } from './components/LoadingScreen';
import { useAppStore } from './store/useAppStore';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

export default function App() {
  const { theme, mapMode, isLayersOpen, isMetricSelectorOpen, isLocationSearchOpen, isCalendarOpen } = useAppStore();

  // Sync theme to data attribute for potential CSS-level theming
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>

      {/* ── Layer 0: Full-bleed map ── */}
      {mapMode === 'optical' ? (
        <SplitWipeView />
      ) : (
        <MapCanvas />
      )}

      {/* ── Layer 1: Floating UI chrome ── */}
      <LeftDock />
      <RightDock />

      {/* ── Layer 1: Map overlays ── */}
      <ModePill />
      {mapMode !== 'optical' && <ThermalLegend />}

      {/* ── Layer 2: Popovers / Modals ── */}
      <AnimatePresence>
        {isLocationSearchOpen && <LocationSearchPopover key="location-search-popover" />}
        {isLayersOpen && <LayersPopover key="layers-popover" />}
        {isMetricSelectorOpen && <MetricSelectorPopover key="metric-popover" />}
        {isCalendarOpen && <CalendarPopover key="calendar-popover" />}
      </AnimatePresence>

      {/* ── Layer 3: 40% Telemetry & Diurnal Heat Inspector Drawer ── */}
      {/* Always render the drawer */}
      <InspectorDrawer />

      {/* ── Layer 4: Hover tooltip (pointer-events: none) ── */}
      {mapMode !== 'optical' && <HotspotTooltip />}

      {/* ── Layer 5: 24-Hour Diurnal Playback Controller (Prompt 7) ── */}
      <DiurnalPlaybackController />

      {/* ── Layer 6: Anomaly Override Alert Modal ── */}
      <AnomalyAlertModal />

      {/* ── Layer 7: Emergency Simulation Prompt Modal ── */}
      <EmergencySimulationModal />

      {/* ── Layer 8: Tactical Dossier & Data Export Modal ── */}
      <ExportModal />

      {/* ── Layer 9: First-load Tactical Splash & Progress Loading Screen ── */}
      <LoadingScreen />

    </div>
  );
}




