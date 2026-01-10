import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const PLATFORM_TO_REGION: Record<string, string> = {
    'br1': 'americas', 'la1': 'americas', 'la2': 'americas', 'na1': 'americas',
    'euw1': 'europe', 'eun1': 'europe', 'tr1': 'europe', 'ru': 'europe',
    'kr': 'asia', 'jp1': 'asia', 'oc1': 'sea', 'ph2': 'sea', 'sg2': 'sea',
    'th2': 'sea', 'tw2': 'sea', 'vn2': 'sea',
};

const PLATFORM_NORMALIZE: Record<string, string> = {
    'euw': 'euw1', 'na': 'na1', 'eune': 'eun1', 'br': 'br1',
    'jp': 'jp1', 'lan': 'la1', 'las': 'la2', 'oce': 'oc1',
    'tr': 'tr1', 'ru': 'ru', 'kr': 'kr',
    'euw1': 'euw1', 'na1': 'na1', 'eun1': 'eun1', 'br1': 'br1',
    'jp1': 'jp1', 'la1': 'la1', 'la2': 'la2', 'oc1': 'oc1', 'tr1': 'tr1',
};

interface PlayerRequest {
    action: 'getPlayer' | 'getMultiplePlayers';
    gameName?: string;
    tagLine?: string;
    platform?: string;
    players?: Array<{ gameName: string; tagLine: string; platform?: string }>;
}

// --- HELPER FUNCTIONS ---
async function fetchRiotAPI(url: string) {
    const apiKey = Deno.env.get('RIOT_API_KEY');

    const response = await fetch(url, {
        headers: { 'X-Riot-Token': apiKey!, },
    });

    if (!response.ok) {
        throw { status: response.status, statusText: response.statusText };
    }

    return response.json();
}

async function getAccountByRiotId(gameName: string, tagLine: string, platform: string) {
    const region = PLATFORM_TO_REGION[platform] || 'americas';
    const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    return fetchRiotAPI(url);
}

async function getSummonerByPUUID(puuid: string, platform: string) {
    const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    return fetchRiotAPI(url);
}

async function getLeagueEntries(id: string, platform: string, isPuuid: boolean = false) {
    const endpointType = isPuuid ? 'by-puuid' : 'by-summoner';
    const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/${endpointType}/${id}`;

    try {
        return await fetchRiotAPI(url);
    } catch (err: any) {
        if (err.status === 404) return [];
        throw new Error(`Riot API error: ${err.status} ${err.statusText}`);
    }
}

async function getChampionMastery(puuid: string, platform: string) {
    // UPDATED: Ensure we get only top 3 to keep response clean
    const url = `https://${platform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=3`;
    return fetchRiotAPI(url);
}

// --- Get Active Game (Spectator V5) ---
async function getActiveGame(puuid: string, platform: string) {
    const url = `https://${platform}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`;

    try {
        const gameData = await fetchRiotAPI(url);
        return gameData;
    } catch (err: any) {
        if (err.status === 404 || err.status) {
            return null;
        }
        return null;
    }
}

// --- UPDATED MATCH HISTORY LOGIC ---
async function getMatchHistory(puuid: string, platform: string, desiredCount: number = 5) {
    const routingMap: Record<string, string> = {
        'euw1': 'europe', 'eun1': 'europe', 'tr1': 'europe', 'ru': 'europe',
        'na1': 'americas', 'br1': 'americas', 'la1': 'americas', 'la2': 'americas',
        'kr': 'asia', 'jp1': 'asia',
    };

    const routing = routingMap[platform] || 'americas';
    const baseUrl = `https://${routing}.api.riotgames.com`;

    // 1. We ask for MORE IDs than we need (buffer for remakes). 
    // If we want 5 games, we ask for 10 IDs.
    const buffer = 5;
    const matchListUrl = `${baseUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${desiredCount + buffer}`;

    try {
        const matchIds = await fetchRiotAPI(matchListUrl);
        const matches = [];

        for (const matchId of matchIds) {
            // STOP condition: If we already have 5 VALID matches, stop fetching.
            if (matches.length >= desiredCount) break;

            try {
                const matchUrl = `${baseUrl}/lol/match/v5/matches/${matchId}`;
                const matchData = await fetchRiotAPI(matchUrl);

                // --- REMAKE CHECK ---
                // If game duration is less than 270 seconds (4.5 mins), it's likely a remake.
                // We skip this iteration and don't add it to 'matches'.
                // The loop continues to the next ID to fill the slot.
                if (matchData.info.gameDuration < 270) {
                    continue;
                }

                matches.push(matchData);
            } catch (error) {
                console.error(`Failed to fetch match ${matchId}:`, error);
            }
        }
        return matches;
    } catch (e) {
        console.error("Match History Error", e);
        return [];
    }
}

