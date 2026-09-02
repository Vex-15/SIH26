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
    0: (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        <path
          d="M32 56 C14 56 10 42 18 30 C18 30 22 38 28 36 C20 26 26 12 32 8 C32 8 30 22 36 26 C42 18 44 30 40 36 C46 38 50 30 50 30 C58 42 50 56 32 56Z"
          fill={meta.color} opacity="0.9"
        />
        <ellipse cx="32" cy="48" rx="10" ry="5" fill="#fbbf24" opacity="0.6" />
      </svg>
    ),
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
    <div>
      {icons[clsId] ?? icons[0]}
    </div>
  );
}

// ── Neumorphic stat pill ──
function Pill({ label, value, unit = '', color }: { label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <div style={{
      /* Neumorphic inset pill */
      background: 'var(--neu-base)',
      boxShadow: 'var(--neu-shadow-in-sm)',
      borderRadius: 'var(--r-sm)',
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      border: 'none',
    }}>
      <span style={{ fontSize: 10, color: 'var(--neu-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
        {label}
      </span>
      <span style={{ fontSize: 17, fontWeight: 700, color: color ?? 'var(--neu-text-strong)', lineHeight: 1.1 }}>
        {value}
        {unit && <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 3, color: 'var(--neu-text)' }}>{unit}</span>}
      </span>
    </div>
  );
}

// ── Neumorphic bar row ──
function BarRow({ label, value, max, color, unit = '' }: {
  label: string; value: number; max: number; color: string; unit?: string;
}) {
  const pct = Math.min(100, (value / Math.max(max, 0.001)) * 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, color: 'var(--neu-text)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--neu-text-em)' }}>
          {value.toFixed(value < 10 ? 2 : 1)}{unit}
        </span>
      </div>
      {/* Inset trough */}
      <div style={{
        height: 7,
        background: 'var(--neu-base)',
        boxShadow: 'var(--neu-shadow-in-sm)',
        borderRadius: 4,
        overflow: 'hidden',
        border: 'none',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: 4,
          transition: 'width 0.6s ease',
          boxShadow: `0 0 8px ${color}88`,
        }} />
      </div>
    </div>
  );
}

