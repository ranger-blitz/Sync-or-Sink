import type { PlayerProfile } from './types';

const STORAGE_KEY = 'arcade-profile';

const DEFAULT_PROFILE: PlayerProfile = {
  id: 'local-player',
  username: 'player',
  displayName: 'Player',
  xp: 0,
  level: 1,
  coins: 0,
  gamesPlayed: 0,
  totalScore: 0,
};

export const getLocalProfile = (): PlayerProfile => {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_PROFILE)
    );

    return DEFAULT_PROFILE;
  }

  try {
    return JSON.parse(stored) as PlayerProfile;
  } catch {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_PROFILE)
    );

    return DEFAULT_PROFILE;
  }
};

export const saveLocalProfile = (profile: PlayerProfile) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(profile)
  );
};
