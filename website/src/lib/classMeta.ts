/** Single source of truth for fire-class presentation metadata.
 *  Colors are data-encoding (redesign.md Rule 7) — never change them for chrome. */

export const CLASS_COLORS: Record<number, string> = {
  0: '#10b981', // Wildfire (Green)
  1: '#22c55e', // Agricultural (Lime)
  2: '#f59e0b', // Industrial Persistent (Amber)
  3: '#8b5cf6', // Gas Flare (Purple)
  4: '#ef4444'  // Accidental Fire (Red)
};

export const CLASS_NAMES: Record<number, string> = {
  0: 'Wildfire',
  1: 'Agricultural',
  2: 'Industrial Persistent',
  3: 'Gas Flare',
  4: 'Accidental Fire'
};

/** Display order for filter panels (most critical first). */
export const FILTER_CLASS_IDS: readonly number[] = [4, 2, 3, 1, 0];
