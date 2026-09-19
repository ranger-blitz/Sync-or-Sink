import type { FC } from 'react';
import { useEffect, useState } from 'react';

export const LeaderboardView: FC = () => {
  const [scores, setScores] = useState<any[]>([]);

  useEffect(() => {
    const fakeScores = [
      { username: 'DEEPSURVIVOR', score: 1540 },
      { username: 'REEFRUNNER', score: 1200 },
      { username: 'SURFACEKING', score: 850 },
      { username: 'ABYSSWALKER', score: 620 },
    ];

    const localHigh = localStorage.getItem('syncOrSinkHigh');
    const localName = localStorage.getItem('syncOrSinkName') || 'YOU';

    if (localHigh) fakeScores.push({ username: localName, score: parseInt(localHigh) });
    fakeScores.sort((a, b) => b.score - a.score);
    setScores(fakeScores);
  }, []);

  return (
    <div className="flex flex-col h-full bg-black p-6 overflow-y-auto">
      <h2 className="text-2xl font-black italic text-center mb-6 text-cyan-400">ESCAPE RECORDS</h2>
      <div className="space-y-2">
        {scores.map((s, i) => (
          <div key={i} className={`flex justify-between items-center p-3 rounded-lg border ${s.username === (localStorage.getItem('syncOrSinkName') || 'YOU') ? 'bg-white/20 border-cyan-400' : 'bg-white/5 border-white/10'}`}>
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
