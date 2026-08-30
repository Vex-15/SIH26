import { useState } from 'react';
import type { ReactNode } from 'react';
import type { HotspotFeature } from '../types/hotspot';
import { X, ChevronDown, ShieldAlert } from 'lucide-react';
import { CLASS_COLORS } from '@/lib/classMeta';

interface HotspotDetailDrawerProps {
  hotspot: HotspotFeature | null;
  onClose: () => void;
}

const MODELS = [
  { key: 'p_tab' as const, label: 'XGBoost · Tabular' },
  { key: 'p_temp' as const, label: '1D-CNN · Temporal' },
  { key: 'p_img' as const, label: 'ResNet-18 · Imagery' }
];

/** Collapsed-by-default section (Simplicity Rules: progressive disclosure). */
function Accordion({
  title,
  open,
  onToggle,
  children
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-white/[0.06] pt-3">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="mt-3 space-y-2.5">{children}</div>}
    </div>
  );
}

/** Hotspot intelligence drawer — Simplicity Rules: one class dot, three hero
 *  numbers, a single-line anomaly note when warranted, and everything else
 *  (model probabilities, SHAP) behind collapsed accordions. */
export function HotspotDetailDrawer({ hotspot, onClose }: HotspotDetailDrawerProps) {
  const [openModels, setOpenModels] = useState(false);
  const [openShap, setOpenShap] = useState(false);

  if (!hotspot) return null;

  const p = hotspot.properties;
  const classColor = CLASS_COLORS[p.class_id] || '#f59e0b';
  const critical = p.class_id === 4 || (p.z_score ?? 0) > 3;

  const modelProbs = MODELS.map(({ key, label }) => ({
    label,
    value: (p[key] ? p[key][p.class_id] : 0) * 100
  }));
  const maxProb = Math.max(...modelProbs.map((m) => m.value));

  const shap = [...(p.shap_features ?? [])].sort((a, b) => b.impact - a.impact).slice(0, 3);

  return (
    /* Positioning per redesign.md: fixed right:72px (clears the right icon strip),
       top:80px, bottom:24px, width:360px — styles in .hotspot-drawer (index.css) */
    <div className="hotspot-drawer z-30 flex flex-col overflow-hidden">
      {/* Header: one class dot + name + close. No chips, no color band. */}
      <div className="px-5 py-4 border-b border-white/[0.08] flex items-center gap-2.5 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: classColor }} />
        <h3 className="flex-1 text-sm font-medium text-white truncate">
          {p.facility_name || `${p.class_name} incident zone`}
        </h3>
        <button
          onClick={onClose}
          aria-label="Close"
          className="p-1 text-slate-500 hover:text-white rounded transition-colors"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Hero numbers — the only always-visible data. No boxes, no colors. */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-[11px] text-slate-500">FRP</div>
            <div className="font-mono text-lg text-slate-100 mt-0.5">
              {p.frp_mw.toFixed(1)}
              <span className="text-xs text-slate-500 ml-0.5">MW</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Confidence</div>
            <div className="font-mono text-lg text-slate-100 mt-0.5">
              {p.confidence.toFixed(0)}
              <span className="text-xs text-slate-500 ml-0.5">%</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Z-score</div>
            <div className="font-mono text-lg text-slate-100 mt-0.5">
              {(p.z_score ?? 0).toFixed(1)}
              <span className="text-xs text-slate-500 ml-0.5">σ</span>
            </div>
          </div>
        </div>

        {/* Anomaly note — one quiet line, only when warranted */}
        {critical && (
          <div className="flex items-center gap-2 pl-2.5 border-l-2 border-red-500 text-xs text-red-400">
            <ShieldAlert size={13} strokeWidth={1.5} className="shrink-0" />
            <span>Anomaly: {(p.z_score ?? 0).toFixed(1)}σ above 30-day thermal baseline</span>
          </div>
        )}

        <Accordion title="Model confidence" open={openModels} onToggle={() => setOpenModels((v) => !v)}>
          {modelProbs.map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">{m.label}</span>
                <span className="font-mono text-slate-300">{m.value.toFixed(0)}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${m.value === maxProb ? 'bg-orange-500' : 'bg-slate-600'}`}
                  style={{ width: `${m.value}%` }}
                />
              </div>
            </div>
          ))}
        </Accordion>

        {shap.length > 0 && (
          <Accordion title="Why this class" open={openShap} onToggle={() => setOpenShap((v) => !v)}>
            {shap.map((f) => (
              <div key={f.feature} className="flex items-start justify-between gap-3">
                <span className="text-xs text-slate-300 leading-snug">{f.description}</span>
                <span className="font-mono text-[11px] text-slate-500 shrink-0">
                  +{f.impact.toFixed(1)}
                </span>
              </div>
            ))}
          </Accordion>
        )}
      </div>

      {/* Footer: timestamp + ID + verification */}
      <div className="px-5 py-2.5 border-t border-white/[0.08] flex items-center justify-between text-[11px] shrink-0">
        <span className="font-mono text-slate-500">
          {p.timestamp || '—'} · {p.id}
        </span>
        <span className="text-slate-400">Verified</span>
      </div>
    </div>
  );
}
