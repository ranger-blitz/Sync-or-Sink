import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { SYNC_OR_SINK_ACHIEVEMENTS } from '../../../engine/achievements';

export const AwardsView: FC = () => {
  const [unlocked, setUnlocked] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('syncOrSinkBadges');
    if (saved) setUnlocked(JSON.parse(saved));
  }, []);

  return (
    <div className="flex flex-col h-full bg-black p-6 overflow-y-auto">
      <h2 className="text-2xl font-black italic text-center mb-6 text-yellow-400">AWARDS & RULES</h2>
      <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
        <h3 className="text-sm font-bold text-white mb-2 border-b border-white/10 pb-2">FLIGHT MANUAL</h3>
        <ul className="text-xs text-gray-400 space-y-2 list-disc pl-4">
          <li><strong className="text-red-400">INSTANT DEATH:</strong> Hitting a block kills you immediately.</li>
          <li><strong className="text-cyan-400">SHIELDS:</strong> Collect Orbs to survive ONE hit.</li>
          <li><strong className="text-yellow-400">CHOICE:</strong> Stay grounded to pick power ups.</li>
        </ul>
      </div>
      <h3 className="text-sm font-bold text-white mb-2">ACHIEVEMENTS</h3>
      <div className="grid grid-cols-1 gap-2">
        {SYNC_OR_SINK_ACHIEVEMENTS.map((ach) => (
          <div key={ach.id} className={`flex items-center gap-3 p-3 rounded border ${unlocked.includes(ach.id) ? 'bg-yellow-500/10 border-yellow-500' : 'bg-white/5 border-white/10 opacity-50'}`}>
            <span className="text-2xl">{ach.icon}</span>
            <div>
              <p className={`text-xs font-bold ${unlocked.includes(ach.id) ? 'text-yellow-400' : 'text-gray-500'}`}>{ach.name}</p>
              <p className="text-[10px] text-gray-400">{ach.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
