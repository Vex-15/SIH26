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
  { id: 'accidental',   label: 'Accidental',   hex: '#ff0000', dotColor: '#ff0000' },
];

export function LayersPopover() {
  const { 
    activeFilters, 
    toggleFilter, 
  } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: -14, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -14, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        left: 68,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 90,
        width: 250,
        background: 'rgba(18, 21, 28, 0.96)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 16,
        padding: '16px 18px 18px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.2)',
        userSelect: 'none',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Header matching Flow screenshot */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#ffffff',
            marginBottom: 3,
          }}
        >
          FIRE CLASS FILTER
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.45)',
          }}
        >
          1,372,035 anomalies · 5 classes
        </div>
      </div>

      {/* Class Rows matching Flow screenshot */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                padding: '3px 0',
              }}
            >
              {/* Left: Dot + Class Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: cls.dotColor,
                    display: 'inline-block',
                    flexShrink: 0,
                    boxShadow: `0 0 6px ${cls.dotColor}88`,
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {cls.label}
                </span>
              </div>

              {/* Center/Right: Hex Code + macOS Amber Toggle Switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    color: 'rgba(255, 255, 255, 0.4)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {cls.hex}
                </span>

                {/* Switch Capsule */}
                <div
                  style={{
                    width: 32,
                    height: 18,
                    borderRadius: 10,
                    background: isActive ? '#f97316' : 'rgba(255, 255, 255, 0.16)',
                    position: 'relative',
                    transition: 'background 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isActive ? '0 0 8px rgba(249, 115, 22, 0.4)' : 'none',
                    flexShrink: 0,
                  }}
                >
                  {/* Switch Thumb */}
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: '#ffffff',
                      position: 'absolute',
                      top: 2,
                      left: isActive ? 16 : 2,
                      transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