// ── Class breakdown mini-bar ──
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
      {/* Neumorphic inset stacked bar */}
      <div style={{
        display: 'flex',
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
        gap: 1,
        background: 'var(--neu-base)',
        boxShadow: 'var(--neu-shadow-in-sm)',
        padding: 1,
      }}>
        {segments.map(s => (
          <div
            key={s.key}
            title={`${s.label}: ${s.count}`}
            style={{
              flex: s.count / t,
              background: s.color,
              transition: 'flex 0.5s ease',
              borderRadius: 3,
            }}
          />
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 12px' }}>
        {segments.map(s => (
          <span key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: 'inline-block', boxShadow: `0 0 5px ${s.color}88` }} />
            <span style={{ color: 'var(--neu-text)' }}>{s.label}</span>
            <span style={{ color: 'var(--neu-text-em)', fontWeight: 600 }}>{s.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Model confidence row ──
function ModelRow({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 11, color: 'var(--neu-text)', width: 110, flexShrink: 0 }}>{label}</span>
      <div style={{
        flex: 1,
        height: 6,
        background: 'var(--neu-base)',
        boxShadow: 'var(--neu-shadow-in-sm)',
        borderRadius: 3,
        overflow: 'hidden',
        border: 'none',
      }}>
        <div style={{
          width: `${score}%`, height: '100%', background: color,
          borderRadius: 3, boxShadow: `0 0 6px ${color}88`,
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--neu-text-em)', width: 44, textAlign: 'right' }}>
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
      width: '38%',
      height: '100vh',
      /* Neumorphic panel — elevated off the map background */
      background: 'var(--neu-base)',
      boxShadow: '-8px 0 40px var(--neu-dark), -2px 0 0 var(--neu-dark)',
      border: 'none',
      zIndex: 990,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-ui)',
      overflowY: 'auto',
      animation: 'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1)',
      willChange: 'transform',
      contain: 'layout style paint',
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
      `}</style>

      {/* ── Top accent bar ── */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${meta.color}, ${meta.color}22)` }} />

      {/* ── Header ── */}
      <div style={{
        padding: '20px 24px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        /* Neumorphic bottom divider */
        boxShadow: '0 2px 6px var(--neu-dark)',
      }}>
        {/* Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ClassIcon clsId={clsId} size={52} />
          <div>
            <div style={{
              fontSize: 10,
              color: meta.color,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: 3,
            }}>
              Thermal Event · Class {clsId}
            </div>
            <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--neu-text-strong)', lineHeight: 1.15 }}>
              {meta.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--neu-text)', marginTop: 2 }}>
              {latStr} · {lonStr}
            </div>
          </div>
        </div>

        {/* Neumorphic close button */}
        <button
          onClick={() => setSelectedCluster(null)}
          style={{
            background: 'var(--neu-base)',
            boxShadow: 'var(--neu-shadow-out-sm)',
            border: 'none',
            borderRadius: '50%',
            color: 'var(--neu-text)',
            cursor: 'pointer',
            fontSize: 16,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'box-shadow 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = 'var(--neu-shadow-in-sm)';
            e.currentTarget.style.color = 'var(--neu-text-strong)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = 'var(--neu-shadow-out-sm)';
            e.currentTarget.style.color = 'var(--neu-text)';
          }}
        >×</button>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* §1 – Overview pills */}
        <section>
          <SectionLabel>Overview</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
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
          <div style={{
            background: 'var(--neu-base)',
            boxShadow: 'var(--neu-shadow-out-sm)',
            borderRadius: 'var(--r-md)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <BarRow label="Mean FRP" value={c.avgFrp}  max={Math.max(c.maxFrp, 200)} color={meta.color} unit=" MW" />
            <BarRow label="Peak FRP" value={c.maxFrp}  max={Math.max(c.maxFrp, 200)} color={risk.color}  unit=" MW" />
            <BarRow label="Avg Brightness"  value={c.avgBrightness} max={400} color="#60a5fa" unit=" K" />
            <BarRow label="Peak Brightness" value={c.maxBrightness} max={400} color="#93c5fd" unit=" K" />
          </div>
        </section>

        {/* §3 – Atmospheric trace gases */}
        {(c.avgNo2 > 0 || c.avgSo2 > 0) && (
          <section>
            <SectionLabel>Atmospheric Trace Gases</SectionLabel>
            <div style={{
              background: 'var(--neu-base)',
              boxShadow: 'var(--neu-shadow-out-sm)',
              borderRadius: 'var(--r-md)',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <BarRow label="NO₂ Column Density" value={c.avgNo2} max={1}  color="#a78bfa" unit=" mol/m²" />
              <BarRow label="SO₂ Column Density" value={c.avgSo2} max={1}  color="#fb923c" unit=" mol/m²" />
            </div>
            <p style={{ fontSize: 10, color: 'var(--neu-text-disabled)', marginTop: 7 }}>
              Sentinel-5P / TROPOMI — 30-day smoothed column average
            </p>
          </section>
        )}

        {/* §4 – Hotspot composition breakdown */}
        {c.totalHotspots > 1 && (
          <section>
            <SectionLabel>Hotspot Composition</SectionLabel>
            <div style={{
              background: 'var(--neu-base)',
              boxShadow: 'var(--neu-shadow-out-sm)',
              borderRadius: 'var(--r-md)',
              padding: '14px 16px',
            }}>
              <ClassBreakdownBar counts={c.classCounts} total={c.totalHotspots} />
            </div>
            <p style={{ fontSize: 10, color: 'var(--neu-text-disabled)', marginTop: 7 }}>
              Sub-class counts per H3 hex — Phase 6 stacking ensemble predictions
            </p>
          </section>
        )}

        {/* §5 – Anomaly Detection */}
        <section>
          <SectionLabel>Anomaly Detection</SectionLabel>
          <div style={{
            background: 'var(--neu-base)',
            /* Inset if anomaly, elevated if normal */
            boxShadow: c.isAnomaly
              ? `var(--neu-shadow-in-sm), 0 0 16px rgba(239,68,68,0.2)`
              : `var(--neu-shadow-out-sm), 0 0 12px rgba(34,197,94,0.12)`,
            borderRadius: 'var(--r-md)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            border: 'none',
            transition: 'box-shadow 0.3s',
          }}>
            <span style={{ fontSize: 26 }}>{c.isAnomaly ? '🔴' : '🟢'}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.isAnomaly ? '#f87171' : '#4ade80' }}>
                {c.isAnomaly ? 'Anomalous Spike Detected' : 'Within Normal Range'}
              </div>
              {c.zScore !== null && (
                <div style={{ fontSize: 11, color: 'var(--neu-text)', marginTop: 3 }}>
                  Z-score: <strong style={{ color: 'var(--neu-text-em)' }}>{c.zScore.toFixed(2)}σ</strong>
                  {c.isAnomaly && ' — exceeds 3σ threshold (Phase 7)'}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* §5.5 – Feature 3: Nearest Emergency Services */}
        <section>
          <SectionLabel>Emergency Response Grid</SectionLabel>
          <button
            onClick={() => {
              const { setEmergencyServicesOpen, setActiveEmergencyIncident } = useAppStore.getState();
              setActiveEmergencyIncident({
                lat: c.lat,
                lon: c.lon,
                name: c.landCover ? `${c.landCover} Cluster` : undefined,
                frp: c.maxFrp,
                zScore: c.zScore ?? undefined,
                cls: c.primaryClass.id,
              });
              setEmergencyServicesOpen(true);
            }}
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: 'var(--r-md)',
              background: 'var(--neu-base)',
              /* Elevated neumorphic with red accent glow */
              boxShadow: 'var(--neu-shadow-out), 0 0 20px rgba(239,68,68,0.15)',
              border: 'none',
              color: 'var(--neu-text-em)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s, transform 0.1s',
              fontFamily: 'var(--font-ui)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = 'var(--neu-shadow-out-lg)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'var(--neu-shadow-out)';
            }}
            onMouseDown={e => {
              e.currentTarget.style.boxShadow = 'var(--neu-shadow-in)';
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={e => {
              e.currentTarget.style.boxShadow = 'var(--neu-shadow-out)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22 }}>🚒</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>
                  Find Nearest Fire & Trauma Centers
                </div>
                <div style={{ fontSize: 10, color: 'var(--neu-text)' }}>
                  OSM Overpass (25km) · OSRM Drive Routes & Live ETA
                </div>
              </div>
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#ef4444',
              background: 'var(--neu-base)',
              boxShadow: 'var(--neu-shadow-in-sm)',
              padding: '4px 9px',
              borderRadius: 'var(--r-sm)',
              border: 'none',
              letterSpacing: '0.06em',
            }}>
              GRID →
            </span>
          </button>
        </section>

        {/* §6 – Model confidence scores */}
        <section>
          <SectionLabel>Model Pipeline Confidence</SectionLabel>
          <div style={{
            background: 'var(--neu-base)',
            boxShadow: 'var(--neu-shadow-out-sm)',
            borderRadius: 'var(--r-md)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <ModelRow label="XGBoost (P3)"   score={scores.xgb}   color={meta.color} />
            <ModelRow label="1D-CNN (P4)"     score={scores.cnn}   color="#60a5fa"  />
            <ModelRow label="ResNet-18 (P5)"  score={scores.resnet} color="#a78bfa" />
            <ModelRow label="Ensemble (P6)"   score={scores.stack}  color="#4ade80" />
          </div>
          <p style={{ fontSize: 10, color: 'var(--neu-text-disabled)', marginTop: 7 }}>
            Per-class F1 scores · Stacking meta-model fuses 15 probability outputs
          </p>
        </section>

        {/* §7 – SHAP top drivers */}
        <section>
          <SectionLabel>Key Decision Factors (SHAP)</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {shapFeatures.map((feat, i) => (
              <div key={feat} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--neu-base)',
                boxShadow: 'var(--neu-shadow-out-sm)',
                borderRadius: 'var(--r-sm)',
                padding: '9px 12px',
                border: 'none',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--neu-base)',
                  boxShadow: 'var(--neu-shadow-in-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: meta.color, flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 12, color: 'var(--neu-text-em)' }}>{feat}</span>
                {/* Diminishing importance bars */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                  {[4,3,2,1].map(n => (
                    <div key={`${feat}-${n}`} style={{
                      width: 4,
                      height: 4 + (4 - n) * 3,
                      borderRadius: 2,
                      background: n <= 4 - i ? meta.color : 'var(--neu-dark)',
                      boxShadow: n <= 4 - i ? `var(--neu-shadow-in-sm)` : 'var(--neu-shadow-out-sm)',
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 10, color: 'var(--neu-text-disabled)', marginTop: 8 }}>
            Shapley values — log-odds contribution · shap_explainability_summary.json
          </p>
        </section>

        {/* §8 – Data provenance */}
        <section style={{ marginBottom: 8 }}>
          <SectionLabel>Data Sources</SectionLabel>
          <div style={{
            background: 'var(--neu-base)',
            boxShadow: 'var(--neu-shadow-out-sm)',
            borderRadius: 'var(--r-md)',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            {[
              { dot: '#ef4444', label: 'master_2024_training.csv', desc: '13 tabular features · 2024 fire season' },
              { dot: '#60a5fa', label: 'Himawari-9',               desc: '10-min cadence thermal time-series (1D-CNN)' },
              { dot: '#a78bfa', label: 'ESA WorldCover 10m',        desc: 'Land-cover tiles · ResNet-18 spatial model' },
              { dot: '#4ade80', label: 'Sentinel-5P / TROPOMI',     desc: 'NO₂ · SO₂ atmospheric columns' },
            ].map(src => (
              <div key={src.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: src.dot,
                  boxShadow: `0 0 6px ${src.dot}88`,
                  marginTop: 4, flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--neu-text-em)' }}>{src.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--neu-text)' }}>{src.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

// ── Section label helper ──
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--neu-text-disabled)',
      marginBottom: 10,
      marginTop: 0,
      paddingBottom: 0,
    }}>
      {children}
    </h3>
  );
}
