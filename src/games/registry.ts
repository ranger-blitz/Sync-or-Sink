import type { FC } from 'react';
import type { GameProps } from './types';
import { SyncOrSink } from './sync-or-sink/SyncOrSink';

export type GameDefinition = {
  id: string;
  title: string;
  description: string;
  component: FC<GameProps>;
};

export const games: GameDefinition[] = [
  {
    id: 'sync-or-sink',
    title: 'Sync or Sink',
    description: 'A fast arcade survival game.',
    component: SyncOrSink,
  },
];

export const getGameById = (gameId: string) => {
  return games.find((game) => game.id === gameId);
};
