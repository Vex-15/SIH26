import './index.css';
import { MapCanvas } from './components/MapCanvas';
import { LeftDock } from './components/LeftDock';
import { RightDock } from './components/RightDock';
import { LayersPopover } from './components/LayersPopover';
import { MetricSelectorPopover } from './components/MetricSelectorPopover';
import { HotspotTooltip } from './components/HotspotTooltip';
import { ThermalLegend } from './components/ThermalLegend';
import { ModePill } from './components/ModePill';
import { useAppStore } from './store/useAppStore';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

export default function App() {
  const { theme } = useAppStore();

  // Sync theme to data attribute for potential CSS-level theming
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>

      {/* ── Layer 0: Full-bleed map ── */}
      <MapCanvas />

      {/* ── Layer 1: Floating UI chrome ── */}
      <LeftDock />
      <RightDock />

      {/* ── Layer 1: Map overlays (always visible) ── */}
      <ModePill />
      <ThermalLegend />

      {/* ── Layer 2: Popovers / Modals ── */}
      <AnimatePresence>
        <LayersPopover />
        <MetricSelectorPopover />
      </AnimatePresence>

      {/* ── Layer 3: Hover tooltip (pointer-events: none) ── */}
      <HotspotTooltip />

    </div>
  );
}
