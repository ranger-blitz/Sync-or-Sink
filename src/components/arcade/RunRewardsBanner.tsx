import type { FC } from 'react';
import { useEffect } from 'react';

type RunRewardsBannerProps = {
  xp: number;
  coins: number;
  level: number;
  onDismiss: () => void;
};

export const RunRewardsBanner: FC<RunRewardsBannerProps> = ({ xp, coins, level, onDismiss }) => {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 8000);
    return () => window.clearTimeout(timeout);
  }, [onDismiss]);

  return (
    <div
      className="absolute left-3 right-3 top-3 z-30 flex items-center justify-between rounded-full border border-white/15 bg-black/80 px-4 py-2 font-mono text-xs font-bold backdrop-blur"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <span className="text-cyan-300">XP +{xp}</span>
      <span className="text-yellow-300">COINS +{coins}</span>
      <span className="text-white">LV {level}</span>
      <button onClick={onDismiss} className="text-gray-400 hover:text-white" aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
};
