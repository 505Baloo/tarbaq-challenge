import { motion } from 'framer-motion';

// Helper for Rank Colors
const getRankColor = (rank: string) => {
    if (rank.includes("CHALLENGER")) return "text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.5)]";
    if (rank.includes("GRANDMASTER")) return "text-red-400";
    if (rank.includes("MASTER")) return "text-purple-400";
    if (rank.includes("DIAMOND")) return "text-blue-400";
    if (rank.includes("PLATINUM")) return "text-cyan-400";
    if (rank.includes("GOLD")) return "text-yellow-600";
    if (rank.includes("SILVER")) return "text-slate-400";
    if (rank.includes("BRONZE")) return "text-orange-700";
    return "text-slate-500";
};

// Added maxGames to props
export const Ladder = ({ players, maxGames }: { players: any[], maxGames: number }) => {
    return (
        <>
            {players.map((player, index) => {

                // Check if player exceeded the limit
                const isOverLimit = player.gamesPlayed > maxGames;

                return (
                    <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={player.id}
                        className={`relative flex flex-col md:flex-row items-center gap-4 bg-slate-900/40 border p-4 rounded-xl transition-all group overflow-hidden
                            ${isOverLimit ? 'border-red-500/30 bg-red-950/10' : 'border-slate-800/60 hover:border-indigo-500/30'}
                        `}
                    >
                        {/* Rank Number */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-300' : index === 2 ? 'bg-orange-700' : 'bg-transparent'}`} />

                        <div className="flex items-center gap-4 w-full md:w-[35%] shrink-0 pl-4">
                            <span className={`text-2xl font-black italic w-8 ${index < 3 ? 'text-white' : 'text-slate-600'}`}>
                                #{index + 1}
                            </span>

                            <div className="relative">
                                <img
                                    src={player.profileIcon}
                                    alt=""
                                    className={`w-12 h-12 rounded-xl border-2 ${player.status === 'In Game' ? 'border-green-500' : 'border-slate-700'}`}
                                />
                                {player.status === 'In Game' && (
                                    <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col min-w-0">
                                <div className="flex items-baseline gap-2">
                                    <h3 className="font-bold text-white truncate">{player.name}</h3>
                                    <span className="text-xs text-slate-500 uppercase">{player.tag}</span>
                                </div>
                                <span className={`text-xs font-medium ${player.status === 'In Game' ? 'text-green-400' : 'text-slate-600'}`}>
                                    {player.status}
                                </span>
                            </div>
                        </div>

                        {/* Rank Info */}
                        <div className="flex flex-col items-center justify-center w-full md:w-[20%] border-l border-slate-800/50">
                            <span className={`font-black uppercase tracking-wider text-sm ${getRankColor(player.rank)}`}>
                                {player.rank} {player.division}
                            </span>
                            <span className="text-xs text-slate-400">{player.rank !== 'UNRANKED' && `${player.lp} LP`}</span>
                        </div>

                        {/* Total Winrate & GAME LIMIT INFO */}
                        <div className="flex flex-col items-center justify-center w-full md:w-[15%] border-l border-slate-800/50">
                            <span className={`font-bold text-lg ${player.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                                {player.winRate}%
                            </span>
                            {/* This is the new Games Played / Allowed Display */}
                            {isOverLimit ? (
                                <span className="text-[10px] uppercase text-red-500 font-black animate-pulse">
                                    Limit Exceeded ({player.gamesPlayed}/{maxGames})
                                </span>
                            ) : (
                                <span className="text-[10px] text-slate-500 uppercase font-medium">
                                    Matches: <span className="text-slate-300">{player.gamesPlayed}</span> / {maxGames}
                                </span>
                            )}
                        </div>

                        {/* Recent History (Pills) */}
                        <div className="hidden lg:flex flex-col items-center w-[15%] gap-1 border-l border-slate-800/50">
                            <span className="text-[10px] uppercase text-slate-600 font-bold mb-1">Recent</span>
                            <div className="flex gap-1">
                                {player.recentHistory.slice(0, 5).map((match: any, i: number) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 h-6 rounded-full ${match.result === 'W' ? 'bg-teal-500' : 'bg-rose-500/50'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Most Played (Champions) - Actually is champs played last 5 games with w/l infos */}
                        <div className="hidden lg:flex flex-col w-[15%] pl-4 border-l border-slate-800/50">
                            <span className="text-[10px] uppercase text-slate-600 font-bold mb-2">Last 5 games</span>
                            <div className="flex items-center gap-3">
                                {player.mostPlayed.length > 0 ? player.mostPlayed.map((champ: any) => (
                                    <div key={champ.id} className="flex flex-col items-center gap-1">
                                        <div className="relative group cursor-help">
                                            <img
                                                src={champ.iconUrl}
                                                alt={champ.name}
                                                className="w-8 h-8 rounded border border-slate-700/50 group-hover:border-indigo-500"
                                            />
                                            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded text-[10px] font-bold">
                                                {champ.winRate}%
                                            </div>
                                        </div>
                                        <span className="text-[8px] font-mono text-slate-400 whitespace-nowrap leading-none">
                                            <span className="text-green-500">{champ.wins}</span>-
                                            <span className="text-red-500">{champ.losses}</span>
                                        </span>
                                    </div>
                                )) : (
                                    <span className="text-xs text-slate-700 italic">No data</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </>
    );
};