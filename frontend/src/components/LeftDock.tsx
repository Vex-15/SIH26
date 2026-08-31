import { useState } from 'react';
import { Home, MapPin, Layers, SlidersHorizontal, Radio, Truck, Download, Settings } from 'lucide-react';
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
    setMetricSelectorOpen,
    isLocationSearchOpen,
    setLocationSearchOpen,
    isEmergencySimulationOpen,
    setEmergencySimulationOpen,
    isEmergencyServicesOpen,
    setEmergencyServicesOpen,
    setCalendarOpen,
    isPlaybackControllerOpen,
    setPlaybackControllerOpen,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'home' | 'settings'>('home');

  const handleHomeClick = () => {
    setActiveTab('home');
    setLayersOpen(false);
    setMetricSelectorOpen(false);
    setLocationSearchOpen(false);
    setCalendarOpen(false);
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
        active={activeTab === 'home' && !isLayersOpen && !isMetricSelectorOpen && !isLocationSearchOpen && !isEmergencySimulationOpen && !isEmergencyServicesOpen && !isPlaybackControllerOpen}
        onClick={handleHomeClick}
        ariaLabel="Zoom to India Home"
      >
        <Home size={18} strokeWidth={1.5} />
      </DockIcon>

      {/* ── Location Tool Trigger ── */}
      <DockIcon
        active={isLocationSearchOpen}
        onClick={() => {
          setLocationSearchOpen(!isLocationSearchOpen);
          if (!isLocationSearchOpen) {
            setLayersOpen(false);
            setMetricSelectorOpen(false);
            setCalendarOpen(false);
          }
        }}
        ariaLabel="Location Search Tool"
      >
        <MapPin size={18} strokeWidth={1.5} color={isLocationSearchOpen ? '#f59e0b' : undefined} />
      </DockIcon>
      
      <DockIcon
        active={isLayersOpen}
        onClick={() => {
          setLayersOpen(!isLayersOpen);
          if (!isLayersOpen) {
            setMetricSelectorOpen(false);
            setLocationSearchOpen(false);
            setCalendarOpen(false);
          }
        }}
        ariaLabel="Fire Class Filter"
      >
        <Layers size={18} strokeWidth={1.5} />
      </DockIcon>

      <DockIcon
        active={isMetricSelectorOpen}
        onClick={() => {
          setMetricSelectorOpen(!isMetricSelectorOpen);
          if (!isMetricSelectorOpen) {
            setLayersOpen(false);
            setLocationSearchOpen(false);
            setCalendarOpen(false);
          }
        }}
        ariaLabel="Telemetry Parameter Coloring"
      >
        <SlidersHorizontal size={18} strokeWidth={1.5} />
      </DockIcon>

      {/* ── Real-Time Emergency Simulation Trigger ── */}
      <DockIcon
        active={isEmergencySimulationOpen}
        onClick={() => {
          setEmergencySimulationOpen(!isEmergencySimulationOpen);
          setLayersOpen(false);
          setMetricSelectorOpen(false);
          setCalendarOpen(false);
        }}
        ariaLabel="Real-Time Emergency Warning Simulator"
        className="text-red-500 hover:text-red-400"
      >
        <Radio size={18} strokeWidth={1.8} color={isEmergencySimulationOpen ? '#ef4444' : '#f87171'} />
      </DockIcon>

      {/* ── Feature 3: Nearest Emergency Services & First Responder Grid ── */}
      <DockIcon
        active={isEmergencyServicesOpen}
        onClick={() => {
          setEmergencyServicesOpen(!isEmergencyServicesOpen);
          if (!isEmergencyServicesOpen) {
            setLayersOpen(false);
            setMetricSelectorOpen(false);
            setCalendarOpen(false);
          }
        }}
        ariaLabel="Nearest Emergency Services & First Responder Grid (OSM/OSRM)"
      >
        <Truck size={18} strokeWidth={1.6} color={isEmergencyServicesOpen ? '#f97316' : '#fb923c'} />
      </DockIcon>

      {/* ── Temporal Archive & Data Export Suite (Single Unified Trigger) ── */}
      <DockIcon
        active={isPlaybackControllerOpen}
        onClick={() => {
          setPlaybackControllerOpen(!isPlaybackControllerOpen);
          if (!isPlaybackControllerOpen) {
            setLayersOpen(false);
            setMetricSelectorOpen(false);
            setCalendarOpen(false);
          }
        }}
        ariaLabel="Temporal Playback & Export Suite"
      >
        <Download size={18} strokeWidth={1.5} color={isPlaybackControllerOpen ? '#f59e0b' : undefined} />
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
