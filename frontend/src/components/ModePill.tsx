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
        top: 24,
        right: 88,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        /* Neumorphic inset trough container */
        background: 'var(--neu-base)',
        boxShadow: 'var(--neu-shadow-in-sm)',
        borderRadius: 'var(--r-full)',
        padding: 5,
        gap: 4,
        border: 'none',
      }}
    >
      {MODES.map(({ id, label }) => {
        const isActive = mapMode === id;
        return (
          <button
            key={id}
            onClick={() => setMapMode(id)}
            style={{
              padding: '5px 16px',
              borderRadius: 'var(--r-full)',
              border: 'none',
              cursor: id === 'thermal' ? 'default' : 'pointer',
              /* Active segment = elevated neumorphic pill */
              background: 'var(--neu-base)',
              boxShadow: isActive ? 'var(--neu-shadow-out-sm)' : 'none',
              color: isActive ? 'var(--neu-text-strong)' : 'var(--neu-text-disabled)',
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              fontWeight: isActive ? 600 : 400,
              transition: 'color 0.2s, box-shadow 0.2s',
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
