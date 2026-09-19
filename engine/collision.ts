import type { Obstacle, Player } from './types';

export type CollisionOutcome =
  | 'NONE'
  | 'ORB'
  | 'GHOST'
  | 'GLITCH'
  | 'BLOCK';

export const checkCollision = (
  player: Player,
  obstacle: Obstacle,
  playerX: number,
  playerY: number,
  playerSize: number,
  hitboxPadding: number
): boolean => {
  const pHitX = playerX + hitboxPadding;
  const pHitY = playerY + hitboxPadding;
  const pHitW = playerSize - hitboxPadding * 2;
  const pHitH = playerSize - hitboxPadding * 2;

  const obsHitX = obstacle.x + 2;
  const obsHitY = obstacle.y + 2;
  const obsHitW = obstacle.w - 4;
  const obsHitH = obstacle.h - 4;

  return (
    pHitX < obsHitX + obsHitW &&
    pHitX + pHitW > obsHitX &&
    pHitY < obsHitY + obsHitH &&
    pHitY + pHitH > obsHitY
  );
};

export const handleObstacleCollision = ({
  player,
  obstacle,
  playerX,
  playerY,
  playerSize,
  hitboxPadding,
  ghostActive,
  shieldActive,
  glitchActive,
  isJumpingOver,
}: {
  player: Player;
  obstacle: Obstacle;
  playerX: number;
  playerY: number;
  playerSize: number;
  hitboxPadding: number;
  ghostActive: boolean;
  shieldActive: boolean;
  glitchActive: boolean;
  isJumpingOver: boolean;
}): CollisionOutcome => {
  const hasCollision = checkCollision(
    player,
    obstacle,
    playerX,
    playerY,
    playerSize,
    hitboxPadding
  );

  if (!hasCollision) return 'NONE';

  if (obstacle.type === 'ORB') return 'ORB';
  if (obstacle.type === 'GHOST') return 'GHOST';
  if (obstacle.type === 'GLITCH') return 'GLITCH';

  if (ghostActive || glitchActive || shieldActive || isJumpingOver) {
    return 'NONE';
  }

  return 'BLOCK';
};
