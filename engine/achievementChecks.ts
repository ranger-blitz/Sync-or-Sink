import { SYNC_OR_SINK_ACHIEVEMENTS } from './achievements';

export const checkAchievements = ({
  finalScore,
  unlockedBadges,
  usedShield,
  currentHighScore,
  setUnlockedBadges,
  setHighScore,
}: {
  finalScore: number;
  unlockedBadges: string[];
  usedShield: boolean;
  currentHighScore: number;
  setUnlockedBadges: (next: string[]) => void;
  setHighScore: (next: number) => void;
}) => {
  const safeFinalScore = Number.isFinite(finalScore) ? finalScore : 0;
  const safeCurrentHighScore = Number.isFinite(currentHighScore) ? currentHighScore : 0;

  const nextBadges = [...unlockedBadges];
  let changed = false;

  SYNC_OR_SINK_ACHIEVEMENTS.forEach((achievement) => {
    if (safeFinalScore >= achievement.score && !nextBadges.includes(achievement.id)) {
      // "survivor" (Untouchable) is only valid if the shield was never used.
      if (achievement.id === 'survivor' && usedShield) return;

      nextBadges.push(achievement.id);
      changed = true;
    }
  });

  if (changed) {
    setUnlockedBadges(nextBadges);
    localStorage.setItem('syncOrSinkBadges', JSON.stringify(nextBadges));
  }

  if (safeFinalScore > safeCurrentHighScore) {
    setHighScore(safeFinalScore);
    localStorage.setItem('syncOrSinkHigh', safeFinalScore.toString());
  }
};

export const recordRun = () => {
  const nextRuns = parseInt(localStorage.getItem('syncOrSinkRuns') || '0') + 1;
  localStorage.setItem('syncOrSinkRuns', nextRuns.toString());
};