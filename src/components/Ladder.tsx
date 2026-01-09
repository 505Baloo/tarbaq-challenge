import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Filter } from 'lucide-react';
import { Player, rankOrder, divisionOrder } from '@/types/player';
import { PlayerCard } from './PlayerCard';
import { cn } from '@/lib/utils';

interface LadderProps {
  players: Player[];
}

type SortBy = 'rank' | 'winrate' | 'games';

export const Ladder = ({ players }: LadderProps) => {
  const [sortBy, setSortBy] = useState<SortBy>('rank');
  const [showInGameOnly, setShowInGameOnly] = useState(false);

  const sortedPlayers = useMemo(() => {
    let filtered = showInGameOnly 
      ? players.filter(p => p.isInGame)
      : players;

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rank':
          const rankDiff = rankOrder[b.rank] - rankOrder[a.rank];
          if (rankDiff !== 0) return rankDiff;
          const divDiff = divisionOrder[b.division] - divisionOrder[a.division];
          if (divDiff !== 0) return divDiff;
          return b.lp - a.lp;
        case 'winrate':
          return b.winRate - a.winRate;
        case 'games':
          return (b.wins + b.losses) - (a.wins + a.losses);
        default:
          return 0;
      }
    });
  }, [players, sortBy, showInGameOnly]);

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: 'rank', label: 'Rank' },
    { value: 'winrate', label: 'Win Rate' },
    { value: 'games', label: 'Games' },
  ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <motion.div
        className="flex flex-wrap items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <div className="flex gap-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  sortBy === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowInGameOnly(!showInGameOnly)}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            showInGameOnly
              ? 'bg-success/20 text-success'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          <Filter className="h-4 w-4" />
          In Game Only
        </button>
      </motion.div>

      {/* Player List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedPlayers.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              position={index + 1}
            />
          ))}
        </AnimatePresence>

        {sortedPlayers.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-muted-foreground">No players found</p>
            {showInGameOnly && (
              <button
                onClick={() => setShowInGameOnly(false)}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Show all players
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
