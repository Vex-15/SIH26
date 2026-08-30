import { Panel } from './Panel';
import { cn } from '@/lib/utils';

type FeedFilter = 'all' | 'unconfirmed' | 'confirmed';

const FEED_OPTIONS: { id: FeedFilter; label: string; detail: string }[] = [
  { id: 'all', label: 'All sources', detail: 'Every detection stream' },
  { id: 'unconfirmed', label: '15-min NRT', detail: 'INSAT-3DR / Himawari-9' },
  { id: 'confirmed', label: 'FIRMS confirmed', detail: 'NASA VIIRS / MODIS' }
];

interface FeedSourcePanelProps {
  active: FeedFilter;
  onChange: (feed: FeedFilter) => void;
  onClose: () => void;
}

/** Simplicity Rules: one-line radio rows. Detail only on hover. */
export function FeedSourcePanel({ active, onChange, onClose }: FeedSourcePanelProps) {
  return (
    <Panel title="Satellite feed" onClose={onClose}>
      <div className="py-1.5 px-1.5 space-y-0.5" role="radiogroup" aria-label="Satellite feed source">
        {FEED_OPTIONS.map((opt) => {
          const isActive = active === opt.id;
          return (
            <button
              key={opt.id}
              role="radio"
              aria-checked={isActive}
              title={opt.detail}
              onClick={() => onChange(opt.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors hover:bg-white/[0.05]',
                isActive && 'bg-white/[0.05]'
              )}
            >
              <span
                className={cn(
                  'w-3 h-3 rounded-full border flex items-center justify-center shrink-0',
                  isActive ? 'border-orange-500' : 'border-slate-600'
                )}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
              </span>
              <span className={cn('text-xs', isActive ? 'text-white' : 'text-slate-300')}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
