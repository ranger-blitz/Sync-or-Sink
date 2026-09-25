//Type

export type GameMode = "LINKED" | "DUAL";

export type GameState =
  | "NAME_ENTRY"
  | "START"
  | "COUNTDOWN"
  | "TUTORIAL"
  | "PLAYING"
  | "PAUSED"
  | "GAMEOVER";

export type Player = {
  y: number;
  vy: number;
  grounded: boolean;
  color: string;
  jumps: number;
  flash: number;
  jumpBuffer: number;
  holding: boolean;
};

export type ObstacleType =
  | "BLOCK"
  | "ORB"
  | "GHOST"
  | "GLITCH";

export type Lane = "LEFT" | "RIGHT";

export type Obstacle = {
  x: number;
  y: number;
  w: number;
  h: number;
  type: ObstacleType;
  lane: Lane;
  passed: boolean;
  collided: boolean;
  closeCallShown: boolean;
};

export type ParticleType =
  | "PULSE"
  | "DUST"
  | "BUBBLE"
  | "SPLASH"
  | "SPARK";

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  type?: ParticleType;
};

export type BgPropType =
  | "BUBBLE"
  | "CLOUD"
  | "STAR"
  | "FISH";

export type BgProp = {
  x: number;
  y: number;
  size: number;
  speed: number;
  type: BgPropType;
};

export type FloatingText = {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
};
