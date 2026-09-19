import type { FC } from 'react';
import { useState } from 'react';
import { SyncOrSink } from '../../games/sync-or-sink/SyncOrSink';
import { LeaderboardView } from '../../components/arcade/LeaderboardView';
import { AwardsView } from '../../components/arcade/AwardsView';
import { ShopView } from '../../components/arcade/ShopView';

export const HomeView: FC = () => {
  const [activeTab, setActiveTab] = useState('Play');
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full bg-black justify-center items-center font-mono select-none text-white overflow-hidden">
      {!isGameActive && (
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-2 py-1 mb-4 z-50 border border-white/10">
          {['Play', 'Rank', 'Awards', 'Shop'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'Play') setIsGameActive(false);
              }}
              className={`rounded-full px-4 py-1 text-xs font-bold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-slate-800 text-white shadow-lg scale-105'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      <div className="relative w-full max-w-[400px] h-full max-h-[800px] border-x-4 border-gray-900 bg-black shadow-2xl overflow-hidden rounded-3xl">
        <div className={`${activeTab === 'Play' || isGameActive ? 'block' : 'hidden'} h-full`}>
          <SyncOrSink
            gameId="sync-or-sink"
            onGameStart={() => {
              setIsGameActive(true);
            }}
            onGameOver={() => {
              setIsGameActive(false);
              setActiveTab('Play');
              setLeaderboardRefreshKey((current) => current + 1);
            }}
          />
        </div>

        {!isGameActive && activeTab === 'Rank' && <LeaderboardView key={leaderboardRefreshKey} />}
        {!isGameActive && activeTab === 'Awards' && <AwardsView />}
        {!isGameActive && activeTab === 'Shop' && <ShopView />}
      </div>
    </div>
  );
};
