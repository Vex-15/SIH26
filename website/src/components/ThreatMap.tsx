import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { HotspotFeature, HotspotFeatureCollection } from '../types/hotspot';
import { CLASS_COLORS } from '@/lib/classMeta';
import { useUIStore } from '@/store/uiStore';

interface ThreatMapProps {
  data: HotspotFeatureCollection;
  selectedHotspot: HotspotFeature | null;
  onSelectHotspot: (hotspot: HotspotFeature | null) => void;
  activeClassFilter: number | 'all';
  activeFeedFilter: 'all' | 'unconfirmed' | 'confirmed';
}

const TILE_LAYERS = {
  esri_dark: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 18
  },
  osm_dark: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }
};

export const ThreatMap: React.FC<ThreatMapProps> = ({
  data,
  selectedHotspot,
  onSelectHotspot,
  activeClassFilter,
  activeFeedFilter
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tacticalOverlaysRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const activeBasemap = useUIStore((s) => s.activeBasemap);
  const setMapInstance = useUIStore((s) => s.setMapInstance);
  const setActiveLeftPanel = useUIStore((s) => s.setActiveLeftPanel);

  // Filter discrete points
  const filteredFeatures = useMemo(() => {
    let features = data.features;
    if (activeClassFilter !== 'all') {
      features = features.filter((f) => f.properties.class_id === activeClassFilter);
    }
    if (activeFeedFilter === 'unconfirmed') {
      features = features.filter((f) => f.properties.feed_status === 'UNCONFIRMED_NRT');
    } else if (activeFeedFilter === 'confirmed') {
      features = features.filter((f) => f.properties.feed_status === 'CONFIRMED_POLAR');
    }
    return features;
  }, [data, activeClassFilter, activeFeedFilter]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.2, 79.2], // Centered on India [lat, lon]
      zoom: 5,
      minZoom: 4,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    const tacticalGroup = L.layerGroup().addTo(map);
    tacticalOverlaysRef.current = tacticalGroup;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;
    setMapInstance(map);

    map.on('click', () => {
      setActiveLeftPanel(null);
      onSelectHotspot(null);
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setMapInstance(null);
    };
  }, [setActiveLeftPanel, onSelectHotspot, setMapInstance]);

  // Update Base Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const config = TILE_LAYERS[activeBasemap] ?? TILE_LAYERS.esri_dark;
    const newTile = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom
    }).addTo(mapInstanceRef.current);

    newTile.bringToBack();
    tileLayerRef.current = newTile;
  }, [activeBasemap]);

  // Render Discrete Points and Interactive Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredFeatures.forEach((feature) => {
      const [lon, lat] = feature.geometry.coordinates;
      const p = feature.properties;
      const color = CLASS_COLORS[p.class_id] ?? '#f59e0b';
      const isAccidental = p.class_id === 4;

      const radius = Math.min(18, Math.max(6, Math.sqrt(p.frp_mw) * 2));

      // Glowing outer halo
      const glowCircle = L.circleMarker([lat, lon], {
        radius: radius * 1.8,
        color: color,
        fillColor: color,
        fillOpacity: 0.35,
        weight: 0
      });

      // Core crisp point
      const coreCircle = L.circleMarker([lat, lon], {
        radius: radius,
        color: '#ffffff',
        fillColor: color,
        fillOpacity: 0.95,
        weight: 1.5
      });

      // Single-line tooltip (Simplicity Rules: one line; class color on data only)
      coreCircle.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; white-space: nowrap;">
          <strong style="color: ${color};">${p.facility_name || p.class_name}</strong>
          <span style="color: #94a3b8;"> · ${p.frp_mw.toFixed(1)} MW</span>
        </div>`,
        { direction: 'top', className: 'tactical-tooltip', offset: [0, -6] }
      );

      coreCircle.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectHotspot(feature);
        mapInstanceRef.current?.flyTo([lat, lon], Math.max(mapInstanceRef.current.getZoom(), 9), {
          duration: 1.2
        });
      });

      markersLayerRef.current?.addLayer(glowCircle);
      markersLayerRef.current?.addLayer(coreCircle);

      if (isAccidental) {
        const pulseCircle = L.circleMarker([lat, lon], {
          radius: radius * 2.8,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.15,
          weight: 2,
          dashArray: '3, 4'
        });
        markersLayerRef.current?.addLayer(pulseCircle);
      }
    });
  }, [filteredFeatures, onSelectHotspot]);

  // Tactical Impact Overlays (Plume Dispersion & Population Risk Rings)
  useEffect(() => {
    if (!mapInstanceRef.current || !tacticalOverlaysRef.current) return;

    tacticalOverlaysRef.current.clearLayers();

    if (!selectedHotspot) return;

    const [lon, lat] = selectedHotspot.geometry.coordinates;
    const p = selectedHotspot.properties;

    // Concentric Risk Rings for Industrial or Accidental Fire
    if (p.class_id === 4 || p.class_id === 2) {
      const ring500m = L.circle([lat, lon], {
        radius: 1000,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '4, 4'
      });
      const ring2km = L.circle([lat, lon], {
        radius: 3000,
        color: '#f97316',
        fillColor: '#f97316',
        fillOpacity: 0.08,
        weight: 1.2,
        dashArray: '5, 5'
      });
      const ring5km = L.circle([lat, lon], {
        radius: 7000,
        color: '#eab308',
        fillColor: '#eab308',
        fillOpacity: 0.04,
        weight: 1,
        dashArray: '6, 6'
      });

      tacticalOverlaysRef.current.addLayer(ring5km);
      tacticalOverlaysRef.current.addLayer(ring2km);
      tacticalOverlaysRef.current.addLayer(ring500m);
    }
  }, [selectedHotspot]);

  // Zoom to selected hotspot
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedHotspot) return;
    const [lon, lat] = selectedHotspot.geometry.coordinates;
    mapInstanceRef.current.flyTo([lat, lon], Math.max(mapInstanceRef.current.getZoom(), 9), {
      duration: 1.0
    });
  }, [selectedHotspot]);

  return (
    <div className="relative w-full h-full bg-[#07090e] overflow-hidden">
      {/* Clean Full-Bleed Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
