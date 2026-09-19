import { GRAVITY, JUMP_FORCE, PLAYER_SIZE } from './constants';
import type { Player } from './types';

export type PhysicsCallbacks = {
  onLanding?: (player: Player) => void;
  onBufferedJump?: (player: Player) => void;
  onFallOut?: () => void;
};

export const handlePlayerLanding = (
  player: Player,
  floorY: number,
  onLanding?: (player: Player) => void,
  onBufferedJump?: (player: Player) => void
) => {
  const wasGrounded = player.grounded;

  if (player.y > floorY - PLAYER_SIZE) {
    if (!wasGrounded) onLanding?.(player);

    player.y = floorY - PLAYER_SIZE;
    player.vy = 0;
    player.grounded = true;
    player.jumps = 0;

    if (player.jumpBuffer > 0) {
      player.vy = JUMP_FORCE;
      player.jumps++;
      player.grounded = false;
      player.jumpBuffer = 0;
      onBufferedJump?.(player);
    }
  } else {
    player.grounded = false;
  }
};

export const updatePlayerPhysics = (
  player: Player,
  deltaTime: number,
  floorY: number,
  roomHeight: number,
  callbacks: PhysicsCallbacks = {}
) => {
  if (!player.holding && player.vy < 0) player.vy *= Math.pow(0.85, deltaTime);

  player.vy += GRAVITY * deltaTime;
  player.y += player.vy * deltaTime;

  if (player.flash > 0) player.flash -= deltaTime;
  if (player.jumpBuffer > 0) player.jumpBuffer -= deltaTime * 16;

  handlePlayerLanding(
    player,
    floorY,
    callbacks.onLanding,
    callbacks.onBufferedJump
  );

  if (!player.grounded && player.y > roomHeight + 50) {
    callbacks.onFallOut?.();
  }
};
