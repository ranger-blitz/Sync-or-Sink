export type GameResult = {
  gameId: string;
  score: number;
  duration: number;
  metadata?: Record<string, unknown>;
};

export type GameProps = {
  userId?: string;
  gameId: string;
  onGameStart?: () => void;
  onScoreUpdate?: (score: number) => void;
  onGameOver: (result: GameResult) => void;
};