// --- MAIN CONTROLLER ---
async function getPlayerData(gameName: string, tagLine: string, platform: string = 'euw1') {
    try {
        platform = PLATFORM_NORMALIZE[platform.toLowerCase()] || 'euw1';

        // 1. Get PUUID
        const account = await getAccountByRiotId(gameName, tagLine, platform);
        if (!account || !account.puuid) throw new Error(`Account not found: ${gameName}#${tagLine}`);
        const puuid = account.puuid;

        // 2. Get Summoner Info
        const summoner = await getSummonerByPUUID(puuid, platform);

        let lookupId = summoner.id;
        let usePuuidForLeague = false;

        if (!lookupId) {
            lookupId = puuid;
            usePuuidForLeague = true;
        }

        // 3. Parallel Requests
        // getMatchHistory now handles the "Remake Skip" logic internally
        const [leagueEntries, championMastery, activeGame, matches] = await Promise.all([
            getLeagueEntries(lookupId, platform, usePuuidForLeague),
            getChampionMastery(puuid, platform),
            getActiveGame(puuid, platform),
            getMatchHistory(puuid, platform, 5)
        ]);

        const rankedSolo = Array.isArray(leagueEntries)
            ? leagueEntries.find((entry: any) => entry.queueType === 'RANKED_SOLO_5x5')
            : null;

        // Process Matches
        const recentMatches = Array.isArray(matches) ? matches.map((match: any) => {
            if (!match?.info?.participants) return { won: false, championId: 0 };
            const participant = match.info.participants.find((p: any) => p.puuid === puuid);
            return {
                won: participant?.win || false,
                championId: participant?.championId?.toString() || '0',
                kda: participant ? `${participant.kills}/${participant.deaths}/${participant.assists}` : 'N/A'
            };
        }) : [];

        // Return Data
        return {
            id: lookupId,
            summonerName: account.gameName,
            tagLine: account.tagLine,
            profileIconId: summoner.profileIconId,
            rank: rankedSolo ? rankedSolo.tier : 'UNRANKED',
            division: rankedSolo ? rankedSolo.rank : '',
            lp: rankedSolo ? rankedSolo.leaguePoints : 0,
            wins: rankedSolo ? rankedSolo.wins : 0,
            losses: rankedSolo ? rankedSolo.losses : 0,
            winRate: rankedSolo ? Math.round((rankedSolo.wins / (rankedSolo.wins + rankedSolo.losses)) * 100) : 0,
            recentMatches,
            topChampions: Array.isArray(championMastery) ? championMastery.map((mastery: any) => ({
                id: mastery.championId.toString(),
                championPoints: mastery.championPoints,
            })) : [],
            activeGame: activeGame,
            lastUpdated: new Date().toISOString(),
        };

    } catch (error) {
        console.error(`Error processing ${gameName}#${tagLine}:`, error);
        throw error;
    }
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { action, gameName, tagLine, platform, players }: PlayerRequest = await req.json();

        if (action === 'getPlayer') {
            if (!gameName || !tagLine) {
                throw new Error('gameName and tagLine are required');
            }

            const player = await getPlayerData(gameName, tagLine, platform);

            return new Response(
                JSON.stringify({ player }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (action === 'getMultiplePlayers') {
            if (!players || !Array.isArray(players)) {
                throw new Error('players array is required');
            }

            const results = [];

            for (const playerReq of players) {
                try {
                    const player = await getPlayerData(
                        playerReq.gameName,
                        playerReq.tagLine,
                        playerReq.platform || platform || 'euw1'
                    );
                    results.push({
                        success: true,
                        gameName: playerReq.gameName,
                        tagLine: playerReq.tagLine,
                        player,
                    });
                } catch (error) {
                    console.log('Error inside loop:', error);
                    results.push({
                        success: false,
                        gameName: playerReq.gameName,
                        tagLine: playerReq.tagLine,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            return new Response(
                JSON.stringify({ results }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        throw new Error('Invalid action');
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
            {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
});
