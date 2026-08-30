import type { ComponentType } from 'react';

type IconComponent = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

interface StripButtonProps {
  icon: IconComponent;
  label: string;
  active?: boolean;
  onClick: () => void;
  /** Which side of the strip the button lives on — determines tooltip direction. */
  side: 'left' | 'right';
}

/** Icon-only strip button (Rule 5: no persistent text labels) with a minimal
 *  300ms-delay tooltip. Tooltips point away from the screen edge. */
export function StripButton({ icon: Icon, label, active = false, onClick, side }: StripButtonProps) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        aria-label={label}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-150 ${
          active
            ? 'bg-white/[0.08] text-orange-500'
            : 'text-slate-400 hover:bg-white/[0.08] hover:text-slate-50'
        }`}
      >
        <Icon size={16} strokeWidth={1.5} />
      </button>
      <span
        className={`absolute top-1/2 -translate-y-1/2 z-50 px-2 py-1 text-xs text-white bg-slate-800 rounded-md whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity delay-300 ${
          side === 'right' ? 'left-full ml-3' : 'right-full mr-3'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
