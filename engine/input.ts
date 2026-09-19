import type { Player } from './types';

export const doJump = (
  player: Player,
  xPos: number,
  gameState: string,
  jumpForce: number,
  jumpBufferTime: number,
  maxJumps: number,
  onJump?: (x: number, y: number) => void
) => {
  player.jumpBuffer = jumpBufferTime;
  player.holding = true;

  if (gameState !== 'PLAYING') return;
  if (player.jumps >= maxJumps) return;

  player.vy = jumpForce;
  player.jumps++;
  player.grounded = false;
  player.jumpBuffer = 0;

  onJump?.(xPos, player.y + 20);
};

export const releaseJump = (player: Player) => {
  player.holding = false;
};

export const getPointerLane = (
  clientX: number,
  rectLeft: number,
  rectWidth: number
): 'LEFT' | 'RIGHT' => {
  return clientX - rectLeft < rectWidth / 2 ? 'LEFT' : 'RIGHT';
};

export const handleLinkedJump = (
  left: Player,
  right: Player,
  xLeft: number,
  xRight: number,
  options: {
    gameState: string;
    jumpForce: number;
    jumpBufferTime: number;
    maxJumps: number;
    onJump?: (x: number, y: number) => void;
  }
) => {
  doJump(
    left,
    xLeft,
    options.gameState,
    options.jumpForce,
    options.jumpBufferTime,
    options.maxJumps,
    options.onJump
  );
  doJump(
    right,
    xRight,
    options.gameState,
    options.jumpForce,
    options.jumpBufferTime,
    options.maxJumps,
    options.onJump
  );
};
