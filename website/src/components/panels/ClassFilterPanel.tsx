import type { CSSProperties } from 'react';
import { Check } from 'lucide-react';
import { Panel } from './Panel';
import { CLASS_COLORS, CLASS_NAMES, FILTER_CLASS_IDS } from '@/lib/classMeta';
import { cn } from '@/lib/utils';

interface ClassFilterPanelProps {
  active: number | 'all';
  onChange: (filter: number | 'all') => void;
  counts: Record<number, number>;
  total: number;
  onClose: () => void;
}

/** Simplicity Rules: plain rows (dot + name + quiet count), no bordered pills.
 *  Active state = subtle background + check. One accent, no per-class chrome. */
function FilterRow({
  active,
  onClick,
  dot,
  label,
  value
}: {
  active: boolean;
  onClick: () => void;
  dot: CSSProperties;
  label: string;
  value: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors hover:bg-white/[0.05]',
        active && 'bg-white/[0.05]'
      )}
    >
      <span className="w-2 h-2 rounded-full shrink-0" style={dot} />
      <span className={cn('flex-1 text-xs', active ? 'text-white' : 'text-slate-300')}>{label}</span>
      {active ? (
        <Check size={13} strokeWidth={1.5} className="text-orange-500 shrink-0" />
      ) : (
        <span className="font-mono text-[11px] text-slate-500">{value}</span>
      )}
    </button>
  );
}

export function ClassFilterPanel({ active, onChange, counts, total, onClose }: ClassFilterPanelProps) {
  return (
    <Panel title="Fire classes" onClose={onClose}>
      <div className="py-1.5 px-1.5">
        <FilterRow
          active={active === 'all'}
          onClick={() => onChange('all')}
          dot={{ border: '1.5px solid #64748b', backgroundColor: 'transparent' }}
          label="All classes"
          value={total}
        />
        <div className="h-px bg-white/[0.06] mx-2 my-1" />
        {FILTER_CLASS_IDS.map((classId) => (
          <FilterRow
            key={classId}
            active={active === classId}
            onClick={() => onChange(active === classId ? 'all' : classId)}
            dot={{ backgroundColor: CLASS_COLORS[classId] }}
            label={CLASS_NAMES[classId]}
            value={counts[classId] ?? 0}
          />
        ))}
      </div>
    </Panel>
  );
}
