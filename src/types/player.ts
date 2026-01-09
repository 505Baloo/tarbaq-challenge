export type Rank = 
  | 'IRON'
  | 'BRONZE'
  | 'SILVER'
  | 'GOLD'
  | 'PLATINUM'
  | 'EMERALD'
  | 'DIAMOND'
  | 'MASTER'
  | 'GRANDMASTER'
  | 'CHALLENGER';

export type Division = 'I' | 'II' | 'III' | 'IV';

export interface Champion {
  id: string;
  name: string;
  imageUrl: string;
  gamesPlayed: number;
  winRate: number;
}

export interface MatchResult {
  won: boolean;
  championId: string;
}

export interface Player {
  id: string;
  summonerName: string;
  tagLine: string;
  profileIconId: number;
  rank: Rank;
  division: Division;
  lp: number;
  wins: number;
  losses: number;
  winRate: number;
  recentMatches: MatchResult[];
  topChampions: Champion[];
  isInGame: boolean;
  lastUpdated: Date;
}

export const rankOrder: Record<Rank, number> = {
  IRON: 0,
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
  EMERALD: 5,
  DIAMOND: 6,
  MASTER: 7,
  GRANDMASTER: 8,
  CHALLENGER: 9,
};

export const divisionOrder: Record<Division, number> = {
  IV: 0,
  III: 1,
  II: 2,
  I: 3,
};
