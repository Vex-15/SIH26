import { useState } from 'react';
import { Home, Layers, SlidersHorizontal, Calendar, Settings } from 'lucide-react';
import { Dock, DockIcon } from './Dock';
import { useAppStore } from '../store/useAppStore';

// India center [lng, lat] and zoom
const INDIA_CENTER: [number, number] = [78.9629, 20.5937];
const INDIA_ZOOM = 4.6;

export function LeftDock() {
  const { 
    map, 
    isLayersOpen, 
    setLayersOpen, 
    isMetricSelectorOpen, 
    setMetricSelectorOpen 
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'settings'>('home');

  const handleHomeClick = () => {
    setActiveTab('home');
    setLayersOpen(false);
    setMetricSelectorOpen(false);
    if (map) {
      map.flyTo({
        center: INDIA_CENTER,
        zoom: INDIA_ZOOM,
        essential: true,
        duration: 1500,
      });
    }
  };

  return (
    <Dock side="left">
      <DockIcon
        active={activeTab === 'home' && !isLayersOpen && !isMetricSelectorOpen}
        onClick={handleHomeClick}
        ariaLabel="Zoom to India Home"
      >
        <Home size={18} strokeWidth={1.5} />
      </DockIcon>
      
      <DockIcon
        active={isLayersOpen}
        onClick={() => {
          setLayersOpen(!isLayersOpen);
          if (!isLayersOpen) setMetricSelectorOpen(false);
        }}
        ariaLabel="Fire Class Filter"
      >
        <Layers size={18} strokeWidth={1.5} />
      </DockIcon>

      <DockIcon
        active={isMetricSelectorOpen}
        onClick={() => {
          setMetricSelectorOpen(!isMetricSelectorOpen);
          if (!isMetricSelectorOpen) setLayersOpen(false);
        }}
        ariaLabel="Telemetry Parameter Coloring"
      >
        <SlidersHorizontal size={18} strokeWidth={1.5} />
      </DockIcon>

      <DockIcon
        active={activeTab === 'calendar'}
        onClick={() => {
          setActiveTab('calendar');
          setLayersOpen(false);
          setMetricSelectorOpen(false);
        }}
        ariaLabel="Temporal Select"
      >
        <Calendar size={18} strokeWidth={1.5} />
      </DockIcon>

      <DockIcon
        active={activeTab === 'settings'}
        onClick={() => {
          setActiveTab('settings');
          setLayersOpen(false);
          setMetricSelectorOpen(false);
        }}
        ariaLabel="System Config"
      >
        <Settings size={18} strokeWidth={1.5} />
      </DockIcon>
    </Dock>
  );
}
