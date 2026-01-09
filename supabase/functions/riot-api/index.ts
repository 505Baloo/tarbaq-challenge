import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RIOT_API_KEY = Deno.env.get('RIOT_API_KEY');

// Region routing for different API endpoints
const REGIONS = {
  americas: 'americas.api.riotgames.com',
  europe: 'europe.api.riotgames.com',
  asia: 'asia.api.riotgames.com',
  sea: 'sea.api.riotgames.com',
};

const PLATFORMS = {
  euw1: 'euw1.api.riotgames.com',
  na1: 'na1.api.riotgames.com',
  kr: 'kr.api.riotgames.com',
  br1: 'br1.api.riotgames.com',
  eun1: 'eun1.api.riotgames.com',
  jp1: 'jp1.api.riotgames.com',
  la1: 'la1.api.riotgames.com',
  la2: 'la2.api.riotgames.com',
  oc1: 'oc1.api.riotgames.com',
  tr1: 'tr1.api.riotgames.com',
  ru: 'ru.api.riotgames.com',
  ph2: 'ph2.api.riotgames.com',
  sg2: 'sg2.api.riotgames.com',
  th2: 'th2.api.riotgames.com',
  tw2: 'tw2.api.riotgames.com',
  vn2: 'vn2.api.riotgames.com',
};

// Map platform to regional routing
const platformToRegion: Record<string, string> = {
  na1: 'americas',
  br1: 'americas',
  la1: 'americas',
  la2: 'americas',
  euw1: 'europe',
  eun1: 'europe',
  tr1: 'europe',
  ru: 'europe',
  kr: 'asia',
  jp1: 'asia',
  oc1: 'sea',
  ph2: 'sea',
  sg2: 'sea',
  th2: 'sea',
  tw2: 'sea',
  vn2: 'sea',
};

