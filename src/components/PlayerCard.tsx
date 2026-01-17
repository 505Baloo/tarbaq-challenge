import { motion } from 'framer-motion';
import { Player } from '@/types/player';
import { RankBadge } from './RankBadge';
import { StreakDisplay } from './StreakDisplay';
import { ChampionList } from './ChampionList';
import { StatusIndicator } from './StatusIndicator';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
    player: Player;
    position: number;
}

export const PlayerCard = ({ player, position }: PlayerCardProps) => {
    const isTopThree = position <= 3;

    return (
        <motion.div
            className={cn(
                'relative overflow-hidden rounded-xl p-4 transition-all hover:border-primary/30',
                'bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50',
                'shadow-sm',
                isTopThree && 'border-primary/40 dark:border-primary/20'
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: position * 0.05 }}
            whileHover={{ y: -2 }}
            layout
        >
            {/* Position indicator */}
            <div className={cn(
                'absolute -left-2 top-4 flex h-8 w-12 items-center justify-center rounded-r-lg font-mono text-sm font-bold',
                position === 1 && 'bg-rank-gold text-slate-900',
                position === 2 && 'bg-rank-silver text-slate-800',
                position === 3 && 'bg-rank-bronze text-slate-900',
                position > 3 && 'bg-slate-300 dark:bg-secondary text-slate-700 dark:text-secondary-foreground'
            )}>
                #{position}
            </div>

            <div className="ml-8 grid gap-4 md:grid-cols-[1fr,auto,auto,auto,auto] md:items-center">
                {/* Player Info */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${player.profileIconId}.png`}
                            alt={player.summonerName}
                            className="h-12 w-12 rounded-lg border border-slate-300 dark:border-border object-cover"
                        />
                        {player.isInGame && (
                            <motion.div
                                className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-100 dark:border-card bg-green-500"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-foreground">{player.summonerName}</span>
                            <span className="text-xs text-slate-500 dark:text-muted-foreground">#{player.tagLine}</span>
                        </div>
                        <StatusIndicator isInGame={player.isInGame} />
                    </div>
                </div>

                {/* Rank */}
                <div className="flex flex-col items-start gap-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">Rank</span>
                    <RankBadge rank={player.rank} division={player.division} lp={player.lp} size="sm" />
                </div>

                {/* Win Rate */}
                <div className="flex flex-col items-start gap-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">Win Rate</span>
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            'font-mono text-lg font-bold',
                            player.winRate >= 55 ? 'text-green-600 dark:text-green-400' :
                                player.winRate >= 50 ? 'text-slate-700 dark:text-foreground' :
                                    'text-red-600 dark:text-red-400'
                        )}>
                            {player.winRate}%
                        </span>
                        <span className="text-xs text-slate-600 dark:text-muted-foreground font-medium">
                            {player.wins}W {player.losses}L
                        </span>
                    </div>
                </div>

                {/* Streak */}
                <div className="flex flex-col items-start gap-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">Recent</span>
                    <StreakDisplay matches={player.recentMatches} />
                </div>

                {/* Top Champions */}
                <div className="flex flex-col items-start gap-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">Most Played</span>
                    <ChampionList champions={player.topChampions} />
                </div>
            </div>
        </motion.div>
    );
};
