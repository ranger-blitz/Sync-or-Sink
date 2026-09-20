import type { FC } from 'react';
import { useTopScores } from '../../lib/scores/useTopScores';

// Placeholder rows until a real backend exists (Supabase step).
const PLACEHOLDER_SCORES = [
  { username: 'DEEPSURVIVOR', score: 1540 },
  { username: 'REEFRUNNER', score: 1200 },
  { username: 'SURFACEKING', score: 850 },
  { username: 'ABYSSWALKER', score: 620 },
];

export const LeaderboardView: FC = () => {
  const { scores } = useTopScores('sync-or-sink', 10);

  const localName = localStorage.getItem('syncOrSinkName') || 'YOU';
  const legacyHigh = Number(localStorage.getItem('syncOrSinkHigh')) || 0;
  const bestScore = Math.max(Math.floor(scores[0]?.score ?? 0), legacyHigh);

  const rows = [...PLACEHOLDER_SCORES];
  if (bestScore > 0) rows.push({ username: localName, score: bestScore });
  rows.sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col h-full bg-black p-6 overflow-y-auto">
      <h2 className="text-2xl font-black italic text-center mb-6 text-cyan-400">ESCAPE RECORDS</h2>
      <div className="space-y-2">
        {rows.map((s, i) => (
          <div key={`${s.username}-${i}`} className={`flex justify-between items-center p-3 rounded-lg border ${s.username === localName ? 'bg-white/20 border-cyan-400' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold w-6 text-yellow-400">#{i + 1}</span>
              <span className="text-sm font-bold text-white">{s.username}</span>
            </div>
            <span className="text-sm font-mono text-white">{s.score}m</span>
          </div>
        ))}
      </div>
    </div>
  );
};