async function riotFetch(url: string) {
  console.log(`Fetching: ${url}`);
  const response = await fetch(url, {
    headers: {
      'X-Riot-Token': RIOT_API_KEY!,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Riot API error (${response.status}): ${errorText}`);
    throw new Error(`Riot API error: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

// Get account by Riot ID (gameName#tagLine)
async function getAccountByRiotId(gameName: string, tagLine: string, region: string = 'europe') {
  const regionHost = REGIONS[region as keyof typeof REGIONS] || REGIONS.europe;
  const url = `https://${regionHost}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotFetch(url);
}

// Get summoner by PUUID
async function getSummonerByPuuid(puuid: string, platform: string = 'euw1') {
  const platformHost = PLATFORMS[platform as keyof typeof PLATFORMS] || PLATFORMS.euw1;
  const url = `https://${platformHost}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  return riotFetch(url);
}

// Get ranked stats
async function getRankedStats(summonerId: string, platform: string = 'euw1') {
  const platformHost = PLATFORMS[platform as keyof typeof PLATFORMS] || PLATFORMS.euw1;
  const url = `https://${platformHost}/lol/league/v4/entries/by-summoner/${summonerId}`;
  return riotFetch(url);
}

// Get match history (last X matches)
async function getMatchHistory(puuid: string, region: string = 'europe', count: number = 10) {
  const regionHost = REGIONS[region as keyof typeof REGIONS] || REGIONS.europe;
  const url = `https://${regionHost}/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&count=${count}`;
  return riotFetch(url);
}

// Get match details
async function getMatchDetails(matchId: string, region: string = 'europe') {
  const regionHost = REGIONS[region as keyof typeof REGIONS] || REGIONS.europe;
  const url = `https://${regionHost}/lol/match/v5/matches/${matchId}`;
  return riotFetch(url);
}

// Check if player is in game
async function getActiveGame(puuid: string, platform: string = 'euw1') {
  const platformHost = PLATFORMS[platform as keyof typeof PLATFORMS] || PLATFORMS.euw1;
  const url = `https://${platformHost}/lol/spectator/v5/active-games/by-summoner/${puuid}`;
  
  try {
    return await riotFetch(url);
  } catch (error) {
    // 404 means player is not in game - this is expected
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('404')) {
      return null;
    }
    throw error;
  }
}

// Get champion mastery
async function getChampionMastery(puuid: string, platform: string = 'euw1', count: number = 3) {
  const platformHost = PLATFORMS[platform as keyof typeof PLATFORMS] || PLATFORMS.euw1;
  const url = `https://${platformHost}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=${count}`;
  return riotFetch(url);
}

// Main function to get complete player data
async function getPlayerData(gameName: string, tagLine: string, platform: string = 'euw1') {
  const region = platformToRegion[platform] || 'europe';
  
  console.log(`Getting player data for ${gameName}#${tagLine} on ${platform} (${region})`);
  
  // Step 1: Get account info
  const account = await getAccountByRiotId(gameName, tagLine, region);
  console.log(`Found account: ${account.puuid}`);
  
  // Step 2: Get summoner info
  const summoner = await getSummonerByPuuid(account.puuid, platform);
  console.log(`Summoner ID: ${summoner.id}, Level: ${summoner.summonerLevel}`);
  
  // Step 3: Get ranked stats
  const rankedStats = await getRankedStats(summoner.id, platform);
  const soloQStats = rankedStats.find((q: any) => q.queueType === 'RANKED_SOLO_5x5');
  console.log(`Ranked stats: ${JSON.stringify(soloQStats)}`);
  
  // Step 4: Get match history (last 10 ranked games)
  const matchIds = await getMatchHistory(account.puuid, region, 10);
  console.log(`Found ${matchIds.length} recent matches`);
  
  // Step 5: Get match details for recent matches (limit to 5 for performance)
  const recentMatches = [];
  for (const matchId of matchIds.slice(0, 5)) {
    try {
      const match = await getMatchDetails(matchId, region);
      const participant = match.info.participants.find((p: any) => p.puuid === account.puuid);
      if (participant) {
        recentMatches.push({
          won: participant.win,
          championId: participant.championId.toString(),
          championName: participant.championName,
        });
      }
    } catch (error) {
      console.error(`Error fetching match ${matchId}:`, error);
    }
  }
  
  // Step 6: Check if player is in game
  let isInGame = false;
  try {
    const activeGame = await getActiveGame(account.puuid, platform);
    isInGame = activeGame !== null;
    console.log(`In game: ${isInGame}`);
  } catch (error) {
    console.error('Error checking active game:', error);
  }
  
  // Step 7: Get champion mastery for top champions
  let topChampions = [];
  try {
    const mastery = await getChampionMastery(account.puuid, platform, 3);
    topChampions = mastery.map((m: any) => ({
      id: m.championId.toString(),
      championPoints: m.championPoints,
      championLevel: m.championLevel,
    }));
    console.log(`Top champions: ${JSON.stringify(topChampions)}`);
  } catch (error) {
    console.error('Error fetching champion mastery:', error);
  }
  
  // Build player object
  const player = {
    id: account.puuid,
    summonerName: account.gameName,
    tagLine: account.tagLine,
    profileIconId: summoner.profileIconId,
    rank: soloQStats?.tier || 'UNRANKED',
    division: soloQStats?.rank || 'I',
    lp: soloQStats?.leaguePoints || 0,
    wins: soloQStats?.wins || 0,
    losses: soloQStats?.losses || 0,
    winRate: soloQStats ? Math.round((soloQStats.wins / (soloQStats.wins + soloQStats.losses)) * 100) : 0,
    recentMatches,
    topChampions,
    isInGame,
    lastUpdated: new Date().toISOString(),
  };
  
  return player;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RIOT_API_KEY) {
      throw new Error('RIOT_API_KEY is not configured');
    }

    const { action, gameName, tagLine, platform = 'euw1', players } = await req.json();
    
    console.log(`Action: ${action}, Platform: ${platform}`);

    switch (action) {
      case 'getPlayer': {
        if (!gameName || !tagLine) {
          throw new Error('gameName and tagLine are required');
        }
        const player = await getPlayerData(gameName, tagLine, platform);
        return new Response(JSON.stringify({ player }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'getMultiplePlayers': {
        if (!players || !Array.isArray(players)) {
          throw new Error('players array is required');
        }
        
        const results = [];
        for (const p of players) {
          try {
            const player = await getPlayerData(p.gameName, p.tagLine, p.platform || platform);
            results.push({ success: true, player });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Error fetching player ${p.gameName}#${p.tagLine}:`, error);
            results.push({ success: false, error: errorMessage, gameName: p.gameName, tagLine: p.tagLine });
          }
        }
        
        return new Response(JSON.stringify({ results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in riot-api function:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
