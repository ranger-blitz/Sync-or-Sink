import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { processRunResult } from '../../lib/rewards/runRewards';
import type { ProcessedRun } from '../../lib/rewards/runRewards';
import { RunRewardsBanner } from '../../components/arcade/RunRewardsBanner';
import type { ArcadeView, GameResult } from '../../games/types';
import { getGameById } from '../../games/registry';
import { LeaderboardView } from '../../components/arcade/LeaderboardView';
import { AwardsView } from '../../components/arcade/AwardsView';
import { ShopView } from '../../components/arcade/ShopView';
import { ArcadeOverlay } from '../../components/arcade/ArcadeOverlay';
import { ProfileView } from '../../components/arcade/ProfileView';

export const HomeView: FC = () => {
  const selectedGame = getGameById('sync-or-sink');
  const GameComponent = selectedGame?.component;
  const [activeTab, setActiveTab] = useState('Play');
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [overlay, setOverlay] = useState<ArcadeView | null>(null);
  const [runOutcome, setRunOutcome] = useState<ProcessedRun | null>(null);
  const dismissRunOutcome = useCallback(() => setRunOutcome(null), []);

  const handleGameOver = (result: GameResult) => {
    setIsGameActive(false);
    setActiveTab('Play');
    setOverlay(null);
    setRunOutcome(null);

    // The arcade owns what a result means. The game only reported it.
    void processRunResult(result).then((outcome) => {
      if (outcome.rewards.xp > 0 || outcome.rewards.coins > 0) {
        setRunOutcome(outcome);
      }
      // Refresh Rank only AFTER the score has actually been saved.
      setLeaderboardRefreshKey((current) => current + 1);
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black justify-center items-center font-mono select-none text-white overflow-hidden">
      {!isGameActive && (
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-2 py-1 mb-4 z-50 border border-white/10">
          {['Play', 'Rank', 'Awards', 'Shop', 'Profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setOverlay(null);
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
          {GameComponent && selectedGame && (
            <GameComponent
              gameId={selectedGame.id}
              onGameStart={() => {
                setIsGameActive(true);
                setRunOutcome(null);
              }}
              onGameOver={handleGameOver}
              onOpenArcadeView={(view) => setOverlay(view)}
            />
          )}
        </div>

        {!isGameActive && activeTab === 'Rank' && <LeaderboardView key={leaderboardRefreshKey} />}
        {!isGameActive && activeTab === 'Awards' && <AwardsView />}
        {!isGameActive && activeTab === 'Shop' && <ShopView />}
        {!isGameActive && activeTab === 'Profile' && (
          <ProfileView onViewAchievements={() => setActiveTab('Awards')} />
        )}
        
        {overlay && (
          <ArcadeOverlay
            title={overlay === 'Awards' ? 'Achievements' : 'Store'}
            onBack={() => setOverlay(null)}
          >
            {overlay === 'Awards' ? <AwardsView /> : <ShopView />}
          </ArcadeOverlay>
        )}
        {runOutcome && !isGameActive && activeTab === 'Play' && !overlay && (
          <RunRewardsBanner
            xp={runOutcome.rewards.xp}
            coins={runOutcome.rewards.coins}
            level={runOutcome.profile.level}
            onDismiss={dismissRunOutcome}
          />
        )}
      </div>
    </div>
  );
};