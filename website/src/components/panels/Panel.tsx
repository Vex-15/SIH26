import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface PanelProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Shared shell for left-strip expanded panels (Rule 4: slide in from the left,
 *  280px wide, glass background per Rule 6). */
export function Panel({ title, onClose, children }: PanelProps) {
  return (
    <div className="fixed top-1/2 left-[72px] -translate-y-1/2 z-40 w-[280px] max-h-[70vh] flex flex-col rounded-xl floating-glass animate-panel-in-left">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-3 border-b border-white/[0.08] shrink-0">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <button
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto">{children}</div>
    </div>
  );
}
