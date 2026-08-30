import { Panel } from './Panel';
import { PRESET_FACILITIES } from '@/utils/dataLoader';
import { CLASS_COLORS } from '@/lib/classMeta';

/** Display region for each preset facility. */
const REGIONS: Record<string, string> = {
  'PRESET-1': 'Gujarat',
  'PRESET-2': 'Gujarat',
  'PRESET-3': 'Assam',
  'PRESET-4': 'Punjab',
  'PRESET-5': 'Uttarakhand'
};

interface TargetJumpsPanelProps {
  onSelectPreset: (presetId: string) => void;
  onClose: () => void;
}

/** Simplicity Rules: one line per target — class dot (color = data) + name +
 *  region suffix. No second label line, no emoji. */
export function TargetJumpsPanel({ onSelectPreset, onClose }: TargetJumpsPanelProps) {
  return (
    <Panel title="Target intelligence" onClose={onClose}>
      <div className="py-1.5 px-1.5">
        {PRESET_FACILITIES.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset.id)}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left hover:bg-white/[0.05] transition-colors"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: CLASS_COLORS[preset.class_id] ?? '#f59e0b' }}
            />
            <span className="flex-1 text-xs text-slate-300 truncate">{preset.name}</span>
            <span className="text-[11px] text-slate-500 shrink-0">{REGIONS[preset.id] ?? 'India'}</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}
