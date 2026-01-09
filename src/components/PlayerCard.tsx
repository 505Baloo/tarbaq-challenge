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
        'glass-card relative overflow-hidden rounded-xl p-4 transition-all hover:border-primary/30',
        isTopThree && 'border-primary/20'
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
        position === 1 && 'bg-rank-gold text-primary-foreground',
        position === 2 && 'bg-rank-silver text-foreground',
        position === 3 && 'bg-rank-bronze text-foreground',
        position > 3 && 'bg-secondary text-secondary-foreground'
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
              className="h-12 w-12 rounded-lg border border-border object-cover"
            />
            {player.isInGame && (
              <motion.div
                className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card bg-success"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{player.summonerName}</span>
              <span className="text-xs text-muted-foreground">#{player.tagLine}</span>
            </div>
            <StatusIndicator isInGame={player.isInGame} />
          </div>
        </div>

        {/* Rank */}
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-muted-foreground">Rank</span>
          <RankBadge rank={player.rank} division={player.division} lp={player.lp} size="sm" />
        </div>

        {/* Win Rate */}
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-muted-foreground">Win Rate</span>
          <div className="flex items-center gap-2">
            <span className={cn(
              'font-mono text-lg font-bold',
              player.winRate >= 55 ? 'text-success' :
              player.winRate >= 50 ? 'text-foreground' :
              'text-destructive'
            )}>
              {player.winRate}%
            </span>
            <span className="text-xs text-muted-foreground">
              {player.wins}W {player.losses}L
            </span>
          </div>
        </div>

        {/* Streak */}
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-muted-foreground">Recent</span>
          <StreakDisplay matches={player.recentMatches} />
        </div>

        {/* Top Champions */}
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-muted-foreground">Most Played</span>
          <ChampionList champions={player.topChampions} />
        </div>
      </div>
    </motion.div>
  );
};
