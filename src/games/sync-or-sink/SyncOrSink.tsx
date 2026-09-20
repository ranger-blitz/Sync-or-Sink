import type { FC } from 'react';
import type { GameProps } from '../types';
import { GameSandbox } from './GameSandbox';

export const SyncOrSink: FC<GameProps> = (props) => {
  return <GameSandbox {...props} />;
};
