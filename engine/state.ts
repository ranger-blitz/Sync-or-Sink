import type {
  BgProp,
  GameMode,
  GameState,
  Obstacle,
  Particle,
  Player,
  FloatingText,
} from './types';

export type GameRefs = {
  gameState: { current: GameState };
  gameMode: { current: GameMode };
  score: { current: number };
  highScore: { current: number };
  distance: { current: number };
  level: { current: number };
  speed: { current: number };

  left: { current: Player };
  right: { current: Player };

  obstacles: { current: Obstacle[] };
  particles: { current: Particle[] };
  texts: { current: FloatingText[] };
  bgProps: { current: BgProp[] };
};

export const resetPlayer = (color: string): Player => ({
  y: 450,
  vy: 0,
  grounded: true,
  color,
  jumps: 0,
  flash: 0,
  jumpBuffer: 0,
  holding: false,
});
