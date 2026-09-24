import type { FC } from 'react';
import { getLocalProfile } from '../../lib/profiles/localProfile';
import { getLocalLoadout } from '../../lib/profiles/loadout';
import { SHOP_ITEMS } from '../../lib/rewards/shop';
import { SYNC_OR_SINK_ACHIEVEMENTS } from '../../../engine/achievements';

type ProfileViewProps = {
  onViewAchievements: () => void;
};

// Same level curve as engine/profiles/progression.ts (getLevelFromXp inverted):
// level L starts at xp = (L-1)^2 * 100.
const xpForLevel = (level: number) => (level - 1) ** 2 * 100;

const AVATAR_COLORS = ['#22d3ee', '#f472b6', '#facc15', '#34d399', '#a78bfa', '#fb923c'];

const colorForName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const ProfileView: FC<ProfileViewProps> = ({ onViewAchievements }) => {
  const profile = getLocalProfile();
  const loadout = getLocalLoadout();
  const pilotName = localStorage.getItem('syncOrSinkName') || 'PILOT';
  const bestScore = Math.floor(Number(localStorage.getItem('syncOrSinkHigh')) || 0);
  const unlockedBadges: string[] = JSON.parse(localStorage.getItem('syncOrSinkBadges') || '[]');

  const currentLevelXp = xpForLevel(profile.level);
  const nextLevelXp = xpForLevel(profile.level + 1);
  const xpIntoLevel = Math.max(0, profile.xp - currentLevelXp);
  const xpForThisLevel = Math.max(1, nextLevelXp - currentLevelXp);
  const progressPct = Math.min(100, Math.round((xpIntoLevel / xpForThisLevel) * 100));

  const equippedItems = Object.values(loadout)
    .filter((id): id is string => Boolean(id))
    .map((id) => SHOP_ITEMS.find((item) => item.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  const avatarColor = colorForName(pilotName);

  return (
    <div className="flex flex-col h-full bg-black p-6 overflow-y-auto font-mono text-white">
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black mb-3"
          style={{ backgroundColor: avatarColor, color: '#000' }}
        >
          {pilotName.charAt(0)}
        </div>
        <h2 className="text-xl font-bold">{pilotName}</h2>
        <p className="text-xs text-gray-500">LEVEL {profile.level}</p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
          <span>{xpIntoLevel} XP</span>
          <span>{xpForThisLevel} XP to level {profile.level + 1}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-cyan-400" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
          <p className="text-[10px] text-gray-500 tracking-widest">COINS</p>
          <p className="text-lg font-bold text-yellow-300">{profile.coins}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
          <p className="text-[10px] text-gray-500 tracking-widest">BEST</p>
          <p className="text-lg font-bold">{bestScore}m</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
          <p className="text-[10px] text-gray-500 tracking-widest">RUNS</p>
          <p className="text-lg font-bold">{profile.gamesPlayed}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
          <p className="text-[10px] text-gray-500 tracking-widest">TOTAL CLIMBED</p>
          <p className="text-lg font-bold">{Math.floor(profile.totalScore)}m</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-[10px] text-gray-500 tracking-widest mb-2">EQUIPPED</p>
        {equippedItems.length === 0 ? (
          <p className="text-xs text-gray-600">Nothing equipped yet. Visit the Shop.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {equippedItems.map((name) => (
              <span
                key={name}
                className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/10 border border-white/15"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onViewAchievements}
        className="w-full py-3 rounded-full font-bold text-xs tracking-widest bg-white/5 border border-white/15 hover:bg-white/10"
      >
        {unlockedBadges.length}/{SYNC_OR_SINK_ACHIEVEMENTS.length} ACHIEVEMENTS &rarr;
      </button>
    </div>
  );
};