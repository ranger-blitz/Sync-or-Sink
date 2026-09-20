export type PlayerProfile = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  coins: number;
  gamesPlayed: number;
  totalScore: number;
}