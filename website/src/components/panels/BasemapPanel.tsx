import { Panel } from './Panel';
import { useUIStore, type BasemapId } from '@/store/uiStore';
import { cn } from '@/lib/utils';

const BASEMAPS: { id: BasemapId; name: string; thumb: string }[] = [
  {
    id: 'esri_dark',
    name: 'Esri Dark Canvas',
    thumb: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900'
  },
  {
    id: 'satellite',
    name: 'Esri Satellite',
    thumb: 'bg-gradient-to-br from-emerald-900 via-amber-900 to-slate-800'
  },
  {
    id: 'osm_dark',
    name: 'OpenStreetMap',
    thumb: 'bg-gradient-to-br from-slate-400 via-slate-300 to-slate-500'
  }
];

interface BasemapPanelProps {
  onClose: () => void;
}

export function BasemapPanel({ onClose }: BasemapPanelProps) {
  const activeBasemap = useUIStore((s) => s.activeBasemap);
  const setActiveBasemap = useUIStore((s) => s.setActiveBasemap);

  return (
    <Panel title="Basemap" onClose={onClose}>
      <div className="py-2 px-3 space-y-1">
        {BASEMAPS.map((base) => {
          const isActive = activeBasemap === base.id;
          return (
            <button
              key={base.id}
              onClick={() => setActiveBasemap(base.id)}
              className={cn(
                'w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors text-left',
                isActive ? 'bg-white/[0.05]' : 'hover:bg-white/[0.05]'
              )}
            >
              {/* Static gradient thumbnail (40×40) */}
              <span className={cn('w-10 h-10 rounded-md border border-white/10 shrink-0', base.thumb)} />
              <span className="min-w-0 flex-1">
                <span className={cn('block text-sm font-medium', isActive ? 'text-white' : 'text-slate-300')}>
                  {base.name}
                </span>
              </span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />}
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
