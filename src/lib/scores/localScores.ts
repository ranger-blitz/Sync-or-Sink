import type { ScoreSubmission, ScoreRecord } from './types';

const STORAGE_KEY = 'arcade-scores';

const getScores = (): ScoreRecord[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as ScoreRecord[];
  } catch {
    return [];
  }
};

export const saveScore = (
  submission: ScoreSubmission
): ScoreRecord => {
  const scores = getScores();

  const record: ScoreRecord = {
    id: `${submission.gameId}-${Date.now()}`,
    userId: submission.userId,
    gameId: submission.gameId,
    score: submission.score,
    duration: submission.duration,
    createdAt: new Date().toISOString(),
    metadata: submission.metadata,
  };

  scores.push(record);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(scores)
    );
  }

  return record;
};

export const getScoresForGame = (
  gameId: string
): ScoreRecord[] => {
  return getScores()
    .filter((score) => score.gameId === gameId)
    .sort((a, b) => b.score - a.score);
};
