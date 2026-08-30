import { CLASS_COLORS, CLASS_NAMES, FILTER_CLASS_IDS } from '@/lib/classMeta';

interface StatusBadgeProps {
  activeCount: number;
}

/** Zone 4: quiet status chip — class dots (hover for names) + active count.
 *  Simplicity Rules: dots only, no text labels, no glow, single row.
 *  Feed tags live in the Feed panel, not here. */
export function StatusBadge({ activeCount }: StatusBadgeProps) {
  return (
    <div className="fixed bottom-6 left-4 z-30 rounded-[10px] floating-glass px-3.5 py-2 select-none">
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          {FILTER_CLASS_IDS.map((classId) => (
            <span
              key={classId}
              title={CLASS_NAMES[classId]}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: CLASS_COLORS[classId] }}
            />
          ))}
        </div>
        <span className="text-slate-700">|</span>
        <span>
          <span className="font-mono text-slate-300">{activeCount}</span> active
        </span>
      </div>
    </div>
  );
}
