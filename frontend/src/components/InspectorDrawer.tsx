import type React from 'react';
import { useAppStore, CLASS_META } from '../store/useAppStore';

// ── Phase 6 stacking-ensemble model accuracies (from ACCURACY_REPORT_ALL_PHASES.md) ──
const MODEL_SCORES: Record<number, { xgb: number; cnn: number; resnet: number; stack: number }> = {
  0: { xgb: 99.8, cnn: 88.4, resnet: 84.2, stack: 99.9 }, // Wildfire
  1: { xgb: 98.5, cnn: 85.1, resnet: 81.7, stack: 99.8 }, // Agricultural
  2: { xgb: 97.9, cnn: 84.6, resnet: 79.3, stack: 99.7 }, // Industrial
  3: { xgb: 99.1, cnn: 87.3, resnet: 83.1, stack: 99.9 }, // Gas Flare
  4: { xgb: 98.7, cnn: 86.1, resnet: 80.5, stack: 99.8 }, // Accidental
};

// ── Top SHAP features per class (from shap_explainability_summary.json) ──
const SHAP_FEATURES: Record<number, string[]> = {
  0: ['Fire Radiative Power', 'Peak Brightness', 'Elevation', 'Land Cover'],
  1: ['Acquisition Time', 'Land Cover (Cropland)', 'NO₂ Column', 'FRP (mean)'],
  2: ['Industrial Ratio', 'SO₂ Column', 'FRP Persistence', 'Brightness'],
  3: ['FRP Persistence', 'SO₂ Column', 'NO₂ Column', 'Elevation'],
  4: ['Z-Score Spike', 'Peak FRP', 'FRP Mean', 'Acquisition Time'],
};

// ── Risk level mapping ──
function frpRisk(frp: number): { label: string; color: string } {
  if (frp >= 100) return { label: 'Critical', color: '#ef4444' };
  if (frp >= 30)  return { label: 'High',     color: '#f97316' };
  if (frp >= 10)  return { label: 'Moderate', color: '#eab308' };
  return           { label: 'Low',            color: '#22c55e' };
}

// ── SVG icons per class ──
function ClassIcon({ clsId, size = 64 }: { clsId: number; size?: number }) {
  const meta = CLASS_META[clsId] ?? CLASS_META[0];
  const s = size;

  const icons: Record<number, React.ReactNode> = {
    // Wildfire — flame shape
    0: (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        <path
          d="M32 56 C14 56 10 42 18 30 C18 30 22 38 28 36 C20 26 26 12 32 8 C32 8 30 22 36 26 C42 18 44 30 40 36 C46 38 50 30 50 30 C58 42 50 56 32 56Z"
          fill={meta.color} opacity="0.9"
        />
        <ellipse cx="32" cy="48" rx="10" ry="5" fill="#fbbf24" opacity="0.6" />
      </svg>
    ),
    // Agricultural — wheat stalk
    1: (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        <line x1="32" y1="8" x2="32" y2="58" stroke={meta.color} strokeWidth="3.5" strokeLinecap="round"/>
        {[18,24,30,36,42].map((y, i) => (
          <g key={i}>
            <ellipse cx="20" cy={y} rx="10" ry="5.5" fill={meta.color} opacity={0.85 - i * 0.07} transform={`rotate(-15,20,${y})`} />
            <ellipse cx="44" cy={y+3} rx="10" ry="5.5" fill={meta.color} opacity={0.85 - i * 0.07} transform={`rotate(15,44,${y+3})`} />
          </g>
        ))}
      </svg>
    ),
    // Industrial — factory chimney with plume
    2: (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        <rect x="10" y="30" width="44" height="26" rx="3" fill={meta.color} opacity="0.85"/>
        <rect x="14" y="16" width="10" height="14" rx="2" fill={meta.color}/>
        <rect x="40" y="10" width="10" height="20" rx="2" fill={meta.color}/>
        <path d="M16 16 Q18 8 24 10 Q22 6 28 4" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M42 10 Q44 2 50 4 Q48 0 54 2" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <rect x="26" y="42" width="12" height="14" rx="1" fill="rgba(0,0,0,0.25)"/>
      </svg>
    ),
    // Gas Flare — torch with flame
    3: (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        <rect x="28" y="28" width="8" height="28" rx="3" fill={meta.color} opacity="0.8"/>
        <path
          d="M32 28 C22 28 18 18 24 10 C24 10 26 18 30 16 C26 10 28 4 32 2 C36 4 38 10 34 16 C38 18 40 10 40 10 C46 18 42 28 32 28Z"
          fill={meta.color}
        />
        <ellipse cx="32" cy="22" rx="6" ry="4" fill="#fde68a" opacity="0.7"/>
      </svg>
    ),
    // Accidental Explosion — burst / alert
    4: (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        <polygon points="32,4 38,24 58,24 42,36 48,56 32,44 16,56 22,36 6,24 26,24"
          fill={meta.color} opacity="0.9"/>
        <circle cx="32" cy="32" r="8" fill="white" opacity="0.25"/>
        <text x="32" y="37" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white" fontFamily="system-ui">!</text>
      </svg>
    ),
  };

  return (
    <div style={{ filter: `drop-shadow(0 0 12px ${meta.color}88)` }}>
      {icons[clsId] ?? icons[0]}
    </div>
  );
}

