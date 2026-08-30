import { Flame } from 'lucide-react';

/** Zone 1: brand strip. Simplicity Rules — wordmark + pulsing live count only.
 *  No subtitle (lives in the Info card), no badge chrome, no glow. */
export function TopBrand({ count }: { count: number }) {
  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2.5 pointer-events-none select-none">
      <Flame className="w-6 h-6 text-orange-500" strokeWidth={1.5} />
      <span className="text-white font-semibold text-sm tracking-tight">THERMALWATCH AI</span>
      <span className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
        </span>
        {count}
      </span>
    </div>
  );
}
