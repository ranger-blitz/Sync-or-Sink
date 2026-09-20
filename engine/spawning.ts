import type { BgProp, BgPropType, Obstacle } from './types';

export const spawnBgProp = (
  bgProps: BgProp[],
  envType: string,
  width: number = 400
) => {
  const x = Math.random() * width;
  const y = -50;

  let size = 0;
  let speed = 0;
  let type: BgPropType = 'BUBBLE';

  if (envType === 'UNDERWATER') {
    const rand = Math.random();

    if (rand < 0.7) {
      type = 'BUBBLE';
      size = Math.random() * 4 + 2;
      speed = Math.random() * 1 + 0.5;
    } else {
      type = 'FISH';
      size = Math.random() * 10 + 5;
      speed = Math.random() * 2 + 1;
    }
  } else if (envType === 'SKY' || envType === 'TRANSITION') {
    type = 'CLOUD';
    size = Math.random() * 40 + 20;
    speed = Math.random() * 0.5 + 0.2;
  } else {
    type = 'STAR';
    size = Math.random() * 2 + 1;
    speed = Math.random() * 3 + 1;
  }

  bgProps.push({
    x,
    y,
    size,
    speed,
    type,
  });
};

export const spawnBlock = (
  obstacles: Obstacle[],
  lane: 'LEFT' | 'RIGHT',
  mid: number,
  yOffset: number = 0
) => {
  const x = lane === 'LEFT' ? mid / 2 - 25 : mid + mid / 2 - 25;

  obstacles.push({
    x,
    y: -50 + yOffset,
    w: 50,
    h: 30,
    type: 'BLOCK',
    lane,
    passed: false,
    collided: false,
  });
};

export const spawnSpecial = (
  obstacles: Obstacle[],
  type: 'ORB' | 'GHOST' | 'GLITCH',
  mid: number
) => {
  const lane = Math.random() > 0.5 ? 'LEFT' : 'RIGHT';

  const x = lane === 'LEFT' ? mid / 2 - 15 : mid + mid / 2 - 15;

  obstacles.push({
    x,
    y: -50,
    w: 30,
    h: 30,
    type,
    lane,
    passed: false,
    collided: false,
  });
};
