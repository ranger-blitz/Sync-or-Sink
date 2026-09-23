import type { Particle, FloatingText } from './types';

export const spawnExplosion = (
  particles: Particle[],
  x: number,
  y: number,
  color: string,
  count: number = 15
) => {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + 10,
      y: y + 10,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12,
      life: 1.0,
      color,
      size: Math.random() * 4 + 2,
      type: 'SPARK',
    });
  }
};

export const spawnDust = (
  particles: Particle[],
  x: number,
  y: number
) => {
  for (let i = 0; i < 5; i++) {
    particles.push({
      x: x + (Math.random() * 20 - 10),
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 2,
      life: 0.6,
      color: '#fff',
      size: Math.random() * 3 + 1,
      type: 'DUST',
    });
  }
};

export const spawnText = (
  texts: FloatingText[],
  x: number,
  y: number,
  text: string,
  color: string
) => {
  const ROW_HEIGHT = 26;
  
  let targetY = y;
  const overlapsExisting = () =>
    texts.some(
      (t) => t.life > 0 && Math.abs(t.x - x) < 140 && Math.abs(t.y - targetY) < ROW_HEIGHT
    );

  while (overlapsExisting()) {
    targetY += ROW_HEIGHT;
  }

  texts.push({
    x,
    y: targetY,
    text,
    life: 1.0,
    color,
  });
};
