import type { GameResult } from '../../games/types';

export type ScoreRecord = {
  id: string;
  userId: string;
  gameId: string;
  score: number;
  duration: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type ScoreSubmission = GameResult & {
  userId: string;
};
