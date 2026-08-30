import { useState, useMemo } from 'react';
import { ThreatMap } from '@/components/ThreatMap';
import { HotspotDetailDrawer } from '@/components/HotspotDetailDrawer';
import { TopBrand } from '@/components/overlays/TopBrand';
import { LeftPanelStrip } from '@/components/overlays/LeftPanelStrip';
import { RightIconStrip } from '@/components/overlays/RightIconStrip';
import { StatusBadge } from '@/components/overlays/StatusBadge';
import { loadEnrichedHotspots } from '@/utils/dataLoader';
import type { HotspotFeature, HotspotFeatureCollection } from '@/types/hotspot';

export function App() {
  const [data] = useState<HotspotFeatureCollection>(() => loadEnrichedHotspots());
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotFeature | null>(null);
  const [activeClassFilter, setActiveClassFilter] = useState<number | 'all'>('all');
  const [activeFeedFilter, setActiveFeedFilter] = useState<'all' | 'unconfirmed' | 'confirmed'>('all');

  const handleSelectPreset = (presetId: string) => {
    const preset = data.features.find((f) => f.properties.id === presetId);
    if (preset) {
      setSelectedHotspot(preset);
    }
  };

  // Mirrors ThreatMap's filtering — feeds the Zone 4 status badge count
  const filteredCount = useMemo(() => {
    let features = data.features;
    if (activeClassFilter !== 'all') {
      features = features.filter((f) => f.properties.class_id === activeClassFilter);
    }
    if (activeFeedFilter === 'unconfirmed') {
      features = features.filter((f) => f.properties.feed_status === 'UNCONFIRMED_NRT');
    } else if (activeFeedFilter === 'confirmed') {
      features = features.filter((f) => f.properties.feed_status === 'CONFIRMED_POLAR');
    }
    return features.length;
  }, [data, activeClassFilter, activeFeedFilter]);

  const classCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    data.features.forEach((f) => {
      counts[f.properties.class_id] = (counts[f.properties.class_id] ?? 0) + 1;
    });
    return counts;
  }, [data]);

  return (
    <div className="relative w-screen h-screen bg-[#07090e] overflow-hidden text-slate-100">
      {/* Full-bleed Tactical Map Canvas — owns 100% of the viewport */}
      <ThreatMap
        data={data}
        selectedHotspot={selectedHotspot}
        onSelectHotspot={setSelectedHotspot}
        activeClassFilter={activeClassFilter}
        activeFeedFilter={activeFeedFilter}
      />

      {/* Zone 1: Top-Left Brand Strip */}
      <TopBrand count={data.features.length} />

      {/* Zone 2: Left Floating Mission Controls */}
      <LeftPanelStrip
        activeClassFilter={activeClassFilter}
        onSetClassFilter={setActiveClassFilter}
        activeFeedFilter={activeFeedFilter}
        onSetFeedFilter={setActiveFeedFilter}
        classCounts={classCounts}
        totalCount={data.features.length}
        onSelectPreset={handleSelectPreset}
      />

      {/* Zone 3: Right Floating Utility Strip */}
      <RightIconStrip />

      {/* Zone 4: Bottom-Left Status Badge */}
      <StatusBadge activeCount={filteredCount} />

      {/* Hotspot Intelligence Drawer (slides in from the right) */}
      <HotspotDetailDrawer
        hotspot={selectedHotspot}
        onClose={() => setSelectedHotspot(null)}
      />
    </div>
  );
}

export default App;
