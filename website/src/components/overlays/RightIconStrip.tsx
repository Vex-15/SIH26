import { useState } from 'react';
import { ZoomIn, ZoomOut, Compass, Info } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { StripButton } from './StripButton';

/** Zone 3: right utility strip. Info card — Simplicity Rules: plain text,
 *  no icons, no accent color, no mono prose. */

const SYSTEM_INFO = [
  { label: 'Stacking meta-learner', value: '98.62% Balanced Accuracy' },
  { label: 'Overall test accuracy', value: '99.17% (3,243 / 3,270)' },
  { label: 'XGBoost tabular baseline', value: '96.17% (275k validation rows)' },
  { label: 'ResNet-18 vision baseline', value: '82.71% (16.3k satellite chips)' },
  { label: 'Fusion modalities', value: 'XGBoost · ResNet-18 · 1D-CNN' }
];

export function RightIconStrip() {
  const map = useUIStore((s) => s.mapInstance);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div className="fixed top-1/2 right-4 -translate-y-1/2 z-40 flex flex-col gap-1 p-2 rounded-xl floating-glass">
        <StripButton icon={ZoomIn} label="Zoom In" onClick={() => map?.zoomIn()} side="left" />
        <StripButton icon={ZoomOut} label="Zoom Out" onClick={() => map?.zoomOut()} side="left" />
        <StripButton
          icon={Compass}
          label="Reset to India Overview"
          onClick={() => {
            map?.flyTo([21.5937, 78.9629], 5, { duration: 1.2 });
            setShowInfo(false);
          }}
          side="left"
        />
        <StripButton
          icon={Info}
          label="System Information"
          active={showInfo}
          onClick={() => setShowInfo((v) => !v)}
          side="left"
        />
      </div>

      {/* Info floating card (slides in from the right) */}
      {showInfo && (
        <div className="fixed top-1/2 right-[72px] -translate-y-1/2 z-40 w-[280px] rounded-xl floating-glass animate-panel-in-right p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">System information</span>
            <button
              onClick={() => setShowInfo(false)}
              aria-label="Close system information"
              className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <Info size={14} strokeWidth={1.5} />
            </button>
          </div>

          {SYSTEM_INFO.map(({ label, value }) => (
            <div key={label}>
              <div className="text-[11px] text-slate-500">{label}</div>
              <div className="text-xs text-slate-200 mt-0.5">{value}</div>
            </div>
          ))}

          <div className="pt-2 border-t border-white/[0.08] text-[11px] text-slate-500">
            NTRO Geospatial Surveillance
          </div>
        </div>
      )}
    </>
  );
}
