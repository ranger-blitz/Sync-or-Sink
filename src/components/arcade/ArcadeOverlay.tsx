import type { FC, ReactNode } from 'react';

type ArcadeOverlayProps = {
  title: string;
  onBack: () => void;
  children: ReactNode;
};

export const ArcadeOverlay: FC<ArcadeOverlayProps> = ({ title, onBack, children }) => (
  <div
    className="absolute inset-0 z-40 flex flex-col bg-black font-mono"
    onPointerDown={(event) => event.stopPropagation()}
  >
    <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
      <button
        onClick={onBack}
        className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-white hover:bg-white/10"
      >
        ← Back
      </button>
      <h2 className="text-sm font-black tracking-[0.25em] text-white">{title.toUpperCase()}</h2>
    </div>

    <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
  </div>
);