// ── Mini stat pill ──
function Pill({ label, value, unit = '', color }: { label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 10,
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    }}>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{ fontSize: 18, fontWeight: 700, color: color ?? '#ffffff', lineHeight: 1.1 }}>
        {value}
        {unit && <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 3, color: 'rgba(255,255,255,0.55)' }}>{unit}</span>}
      </span>
    </div>
  );
}

// ── Horizontal bar row ──
function BarRow({ label, value, max, color, unit = '' }: {
  label: string; value: number; max: number; color: string; unit?: string;
}) {
  const pct = Math.min(100, (value / Math.max(max, 0.001)) * 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
          {value.toFixed(value < 10 ? 2 : 1)}{unit}
        </span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: color,
          borderRadius: 3, transition: 'width 0.6s ease',
          boxShadow: `0 0 6px ${color}99`,
        }} />
      </div>
    </div>
  );
}

// ── Class breakdown mini-bar (shows w_c / a_c / i_c / fl_c / ac_c counts) ──
function ClassBreakdownBar({ counts, total }: {
  counts: { wildfire: number; agricultural: number; industrial: number; gasflare: number; accidental: number };
  total: number;
}) {
  const segments = [
    { key: 'wildfire',     count: counts.wildfire,     color: CLASS_META[0].color, label: CLASS_META[0].name },
    { key: 'agricultural', count: counts.agricultural, color: CLASS_META[1].color, label: CLASS_META[1].name },
    { key: 'industrial',   count: counts.industrial,   color: CLASS_META[2].color, label: CLASS_META[2].name },
    { key: 'gasflare',     count: counts.gasflare,     color: CLASS_META[3].color, label: CLASS_META[3].name },
    { key: 'accidental',   count: counts.accidental,   color: CLASS_META[4].color, label: CLASS_META[4].name },
  ].filter(s => s.count > 0);

  const t = Math.max(total, 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* stacked bar */}
      <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', gap: 1 }}>
        {segments.map(s => (
          <div
            key={s.key}
            title={`${s.label}: ${s.count}`}
            style={{
              flex: s.count / t,
              background: s.color,
              transition: 'flex 0.5s ease',
            }}
          />
        ))}
      </div>
      {/* legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
        {segments.map(s => (
          <span key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: 'inline-block' }} />
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{s.label}</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{s.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Model confidence meter ──
function ModelRow({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', width: 100, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${score}%`, height: '100%', background: color,
          borderRadius: 3, boxShadow: `0 0 5px ${color}88`,
        }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', width: 42, textAlign: 'right' }}>
        {score.toFixed(1)}%
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  Main drawer
// ══════════════════════════════════════════════════════
export function InspectorDrawer() {
  const selectedCluster = useAppStore(s => s.selectedCluster);
  const setSelectedCluster = useAppStore(s => s.setSelectedCluster);

  if (!selectedCluster) return null;

  const c = selectedCluster;
  const clsId = c.primaryClass.id;
  const meta  = CLASS_META[clsId] ?? CLASS_META[0];
  const risk  = frpRisk(c.maxFrp);
  const scores = MODEL_SCORES[clsId] ?? MODEL_SCORES[0];
  const shapFeatures = SHAP_FEATURES[clsId] ?? SHAP_FEATURES[0];

  const latStr = `${Math.abs(c.lat).toFixed(4)}° ${c.lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(c.lon).toFixed(4)}° ${c.lon >= 0 ? 'E' : 'W'}`;

  return (
    <div id="inspector-drawer" style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '40%',
      height: '100vh',
      background: 'rgba(10, 10, 18, 0.97)',
      backdropFilter: 'blur(8px)',
      borderLeft: `1px solid ${meta.color}40`,
      zIndex: 990,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      overflowY: 'auto',
      boxShadow: `-8px 0 40px rgba(0,0,0,0.6)`,
      animation: 'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1)',
      willChange: 'transform',
      contain: 'layout style paint',
      backfaceVisibility: 'hidden',
      WebkitFontSmoothing: 'antialiased',
    }}>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%) translateZ(0); opacity: 0; }
          to   { transform: translateX(0) translateZ(0);    opacity: 1; }
        }
        #inspector-drawer {
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
      `}</style>

      {/* ── Top accent bar ── */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${meta.color}, ${meta.color}44)` }} />

      {/* ── Header ── */}
      <div style={{
        padding: '20px 24px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ClassIcon clsId={clsId} size={56} />
          <div>
            <div style={{ fontSize: 11, color: meta.color, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 3 }}>
              Thermal Event · Class {clsId}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', lineHeight: 1.15 }}>
              {meta.name}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
              {latStr} · {lonStr}
            </div>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={() => setSelectedCluster(null)}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 8,
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            fontSize: 18,
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >×</button>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* §1 – Overview pills */}
        <section>
          <SectionLabel>Overview</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <Pill label="Hotspots" value={c.totalHotspots} />
            <Pill label="Risk Level" value={risk.label} color={risk.color} />
            <Pill label="Elevation" value={c.elevation > 0 ? c.elevation : '—'} unit={c.elevation > 0 ? 'm' : ''} />
            <Pill label="Land Cover" value={c.landCover} />
            {c.source  && <Pill label="Sensor" value={c.source} />}
            {c.acqDate && <Pill label="Acquired" value={c.acqDate} />}
          </div>
        </section>

        {/* §2 – Fire Radiative Power */}
        <section>
          <SectionLabel>Fire Intensity (Himawari-9 + VIIRS)</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <BarRow label="Mean FRP" value={c.avgFrp}  max={Math.max(c.maxFrp, 200)} color={meta.color} unit=" MW" />
            <BarRow label="Peak FRP" value={c.maxFrp}  max={Math.max(c.maxFrp, 200)} color={risk.color}  unit=" MW" />
            <BarRow label="Avg Brightness"  value={c.avgBrightness} max={400} color="#60a5fa" unit=" K" />
            <BarRow label="Peak Brightness" value={c.maxBrightness} max={400} color="#93c5fd" unit=" K" />
          </div>
        </section>

        {/* §3 – Atmospheric trace gases (from master_2024_training.csv columns no2_column / so2_column) */}
        {(c.avgNo2 > 0 || c.avgSo2 > 0) && (
          <section>
            <SectionLabel>Atmospheric Trace Gases</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <BarRow label="NO₂ Column Density" value={c.avgNo2} max={1}  color="#a78bfa" unit=" mol/m²" />
              <BarRow label="SO₂ Column Density" value={c.avgSo2} max={1}  color="#fb923c" unit=" mol/m²" />
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
              Sentinel-5P / TROPOMI — 30-day smoothed column average
            </p>
          </section>
        )}

        {/* §4 – Hotspot composition breakdown (from w_c / a_c / i_c / fl_c / ac_c) */}
        {c.totalHotspots > 1 && (
          <section>
            <SectionLabel>Hotspot Composition</SectionLabel>
            <ClassBreakdownBar counts={c.classCounts} total={c.totalHotspots} />
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
              Sub-class counts per H3 hex — Phase 6 stacking ensemble predictions
            </p>
          </section>
        )}

        {/* §5 – Anomaly Detection (Z-score from emergency_accidental_alerts.json) */}
        <section>
          <SectionLabel>Anomaly Detection</SectionLabel>
          <div style={{
            background: c.isAnomaly ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.08)',
            border: `1px solid ${c.isAnomaly ? '#ef444488' : '#22c55e55'}`,
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}>
            <span style={{ fontSize: 28 }}>{c.isAnomaly ? '🔴' : '🟢'}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: c.isAnomaly ? '#f87171' : '#4ade80' }}>
                {c.isAnomaly ? 'Anomalous Spike Detected' : 'Within Normal Range'}
              </div>
              {c.zScore !== null && (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
                  Z-score: <strong style={{ color: '#fff' }}>{c.zScore.toFixed(2)}σ</strong>
                  {c.isAnomaly && ' — exceeds 3σ threshold (Phase 7)'}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* §6 – Model confidence scores (from phase6_final_results.json per-class F1) */}
        <section>
          <SectionLabel>Model Pipeline Confidence</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <ModelRow label="XGBoost (P3)"   score={scores.xgb}   color={meta.color} />
            <ModelRow label="1D-CNN (P4)"     score={scores.cnn}   color="#60a5fa"  />
            <ModelRow label="ResNet-18 (P5)"  score={scores.resnet} color="#a78bfa" />
            <ModelRow label="Ensemble (P6)"   score={scores.stack}  color="#4ade80" />
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
            Per-class F1 scores · Stacking meta-model fuses 15 probability outputs
          </p>
        </section>

        {/* §7 – SHAP top drivers */}
        <section>
          <SectionLabel>Key Decision Factors (SHAP)</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {shapFeatures.map((feat, i) => (
              <div key={feat} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 8,
                padding: '8px 12px',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: `${meta.color}22`,
                  border: `1px solid ${meta.color}66`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: meta.color, flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{feat}</span>
                {/* diminishing importance bar */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                  {[4,3,2,1].map(n => (
                    <div key={`${feat}-${n}`} style={{
                      width: 4, height: 4 + (4 - n) * 3,
                      borderRadius: 2,
                      background: n <= 4 - i ? meta.color : 'rgba(255,255,255,0.12)',
                      alignSelf: 'flex-end',
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
            Shapley values — log-odds contribution · shap_explainability_summary.json
          </p>
        </section>

        {/* §8 – Data provenance */}
        <section style={{ marginBottom: 8 }}>
          <SectionLabel>Data Sources</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { dot: '#ef4444', label: 'master_2024_training.csv', desc: '13 tabular features · 2024 fire season' },
              { dot: '#60a5fa', label: 'Himawari-9',               desc: '10-min cadence thermal time-series (1D-CNN)' },
              { dot: '#a78bfa', label: 'ESA WorldCover 10m',        desc: 'Land-cover tiles · ResNet-18 spatial model' },
              { dot: '#4ade80', label: 'Sentinel-5P / TROPOMI',     desc: 'NO₂ · SO₂ atmospheric columns' },
            ].map(src => (
              <div key={src.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: src.dot, marginTop: 4, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{src.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{src.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

// ── Helper ──
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.38)',
      marginBottom: 10,
      marginTop: 0,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      paddingBottom: 6,
    }}>
      {children}
    </h3>
  );
}
