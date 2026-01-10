import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from "@/integrations/supabase/client";
import { Toggle } from "@/components/ui/toggle";
import { Gamepad2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Ladder } from '@/components/Ladder';
import { Header } from '@/components/Header';

// --- CONFIGURATION ---
const CHALLENGE_START_DATE = new Date("2026-01-08");
const DAILY_GAME_LIMIT = 5;
const CHALLENGE_DURATION_DAYS = 90;

const TARBAS = [
    { gameName: "I Split", tagLine: "FIORA", platform: "euw" },
    { gameName: "RoiDesSingeries", tagLine: "Singe", platform: "euw" },
    { gameName: "Uno Dos Thresh", tagLine: "7822", platform: "euw" },
    { gameName: "HEY BAKARRRRRRRR", tagLine: "EUW", platform: "euw" },
    { gameName: "DUMB TANK PLAYER", tagLine: "FF15", platform: "euw" },
    { gameName: "temu beifeng", tagLine: "172", platform: "euw" },
];

type SortOption = 'rank' | 'winrate' | 'games';

const Index = () => {
    const [rawPlayers, setRawPlayers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>('rank');
    const [inGameOnly, setInGameOnly] = useState(false);

    const { toast } = useToast();

    // --- CALCULATE STATS ---
    const challengeStats = useMemo(() => {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - CHALLENGE_START_DATE.getTime());
        const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const currentDay = Math.max(1, Math.min(daysPassed, CHALLENGE_DURATION_DAYS));
        const maxGamesAllowed = currentDay * DAILY_GAME_LIMIT;
        return { currentDay, maxGamesAllowed };
    }, []);

    // 1. FETCH DATA
    const loadRealData = useCallback(async () => {
        setIsLoading(true);
        try {
            console.log("--- STARTING REFRESH ---");
            const { data, error } = await supabase.functions.invoke('riot-api', {
                body: { action: 'getMultiplePlayers', players: TARBAS },
            });
            if (error) throw error;
            if (data?.results) {
                const successfulLoads = data.results
                    .filter((r: any) => r.success)
                    .map((r: any) => transformPlayerData(r.player));
                setRawPlayers(successfulLoads);
                setLastUpdated(new Date());
                if (successfulLoads.length > 0) {
                    toast({ title: "Updated", description: `Synced ${successfulLoads.length} players.` });
                }
            }
        } catch (err) {
            console.error("Critical Failure:", err);
            toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // 2. TRANSFORM DATA
    const transformPlayerData = (p: any) => {
        const history = Array.isArray(p.recentMatches) ? p.recentMatches : [];
        let relevantMatches = history.filter((m: any) => m.queueId == 420);
        if (relevantMatches.length === 0) relevantMatches = history;

        const rawActive = p.activeGame || p.spectatorData;
        let isActuallyInGame = false;
        if (rawActive) {
            if (rawActive.status && rawActive.status.status_code === 404) isActuallyInGame = false;
            else if (rawActive.gameId && rawActive.gameId !== 0) isActuallyInGame = true;
            else if (p.isInGame === true) isActuallyInGame = true;
        }

        const champStats = new Map();
        relevantMatches.forEach((match: any) => {
            const champId = match.championName || match.championId;
            if (!champId) return;
            if (!champStats.has(champId)) champStats.set(champId, { name: champId, count: 0, wins: 0 });
            const stat = champStats.get(champId);
            stat.count++;
            if (match.won) stat.wins++;
        });

        const calculatedTopChamps = Array.from(champStats.values())
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 3)
            .map((c: any) => ({
                id: c.name,
                name: c.name,
                iconUrl: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${c.name}.png`,
                winRate: Math.round((c.wins / c.count) * 100),
                totalGames: c.count,
                wins: c.wins,
                losses: c.count - c.wins
            }));

        const tiers: Record<string, number> = { "CHALLENGER": 9000, "GRANDMASTER": 8000, "MASTER": 7000, "DIAMOND": 6000, "EMERALD": 5000, "PLATINUM": 4000, "GOLD": 3000, "SILVER": 2000, "BRONZE": 1000, "IRON": 0 };
        const divisions: Record<string, number> = { "I": 400, "II": 300, "III": 200, "IV": 100 };
        const tierScore = (tiers[p.rank] || -1000) + (divisions[p.division] || 0) + (p.lp || 0);

        return {
            id: p.id || p.summonerName,
            name: p.summonerName,
            tag: p.tagLine,
            rank: p.rank || "UNRANKED",
            division: p.division || "",
            lp: p.lp || 0,
            rawTier: tierScore,
            wins: p.wins || 0,
            losses: p.losses || 0,
            winRate: p.winRate || 0,
            gamesPlayed: (p.wins || 0) + (p.losses || 0),
            status: isActuallyInGame ? 'In Game' : 'Offline',
            profileIcon: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${p.profileIconId}.jpg`,
            recentHistory: history.map((m: any) => ({ result: m.won ? 'W' : 'L' })),
            mostPlayed: calculatedTopChamps
        };
    };

    // 3. SORT & FILTER
    const processedPlayers = useMemo(() => {
        let result = [...rawPlayers];
        if (inGameOnly) result = result.filter(p => p.status === 'In Game');
        result.sort((a, b) => {
            if (sortBy === 'rank') return b.rawTier - a.rawTier;
            if (sortBy === 'winrate') return b.winRate - a.winRate;
            if (sortBy === 'games') return b.gamesPlayed - a.gamesPlayed;
            return 0;
        });
        return result;
    }, [rawPlayers, sortBy, inGameOnly]);

    useEffect(() => { loadRealData() }, [loadRealData]);

    return (
        // LIGHT: bg-slate-50 (Clean grey/white)
        // DARK: bg-[#020617] (Deep space blue)
        <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-[#020617]">

            {/* Background Blobs - Hidden in Light mode to keep it clean, Visible in Dark */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-0 dark:opacity-100 transition-opacity duration-500">
                <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px]" />
            </div>

            <main className="relative container mx-auto px-4 py-10 max-w-6xl">

                <Header
                    currentDay={challengeStats.currentDay}
                    totalDays={CHALLENGE_DURATION_DAYS}
                    maxGamesAllowed={challengeStats.maxGamesAllowed}
                    lastUpdated={lastUpdated}
                    isLoading={isLoading}
                    onRefresh={loadRealData}
                />

                {/* CONTROLS BAR */}
                {/* Light: White bg, border, shadow */}
                {/* Dark: Glassmorphism slate-900 */}
                <div className="flex justify-between items-center p-2 rounded-xl mb-8 backdrop-blur-md transition-all
                    bg-white border border-slate-200 shadow-sm
                    dark:bg-slate-900/60 dark:border-slate-800 dark:shadow-none">

                    <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950/50">
                        {(['rank', 'winrate', 'games'] as const).map((option) => (
                            <button
                                key={option}
                                onClick={() => setSortBy(option)}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold uppercase transition-all
                                ${sortBy === option
                                        ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-white dark:shadow-none'
                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-400'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    <Toggle pressed={inGameOnly} onPressedChange={setInGameOnly}
                        className="data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-700 hover:bg-slate-100
                        dark:data-[state=on]:bg-indigo-500/20 dark:data-[state=on]:text-indigo-300 dark:hover:bg-slate-800"
                    >
                        <Gamepad2 className="w-4 h-4 mr-2" /> In Game Only
                    </Toggle>
                </div>

                <motion.div layout className="space-y-3">
                    <Ladder players={processedPlayers} maxGames={challengeStats.maxGamesAllowed} />
                </motion.div>

                {processedPlayers.length === 0 && !isLoading && (
                    <div className="text-center py-20 rounded-xl border border-dashed
                        bg-slate-100 border-slate-300
                        dark:bg-slate-900/30 dark:border-slate-800">
                        <p className="text-slate-500 mb-2">No players found.</p>
                        {inGameOnly && <p className="text-xs text-indigo-500 dark:text-indigo-400">Try turning off 'In Game Only'</p>}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Index;
