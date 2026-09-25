import type { GameResult } from '../../games/types';
import type { PlayerProfile } from '../profiles/types';
import { getLocalProfile, saveLocalProfile } from '../profiles/localProfile';
import { scoreRepository } from '../scores/scoreRepository';
import { getLevelFromXp } from '../profiles/progression';

export type RunReward = {
  xp: number;
  coins: number;
};

export type ProcessedRun = {
  profile: PlayerProfile;
  rewards: RunReward;
};

export const calculateRunRewards = (result: GameResult): RunReward => {
  // No Math.max(1, ...) floor: a 0m run (start, then Exit from Pause) must
  // earn nothing, otherwise quitting instantly would farm XP and coins.
  const xp = Math.floor(result.score / 20);
  const coins = Math.floor(result.score / 25);

  return { xp, coins };
};

export const processRunResult = async (result: GameResult): Promise<ProcessedRun> => {
  const profile = getLocalProfile();

  if (result.score <= 0) {
    return { profile, rewards: { xp: 0, coins: 0 } };
  }

  await scoreRepository.submitScore({
    ...result,
    userId: profile.id,
  });

  const rewards = calculateRunRewards(result);

  const newXp = profile.xp + rewards.xp;

  const updatedProfile: PlayerProfile = {
    ...profile,
    xp: newXp,
    level: getLevelFromXp(newXp),
    coins: profile.coins + rewards.coins,
    gamesPlayed: profile.gamesPlayed + 1,
    totalScore: profile.totalScore + result.score,
  };

  saveLocalProfile(updatedProfile);

  return { profile: updatedProfile, rewards };
};