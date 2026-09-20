import type { ScoreRecord, ScoreSubmission } from './types';
import { getScoresForGame, saveScore } from './localScores';

export interface ScoreRepository {
  submitScore(submission: ScoreSubmission): Promise<ScoreRecord>;
  getTopScores(gameId: string, limit?: number): Promise<ScoreRecord[]>;
}

export const localScoreRepository: ScoreRepository = {
  async submitScore(submission) {
    return saveScore(submission);
  },

  async getTopScores(gameId, limit = 10) {
    // getScoresForGame already sorts highest first.
    return getScoresForGame(gameId).slice(0, limit);
  },
};

// The only line that changes when Supabase is added.
export const scoreRepository: ScoreRepository = localScoreRepository;