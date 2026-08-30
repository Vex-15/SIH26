import { Crosshair, Layers, Satellite, Map as MapIcon } from 'lucide-react';
import { useUIStore, type LeftPanelId } from '@/store/uiStore';
import { StripButton } from './StripButton';
import { TargetJumpsPanel } from '@/components/panels/TargetJumpsPanel';
import { ClassFilterPanel } from '@/components/panels/ClassFilterPanel';
import { FeedSourcePanel } from '@/components/panels/FeedSourcePanel';
import { BasemapPanel } from '@/components/panels/BasemapPanel';

const PANELS: { id: LeftPanelId; icon: typeof Crosshair; tooltip: string }[] = [
  { id: 'targets', icon: Crosshair, tooltip: 'Target Intelligence' },
  { id: 'filter', icon: Layers, tooltip: 'Filter by Class' },
  { id: 'feed', icon: Satellite, tooltip: 'Satellite Feed Source' },
  { id: 'basemap', icon: MapIcon, tooltip: 'Basemap Layer' }
];

interface LeftPanelStripProps {
  activeClassFilter: number | 'all';
  onSetClassFilter: (filter: number | 'all') => void;
  activeFeedFilter: 'all' | 'unconfirmed' | 'confirmed';
  onSetFeedFilter: (feed: 'all' | 'unconfirmed' | 'confirmed') => void;
  classCounts: Record<number, number>;
  totalCount: number;
  onSelectPreset: (presetId: string) => void;
}

/** Zone 2 (redesign.md): vertical icon strip on the left edge. Only one panel
 *  is expanded at a time; the panel slides in beside the strip. */
export function LeftPanelStrip(props: LeftPanelStripProps) {
  const activePanel = useUIStore((s) => s.activeLeftPanel);
  const toggleLeftPanel = useUIStore((s) => s.toggleLeftPanel);
  const setActiveLeftPanel = useUIStore((s) => s.setActiveLeftPanel);

  const close = () => setActiveLeftPanel(null);

  const handleSelectPreset = (presetId: string) => {
    props.onSelectPreset(presetId);
    close(); // fly-to + drawer open; panel yields focus
  };

  return (
    <>
      {/* Icon strip (default state: icons only, 48px wide) */}
      <div className="fixed top-1/2 left-4 -translate-y-1/2 z-40 flex flex-col gap-1 p-2 rounded-xl floating-glass">
        {PANELS.map(({ id, icon, tooltip }) => (
          <StripButton
            key={id}
            icon={icon}
            label={tooltip}
            active={activePanel === id}
            onClick={() => toggleLeftPanel(id)}
            side="right"
          />
        ))}
      </div>

      {/* Expanded panels — mutually exclusive */}
      {activePanel === 'targets' && (
        <TargetJumpsPanel onSelectPreset={handleSelectPreset} onClose={close} />
      )}
      {activePanel === 'filter' && (
        <ClassFilterPanel
          active={props.activeClassFilter}
          onChange={props.onSetClassFilter}
          counts={props.classCounts}
          total={props.totalCount}
          onClose={close}
        />
      )}
      {activePanel === 'feed' && (
        <FeedSourcePanel
          active={props.activeFeedFilter}
          onChange={props.onSetFeedFilter}
          onClose={close}
        />
      )}
      {activePanel === 'basemap' && <BasemapPanel onClose={close} />}
    </>
  );
}
