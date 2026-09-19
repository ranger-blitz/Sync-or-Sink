import { ENVIRONMENTS } from './config';
import {
  FLOOR,
  HEIGHT,
  MID,
  PLAYER_SIZE,
  WIDTH,
} from './constants';
import type { BgProp, FloatingText, Obstacle, Particle, Player } from './types';

export type RenderGameArgs = {
  ctx: CanvasRenderingContext2D;
  prevEnvIdx: number;
  nextEnvIdx: number;
  transitionProgress: number;
  ghostActive: boolean;
  glitchActive: boolean;
  shieldActive: boolean;
  shakeRef: { current: number };
  bgProps: { current: BgProp[] };
  obstacles: { current: Obstacle[] };
  particles: { current: Particle[] };
  texts: { current: FloatingText[] };
  pLeft: { current: Player };
  pRight: { current: Player };
};

export const renderGame = ({
  ctx,
  prevEnvIdx,
  nextEnvIdx,
  transitionProgress,
  ghostActive,
  glitchActive,
  shieldActive,
  shakeRef,
  bgProps,
  obstacles,
  particles,
  texts,
  pLeft,
  pRight,
}: RenderGameArgs) => {
  ctx.save();
  if (glitchActive) {
    ctx.fillStyle = `rgba(50, 0, 0, ${Math.random() * 0.3})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  } else {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  if (shakeRef.current > 0) {
    ctx.translate(
      (Math.random() - 0.5) * shakeRef.current,
      (Math.random() - 0.5) * shakeRef.current
    );
    shakeRef.current *= 0.9;
  }

  const prevEnv = ENVIRONMENTS[prevEnvIdx];
  const prevGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  prevGrad.addColorStop(0, prevEnv.bgTop);
  prevGrad.addColorStop(1, prevEnv.bgBot);
  ctx.fillStyle = prevGrad;
  ctx.fillRect(-1, -1, WIDTH + 2, HEIGHT + 2);

  if (transitionProgress > 0) {
    const nextEnv = ENVIRONMENTS[nextEnvIdx];
    const nextGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    nextGrad.addColorStop(0, nextEnv.bgTop);
    nextGrad.addColorStop(1, nextEnv.bgBot);
    ctx.fillStyle = nextGrad;
    if (transitionProgress < 1) {
      const splitY = Math.ceil(HEIGHT * transitionProgress) + 2;
      ctx.fillRect(-1, -1, WIDTH + 2, splitY);
    } else {
      ctx.fillRect(-1, -1, WIDTH + 2, HEIGHT + 2);
    }
  }

  bgProps.current.forEach((p) => {
    if (p.type === 'BUBBLE') {
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.type === 'CLOUD') {
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(p.x, p.y, p.size * 2, p.size);
    } else if (p.type === 'FISH') {
      ctx.fillStyle = 'rgba(100,200,255,0.3)';
      ctx.fillRect(p.x, p.y, p.size, p.size / 2);
    } else {
      ctx.fillStyle = '#FFF';
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  });

  const activeEnv = ENVIRONMENTS[nextEnvIdx];
  if (activeEnv.name === 'SURFACE') {
    const now = Date.now();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < WIDTH; x += 10) {
      const y = 50 + Math.sin((x + now / 200) * 0.02) * 10;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.fillStyle = '#00FFFF';
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#00FFFF';
  ctx.fillRect(0, FLOOR, WIDTH, 2);
  ctx.shadowBlur = 0;

  ctx.shadowBlur = 20;
  ctx.shadowColor = '#00FFFF';
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(MID, 0);
  ctx.lineTo(MID, HEIGHT);
  ctx.stroke();
  ctx.shadowBlur = 0;

  obstacles.current.forEach((obs) => {
    if (obs.type === 'ORB') {
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00BFFF';
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (obs.type === 'GHOST') {
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#d946ef';
      ctx.fillStyle = '#d946ef';
      ctx.beginPath();
      ctx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (obs.type === 'GLITCH') {
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff0000';
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.moveTo(obs.x + obs.w / 2, obs.y);
      ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
      ctx.lineTo(obs.x, obs.y + obs.h);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      ctx.shadowBlur = 15;
      const color = obs.lane === 'LEFT' ? activeEnv.accent : '#FFF';
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.fillStyle = '#000';
      ctx.fillRect(obs.x + 2, obs.y + 2, obs.w - 4, obs.h - 4);
    }
  });

  const drawPlayer = (p: Player, xOffset: number, color: string) => {
    const x = xOffset - PLAYER_SIZE / 2;
    if (p.flash > 0 && Math.floor(Date.now() / 50) % 2 === 0) return;
    if (ghostActive) {
      ctx.globalAlpha = 0.4;
      ctx.shadowBlur = 0;
    } else {
      ctx.shadowBlur = 20;
      ctx.shadowColor = color;
    }
    ctx.fillStyle = color;
    if (shieldActive) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + PLAYER_SIZE / 2, p.y + PLAYER_SIZE / 2, PLAYER_SIZE, 0, Math.PI * 2);
      ctx.stroke();
    }
    let w: number = PLAYER_SIZE;
    let h: number = PLAYER_SIZE;
    if (!p.grounded) {
      h = PLAYER_SIZE + 4;
      w = PLAYER_SIZE - 4;
    }
    ctx.fillRect(x + (PLAYER_SIZE - w) / 2, p.y, w, h);
    ctx.globalAlpha = 1.0;
  };

  drawPlayer(pLeft.current, MID / 2, ENVIRONMENTS[nextEnvIdx].accent);
  drawPlayer(pRight.current, MID + MID / 2, '#FFF');

  particles.current.forEach((p) => {
    if (p.type === 'PULSE') {
      p.size += 3;
      p.life -= 0.05;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x + 10, p.y + 10, p.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    } else if (p.type === 'DUST') {
      p.y += p.vy;
      p.x += p.vx;
      p.life -= 0.05;
      ctx.strokeStyle = `rgba(255,255,255,${p.life})`;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    } else if (p.type === 'BUBBLE') {
      p.y += p.vy;
      p.x += p.vx;
      p.life -= 0.01;
      ctx.fillStyle = `rgba(0, 191, 255, ${p.life})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'SPARK') {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  });

  particles.current = particles.current.filter((p) => p.life > 0);

  texts.current.forEach((t) => {
    t.y -= 1;
    t.life -= 0.02;
    if (t.life > 0) {
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = t.color;
      ctx.globalAlpha = t.life;
      ctx.fillText(t.text, t.x - 20, t.y);
      ctx.globalAlpha = 1.0;
    }
  });

  texts.current = texts.current.filter((t) => t.life > 0);

  if (glitchActive) {
    ctx.save();
    ctx.translate(WIDTH / 2, HEIGHT / 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = Math.random() * 3 + 1;
    ctx.globalAlpha = Math.random() * 0.5 + 0.3;
    ctx.beginPath();
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const inner = 80 + Math.random() * 50;
      const outer = 400;
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    }
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
};
