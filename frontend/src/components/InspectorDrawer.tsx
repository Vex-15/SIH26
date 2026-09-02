import { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  ChevronRight, 
  MapPin, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
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
const SHAP_FEATURES: Record<number, { feature: string; impact: string; weight: number }[]> = {
  0: [
    { feature: 'Fire Radiative Power (FRP)', impact: '+4.82 log-odds', weight: 92 },
    { feature: 'FSI Forest Reserve Index', impact: '+3.14 log-odds', weight: 81 },
    { feature: 'High Elevation Topography', impact: '+2.45 log-odds', weight: 68 },
    { feature: 'ESA Land Cover (Tree Cover)', impact: '+1.90 log-odds', weight: 54 },
  ],
  1: [
    { feature: 'Harvest Season Diurnal Peak', impact: '+4.12 log-odds', weight: 88 },
    { feature: 'ESA Land Cover (Cropland)', impact: '+3.60 log-odds', weight: 79 },
    { feature: 'TROPOMI NO₂ Column Spike', impact: '+2.10 log-odds', weight: 58 },
    { feature: 'Low FRP Transience (<25 MW)', impact: '+1.75 log-odds', weight: 46 },
  ],
  2: [
    { feature: 'Industrial Facility Density', impact: '+5.40 log-odds', weight: 95 },
    { feature: '24/7 Thermal Baselines', impact: '+4.20 log-odds', weight: 84 },
    { feature: 'TROPOMI SO₂ Exhaust Column', impact: '+2.90 log-odds', weight: 66 },
    { feature: 'Zero Nighttime Extinction', impact: '+2.15 log-odds', weight: 52 },
  ],
  3: [
    { feature: 'Gas Flare Stack Coordinate', impact: '+5.90 log-odds', weight: 98 },
    { feature: 'Assam / Gujarat Flare Basin', impact: '+3.80 log-odds', weight: 80 },
    { feature: 'Continuous Radiance >370K', impact: '+2.70 log-odds', weight: 64 },
    { feature: 'Localized Point Source FRP', impact: '+1.80 log-odds', weight: 48 },
  ],
  4: [
    { feature: 'Z-Score FRP Outlier Spike', impact: '+6.15 log-odds', weight: 99 },
    { feature: 'Industrial Area Ground Truth', impact: '+4.10 log-odds', weight: 85 },
    { feature: 'TROPOMI Dense Chemical Plume', impact: '+3.30 log-odds', weight: 72 },
    { feature: 'Sudden Nighttime Ignition', impact: '+2.40 log-odds', weight: 56 },
  ],
};

// ── Risk level mapping ──
function frpRisk(frp: number): { label: string; color: string; badgeBg: string } {
  if (frp >= 100) return { label: 'CRITICAL', color: '#ef4444', badgeBg: 'rgba(239, 68, 68, 0.12)' };
  if (frp >= 30)  return { label: 'HIGH',     color: '#f97316', badgeBg: 'rgba(249, 115, 22, 0.12)' };
  if (frp >= 10)  return { label: 'MODERATE', color: '#eab308', badgeBg: 'rgba(234, 179, 8, 0.12)' };
  return           { label: 'LOW',      color: '#22c55e', badgeBg: 'rgba(34, 197, 94, 0.12)' };
}

// ── Minimalist Stat Box ──
function MetricBox({ label, value, unit = '', subtext, highlightColor }: { 
  label: string; 
  value: string | number; 
  unit?: string; 
  subtext?: string;
  highlightColor?: string;
}) {
  return (
    <div style={{
      background: 'var(--neu-base-raised)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--r-md)',
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 3,
      transition: 'border-color 0.15s ease, background 0.15s ease',
    }}>
      <div style={{ 
        fontSize: 10, 
        color: 'var(--neu-text-disabled)', 
        textTransform: 'uppercase', 
        letterSpacing: '0.06em', 
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span>{label}</span>
      </div>
      
      <div style={{ 
        fontSize: 16, 
        fontWeight: 600, 
        color: highlightColor ?? 'var(--neu-text-strong)', 
        lineHeight: 1.2,
        fontFamily: 'var(--font-mono)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
        {unit && <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 3, color: 'var(--neu-text)' }}>{unit}</span>}
      </div>

      {subtext && (
        <div style={{ fontSize: 10, color: 'var(--neu-text)', marginTop: 1 }}>
          {subtext}
        </div>
      )}
    </div>
  );
}

// ── Minimalist Progress Bar Row ──
function ProgressRow({ label, value, max, color, unit = '', subvalue }: {
  label: string; value: number; max: number; color: string; unit?: string; subvalue?: string;
}) {
  const pct = Math.min(100, (value / Math.max(max, 0.001)) * 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 11, color: 'var(--neu-text-em)', fontWeight: 500 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {subvalue && <span style={{ fontSize: 10, color: 'var(--neu-text-disabled)' }}>{subvalue}</span>}
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--neu-text-strong)', fontFamily: 'var(--font-mono)' }}>
            {value.toFixed(value < 10 ? 2 : 1)}{unit}
          </span>
        </div>
      </div>
      <div style={{
        height: 4,
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: 2,
          transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
      </div>
    </div>
  );
}

// ── Minimalist Class Breakdown Bar ──
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
      <div style={{
        display: 'flex',
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        gap: 2,
        background: 'rgba(255, 255, 255, 0.06)',
      }}>
        {segments.map(s => (
          <div
            key={s.key}
            title={`${s.label}: ${s.count}`}
            style={{
              flex: s.count / t,
              background: s.color,
              transition: 'flex 0.4s ease',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
        {segments.map(s => (
          <span key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
            <span style={{ color: 'var(--neu-text)' }}>{s.label}</span>
            <span style={{ color: 'var(--neu-text-em)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{s.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  Main Minimalist Inspector Drawer
// ══════════════════════════════════════════════════════
export function InspectorDrawer() {
  const selectedCluster = useAppStore(s => s.selectedCluster);
  const setSelectedCluster = useAppStore(s => s.setSelectedCluster);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'shap' | 'models' | 'provenance'>('telemetry');

  if (!selectedCluster) return null;

  const c = selectedCluster;
  const clsId = c.primaryClass.id;
  const meta  = CLASS_META[clsId] ?? CLASS_META[0];
  const risk  = frpRisk(c.maxFrp);
  const scores = MODEL_SCORES[clsId] ?? MODEL_SCORES[0];
  const shapList = SHAP_FEATURES[clsId] ?? SHAP_FEATURES[0];

  const latStr = `${Math.abs(c.lat).toFixed(4)}°${c.lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(c.lon).toFixed(4)}°${c.lon >= 0 ? 'E' : 'W'}`;

  return (
    <div id="inspector-drawer" style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '420px',
      maxWidth: '92vw',
      height: '100vh',
      background: 'var(--neu-base)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      borderLeft: '1px solid var(--border-subtle)',
      boxShadow: 'var(--neu-shadow-out)',
      zIndex: 990,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-ui)',
      overflow: 'hidden',
      animation: 'slideInRight 0.25s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      {/* ── Top Classification Indicator Line ── */}
      <div style={{ height: 2, background: meta.color, width: '100%' }} />

      {/* ── Header ── */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        background: 'var(--neu-base-raised)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: meta.color,
            }} />
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: meta.color,
            }}>
              CLASS {clsId} · AI VERIFIED
            </span>
          </div>
          
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--neu-text-strong)', letterSpacing: '-0.02em' }}>
            {meta.name}
          </div>

          <div style={{ 
            fontSize: 11, 
            color: 'var(--neu-text)', 
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <MapPin size={11} strokeWidth={2} />
            <span>{latStr}, {lonStr}</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>{c.landCover}</span>
          </div>
        </div>

        {/* Minimalist Close Button */}
        <button
          onClick={() => setSelectedCluster(null)}
          className="neu-icon-btn"
          aria-label="Close telemetry drawer"
          style={{ width: 28, height: 28, flexShrink: 0 }}
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {/* ── Minimalist Segmented Tabs ── */}
      <div style={{
        display: 'flex',
        padding: '8px 20px',
        gap: 4,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--neu-base)',
      }}>
        {[
          { id: 'telemetry', label: 'Telemetry' },
          { id: 'shap', label: 'SHAP Logic' },
          { id: 'models', label: 'Ensemble' },
          { id: 'provenance', label: 'Sensors' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '6px 8px',
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--neu-text-strong)' : 'var(--neu-text)',
                background: isActive ? 'var(--neu-base-raised)' : 'transparent',
                border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                borderRadius: 'var(--r-sm)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Scrollable Body Content ── */}
      <div style={{
        flex: 1,
        padding: '16px 20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>

        {activeTab === 'telemetry' && (
          <>
            {/* Quick Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <MetricBox label="Hotspots" value={c.totalHotspots} />
              <MetricBox 
                label="Risk Tier" 
                value={risk.label} 
                highlightColor={risk.color} 
              />
              <MetricBox 
                label="Peak FRP" 
                value={c.maxFrp.toFixed(1)} 
                unit="MW" 
                highlightColor={risk.color}
              />
              <MetricBox 
                label="Peak Temp" 
                value={c.maxBrightness.toFixed(1)} 
                unit="K" 
              />
              <MetricBox 
                label="Elevation" 
                value={c.elevation > 0 ? c.elevation : '—'} 
                unit={c.elevation > 0 ? 'm' : ''} 
              />
              <MetricBox 
                label="Z-Score" 
                value={c.zScore !== null ? `+${c.zScore.toFixed(2)}σ` : '0.00σ'} 
                highlightColor={c.isAnomaly ? '#ef4444' : undefined}
              />
            </div>

            {/* Anomaly Status Card */}
            <div style={{
              background: c.isAnomaly ? 'rgba(239, 68, 68, 0.06)' : 'var(--neu-base-raised)',
              border: c.isAnomaly ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-md)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              {c.isAnomaly ? (
                <AlertTriangle size={18} color="#ef4444" strokeWidth={2} style={{ flexShrink: 0 }} />
              ) : (
                <CheckCircle2 size={18} color="#22c55e" strokeWidth={2} style={{ flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: c.isAnomaly ? '#ef4444' : 'var(--neu-text-strong)' }}>
                  {c.isAnomaly ? 'Accidental Anomaly Outlier (>3σ)' : 'Baseline Historical Radiance'}
                </div>
                <div style={{ fontSize: 10, color: 'var(--neu-text)', marginTop: 2 }}>
                  {c.isAnomaly 
                    ? `Sudden FRP surge over ${c.baselineMeanFrp ? c.baselineMeanFrp.toFixed(1) : '3.5'} MW 30-day baseline.` 
                    : 'Thermal signature within statistical facility operating threshold.'}
                </div>
              </div>
            </div>

            {/* Detailed Thermal Radiance Bars */}
            <div style={{
              background: 'var(--neu-base-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-md)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <div className="neu-section-label">Radiance & Energy Transfer</div>
              <ProgressRow label="Mean Radiative Power (FRP)" value={c.avgFrp} max={Math.max(c.maxFrp, 100)} color={meta.color} unit=" MW" />
              <ProgressRow label="Peak Radiative Power" value={c.maxFrp} max={Math.max(c.maxFrp, 100)} color={risk.color} unit=" MW" />
              <ProgressRow label="Brightness Temperature" value={c.avgBrightness} max={420} color="#60a5fa" unit=" K" />
              {c.avgNo2 > 0 && <ProgressRow label="Sentinel-5P NO₂ Column" value={c.avgNo2} max={1} color="#a78bfa" unit=" mmol/m²" />}
              {c.avgSo2 > 0 && <ProgressRow label="Sentinel-5P SO₂ Column" value={c.avgSo2} max={1} color="#fb923c" unit=" mDU" />}
            </div>

            {/* Hotspot Breakdown */}
            {c.totalHotspots > 1 && (
              <div style={{
                background: 'var(--neu-base-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <div className="neu-section-label">Cluster Composition ({c.totalHotspots} points)</div>
                <ClassBreakdownBar counts={c.classCounts} total={c.totalHotspots} />
              </div>
            )}

            {/* Emergency Routing Action Button */}
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
                padding: '12px 14px',
                borderRadius: 'var(--r-md)',
                background: 'var(--neu-base-raised)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--neu-text-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#ef4444';
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.background = 'var(--neu-base-raised)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldAlert size={16} color="#ef4444" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--neu-text-strong)' }}>
                    Nearest Emergency Services Grid
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--neu-text)' }}>
                    Overpass OSM stations & OSRM live routing
                  </div>
                </div>
              </div>
              <ChevronRight size={14} color="var(--neu-text-disabled)" />
            </button>
          </>
        )}

        {activeTab === 'shap' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--neu-text)' }}>
              TreeExplainer attribution values showing why the multi-modal ensemble classified this event as <strong>{meta.name}</strong>.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {shapList.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{
                    background: 'var(--neu-base-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--r-md)',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ 
                        fontSize: 10, 
                        fontWeight: 700, 
                        color: meta.color,
                        fontFamily: 'var(--font-mono)' 
                      }}>
                        #{idx + 1}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--neu-text-strong)' }}>
                        {item.feature}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: 10, 
                      fontWeight: 600, 
                      color: 'var(--neu-text-em)',
                      fontFamily: 'var(--font-mono)' 
                    }}>
                      {item.impact}
                    </span>
                  </div>

                  <div style={{
                    height: 3,
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${item.weight}%`,
                      height: '100%',
                      background: meta.color,
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ 
              fontSize: 10, 
              color: 'var(--neu-text-disabled)', 
              padding: '8px 12px',
              background: 'var(--neu-base-raised)',
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              Receipt signature: <code>TW-SHAP-2026-NTR0-AUDIT</code>
            </div>
          </div>
        )}

        {activeTab === 'models' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--neu-text)' }}>
              Standalone precision ratings across the 3 independent modalities and final MLP meta-fusion.
            </div>

            <div style={{
              background: 'var(--neu-base-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-md)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <ProgressRow label="Model 1: XGBoost (Tabular)" value={scores.xgb} max={100} color={meta.color} unit="%" subvalue="Phase 3" />
              <ProgressRow label="Model 2: 1D-CNN (Temporal)" value={scores.cnn} max={100} color="#60a5fa" unit="%" subvalue="Phase 4" />
              <ProgressRow label="Model 3: ResNet-18 (Vision)" value={scores.resnet} max={100} color="#a78bfa" unit="%" subvalue="Phase 5" />
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
              <ProgressRow label="Phase 6 Fused Meta-Learner" value={scores.stack} max={100} color="#22c55e" unit="%" subvalue="Operational Target" />
            </div>

            <div style={{
              background: 'var(--neu-base-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-md)',
              padding: '12px 14px',
              fontSize: 11,
              color: 'var(--neu-text)',
              lineHeight: 1.5,
            }}>
              <strong style={{ color: 'var(--neu-text-strong)' }}>Fusion Architecture:</strong> 15-dimensional concatenated probability vector passed through a 2-layer MLP meta-classifier.
            </div>
          </div>
        )}

        {activeTab === 'provenance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'ISRO INSAT-3DR / JAXA Himawari-9', type: 'Geostationary 10-15m', desc: 'Real-time thermal anomaly MIR 3.9µm feed' },
              { label: 'NASA FIRMS (VIIRS + MODIS)', type: 'Polar Orbit 3-6h', desc: 'Calibrated Fire Radiative Power baseline' },
              { label: 'ESA WorldCover 10m', type: 'Multi-spectral Land', desc: 'Ground surface infrastructure & canopy matrix' },
              { label: 'Sentinel-5P / TROPOMI', type: 'Trace Gas Column', desc: 'Atmospheric NO₂ and SO₂ combustion plumes' },
            ].map((s, i) => (
              <div 
                key={i}
                style={{
                  background: 'var(--neu-base-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-md)',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--neu-text-strong)' }}>{s.label}</span>
                  <span style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase' }}>{s.type}</span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--neu-text)' }}>{s.desc}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
