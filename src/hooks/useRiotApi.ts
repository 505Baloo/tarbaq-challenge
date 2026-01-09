import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player, Champion } from '@/types/player';

// Champion data mapping (we'll need to fetch this from Data Dragon)
const CHAMPION_DATA_URL = 'https://ddragon.leagueoflegends.com/cdn/14.1.1/data/en_US/champion.json';

interface RiotPlayer {
  id: string;
  summonerName: string;
  tagLine: string;
  profileIconId: number;
  rank: string;
  division: string;
  lp: number;
  wins: number;
  losses: number;
  winRate: number;
  recentMatches: Array<{
    won: boolean;
    championId: string;
    championName?: string;
  }>;
  topChampions: Array<{
    id: string;
    championPoints: number;
    championLevel: number;
  }>;
  isInGame: boolean;
  lastUpdated: string;
}

interface ChampionData {
  [key: string]: {
    id: string;
    name: string;
    key: string;
  };
}

let championDataCache: ChampionData | null = null;

async function getChampionData(): Promise<ChampionData> {
  if (championDataCache) {
    return championDataCache;
  }
  
  try {
    const response = await fetch(CHAMPION_DATA_URL);
    const data = await response.json();
    championDataCache = data.data;
    return championDataCache!;
  } catch (error) {
    console.error('Error fetching champion data:', error);
    return {};
  }
}

function getChampionImageUrl(championName: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${championName}.png`;
}

async function transformRiotPlayer(riotPlayer: RiotPlayer): Promise<Player> {
  const championData = await getChampionData();
  
  // Create a reverse lookup: champion key (ID) -> champion data
  const championByKey: Record<string, { id: string; name: string }> = {};
  Object.values(championData).forEach((champ) => {
    championByKey[champ.key] = { id: champ.id, name: champ.name };
  });
  
  // Transform top champions with actual champion data
  const topChampions: Champion[] = riotPlayer.topChampions.map((champ, index) => {
    const champInfo = championByKey[champ.id];
    const championName = champInfo?.id || 'Unknown';
    const displayName = champInfo?.name || 'Unknown';
    
    // Calculate approximate win rate from mastery (rough estimate)
    // In reality, you'd need match history per champion
    const estimatedWinRate = 50 + (champ.championLevel - 5) * 2;
    
    return {
      id: champ.id,
      name: displayName,
      imageUrl: getChampionImageUrl(championName),
      gamesPlayed: Math.round(champ.championPoints / 1000), // Rough estimate
      winRate: Math.min(75, Math.max(40, estimatedWinRate)),
    };
  });
  
  // Transform recent matches
  const recentMatches = riotPlayer.recentMatches.map((match) => ({
    won: match.won,
    championId: match.championId,
  }));
  
  return {
    id: riotPlayer.id,
    summonerName: riotPlayer.summonerName,
    tagLine: riotPlayer.tagLine,
    profileIconId: riotPlayer.profileIconId,
    rank: riotPlayer.rank as Player['rank'],
    division: riotPlayer.division as Player['division'],
    lp: riotPlayer.lp,
    wins: riotPlayer.wins,
    losses: riotPlayer.losses,
    winRate: riotPlayer.winRate,
    recentMatches,
    topChampions,
    isInGame: riotPlayer.isInGame,
    lastUpdated: new Date(riotPlayer.lastUpdated),
  };
}

export function useRiotApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayer = useCallback(async (
    gameName: string,
    tagLine: string,
    platform: string = 'euw1'
  ): Promise<Player | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('riot-api', {
        body: {
          action: 'getPlayer',
          gameName,
          tagLine,
          platform,
        },
      });
      
      if (fnError) {
        throw new Error(fnError.message);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const player = await transformRiotPlayer(data.player);
      return player;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch player';
      setError(message);
      console.error('Error fetching player:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMultiplePlayers = useCallback(async (
    players: Array<{ gameName: string; tagLine: string; platform?: string }>,
    defaultPlatform: string = 'euw1'
  ): Promise<Player[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('riot-api', {
        body: {
          action: 'getMultiplePlayers',
          players,
          platform: defaultPlatform,
        },
      });
      
      if (fnError) {
        throw new Error(fnError.message);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const successfulPlayers: Player[] = [];
      for (const result of data.results) {
        if (result.success) {
          const player = await transformRiotPlayer(result.player);
          successfulPlayers.push(player);
        } else {
          console.warn(`Failed to fetch ${result.gameName}#${result.tagLine}: ${result.error}`);
        }
      }
      
      return successfulPlayers;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch players';
      setError(message);
      console.error('Error fetching players:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchPlayer,
    fetchMultiplePlayers,
  };
}
