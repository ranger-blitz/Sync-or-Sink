import { useEffect, useState } from 'react';
import type { ScoreRecord } from './types';
import { scoreRepository } from './scoreRepository';

export const useTopScores = (gameId: string, limit = 10) => {
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    scoreRepository.getTopScores(gameId, limit).then((records) => {
      if (cancelled) return;
      setScores(records);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [gameId, limit]);

  return { scores, isLoading };
};
