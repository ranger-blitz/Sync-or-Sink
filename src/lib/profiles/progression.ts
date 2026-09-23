export const getLevelFromXp = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};