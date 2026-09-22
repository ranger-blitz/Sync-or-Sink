export type PlayerLoadout = {
  coreId?: string;
  skinId?: string;
  trailId?: string;
  effectId?: string;
  badgeId?: string;
};

const STORAGE_KEY = 'arcade-loadout';

const DEFAULT_LOADOUT: PlayerLoadout = {};

export const getLocalLoadout = (): PlayerLoadout => {
  if (typeof window === 'undefined') {
    return DEFAULT_LOADOUT;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return DEFAULT_LOADOUT;
  }

  try {
    return JSON.parse(stored) as PlayerLoadout;
  } catch {
    return DEFAULT_LOADOUT;
  }
};

export const saveLocalLoadout = (
  loadout: PlayerLoadout
) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(loadout)
  );
};