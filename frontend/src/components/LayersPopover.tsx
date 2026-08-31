import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import type { FireClass } from '../store/useAppStore';

interface ClassRowConfig {
  id: FireClass;
  label: string;
  hex: string;
  dotColor: string;
}

const FIRE_CLASSES: ClassRowConfig[] = [
  { id: 'wildfire',     label: 'Wildfire',     hex: '#ef4444', dotColor: '#ef4444' },
  { id: 'agricultural', label: 'Agricultural', hex: '#f97316', dotColor: '#f97316' },
  { id: 'industrial',   label: 'Industrial',   hex: '#a855f7', dotColor: '#a855f7' },
  { id: 'gasflare',     label: 'Gas Flare',    hex: '#eab308', dotColor: '#eab308' },
  { id: 'accidental',   label: 'Accidental',   hex: '#ff4444', dotColor: '#ff4444' },
];

export function LayersPopover() {
  const { activeFilters, toggleFilter } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: -14, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -14, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        left: 72,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 90,
        width: 260,
        /* Neumorphic elevated panel */
        background: 'var(--neu-base)',
        boxShadow: 'var(--neu-shadow-out-lg)',
        borderRadius: 'var(--r-lg)',
        border: 'none',
        padding: '20px 20px 22px',
        userSelect: 'none',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--neu-text-disabled)',
          marginBottom: 4,
        }}>
          Fire Class Filter
        </div>
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--neu-text-strong)',
          lineHeight: 1.2,
        }}>
          Event Layers
        </div>
        <div style={{
          fontSize: 11,
          fontWeight: 400,
          color: 'var(--neu-text)',
          marginTop: 4,
        }}>
          1,372,035 anomalies · 5 classes
        </div>
      </div>

      {/* Divider inset line */}
      <div style={{
        height: 1,
        background: 'transparent',
        boxShadow: 'inset 0 1px 2px var(--neu-dark), inset 0 -1px 1px var(--neu-light)',
        borderRadius: 1,
        marginBottom: 16,
      }} />

      {/* Class Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {FIRE_CLASSES.map((cls) => {
          const isActive = activeFilters[cls.id];
          return (
            <div
              key={cls.id}
              onClick={() => toggleFilter(cls.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                /* Neumorphic row card */
                background: 'var(--neu-base)',
                boxShadow: isActive
                  ? 'var(--neu-shadow-in-sm)'
                  : 'var(--neu-shadow-out-sm)',
                borderRadius: 'var(--r-sm)',
                padding: '10px 12px',
                transition: 'box-shadow 0.2s ease',
              }}
            >
              {/* Left: Dot + Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: isActive ? cls.dotColor : 'var(--neu-text-disabled)',
                  display: 'inline-block',
                  flexShrink: 0,
                  boxShadow: isActive ? `0 0 8px ${cls.dotColor}88` : 'none',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }} />
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: isActive ? 'var(--neu-text-strong)' : 'var(--neu-text)',
                  transition: 'color 0.2s ease',
                }}>
                  {cls.label}
                </span>
              </div>

              {/* Right: Hex + Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  color: isActive ? cls.dotColor : 'var(--neu-text-disabled)',
                  letterSpacing: '0.02em',
                  transition: 'color 0.2s',
                }}>
                  {cls.hex}
                </span>

                {/* Neumorphic toggle */}
                <div className={`neu-toggle-track ${isActive ? 'on' : ''}`}
                  style={{ '--accent': cls.dotColor } as React.CSSProperties}>
                  <div className="neu-toggle-thumb" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div style={{
        marginTop: 14,
        fontSize: 10,
        color: 'var(--neu-text-disabled)',
        textAlign: 'center',
        letterSpacing: '0.04em',
      }}>
        Click rows to toggle visibility
      </div>
    </motion.div>
  );
}
