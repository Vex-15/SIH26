import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import type { FireClass } from '../store/useAppStore';
import { Eye, EyeOff } from 'lucide-react';

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
      initial={{ opacity: 0, x: -10, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -10, scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        left: 72,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 90,
        width: 250,
        background: 'var(--neu-base)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        boxShadow: 'var(--neu-shadow-out)',
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '16px',
        userSelect: 'none',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--neu-text-disabled)',
          marginBottom: 2,
        }}>
          Fire Class Filter
        </div>
        <div style={{
          fontSize: 15,
          fontWeight: 700,
          color: 'var(--neu-text-strong)',
        }}>
          Event Layers
        </div>
        <div style={{
          fontSize: 11,
          color: 'var(--neu-text)',
          marginTop: 2,
        }}>
          1,372,035 anomalies · 5 classes
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border-subtle)', marginBottom: 12 }} />

      {/* Class Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                background: isActive ? 'var(--neu-base-raised)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'var(--border-subtle)' : 'transparent',
                borderRadius: 'var(--r-sm)',
                padding: '8px 10px',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Left: Dot + Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: isActive ? cls.dotColor : 'var(--neu-text-disabled)',
                  display: 'inline-block',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }} />
                <span style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: isActive ? 'var(--neu-text-strong)' : 'var(--neu-text)',
                  transition: 'color 0.15s ease',
                }}>
                  {cls.label}
                </span>
              </div>

              {/* Right: Toggle status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  color: isActive ? cls.dotColor : 'var(--neu-text-disabled)',
                  opacity: isActive ? 1 : 0.4,
                }}>
                  {cls.hex}
                </span>
                {isActive ? (
                  <Eye size={13} color="var(--neu-text)" />
                ) : (
                  <EyeOff size={13} color="var(--neu-text-disabled)" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
