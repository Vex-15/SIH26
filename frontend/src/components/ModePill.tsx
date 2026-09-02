import { useAppStore } from '../store/useAppStore';
import type { MapMode } from '../store/useAppStore';

const MODES: { id: MapMode; label: string }[] = [
  { id: 'thermal', label: 'Thermal' },
  { id: 'optical', label: 'Optical' },
  { id: 'radar',   label: 'Radar'   },
];

export function ModePill() {
  const { mapMode, setMapMode } = useAppStore();

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 80,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        background: 'var(--neu-base)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        boxShadow: 'var(--neu-shadow-out-sm)',
        borderRadius: 'var(--r-full)',
        padding: 3,
        gap: 2,
        border: '1px solid var(--border-subtle)',
      }}
    >
      {MODES.map(({ id, label }) => {
        const isActive = mapMode === id;
        return (
          <button
            key={id}
            onClick={() => setMapMode(id)}
            style={{
              padding: '4px 14px',
              borderRadius: 'var(--r-full)',
              border: '1px solid',
              borderColor: isActive ? 'var(--border-subtle)' : 'transparent',
              cursor: id === 'thermal' ? 'default' : 'pointer',
              background: isActive ? 'var(--neu-base-raised)' : 'transparent',
              color: isActive ? 'var(--neu-text-strong)' : 'var(--neu-text)',
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              fontWeight: isActive ? 600 : 400,
              letterSpacing: '-0.01em',
              transition: 'all 0.15s ease',
              outline: 'none',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
