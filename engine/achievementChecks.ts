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

  const achievementData = [
    { id: 'survivor', score: 500, icon: '🏆', name: 'Survivor', desc: 'Reach 500m' },
    { id: 'runner', score: 1000, icon: '⚡', name: 'Runner', desc: 'Reach 1000m' },
  ];

  achievementData.forEach((achievement) => {
    if (safeFinalScore >= achievement.score && !nextBadges.includes(achievement.id)) {
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
  const nextRuns = (parseInt(localStorage.getItem('syncOrSinkRuns') || '0')) + 1;
  localStorage.setItem('syncOrSinkRuns', nextRuns.toString());
};
