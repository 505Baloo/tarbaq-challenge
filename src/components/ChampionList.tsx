import { motion } from 'framer-motion';
import { Champion } from '@/types/player';
import { cn } from '@/lib/utils';

interface ChampionListProps {
  champions: Champion[];
}

export const ChampionList = ({ champions }: ChampionListProps) => {
  return (
    <div className="flex items-center gap-2">
      {champions.slice(0, 3).map((champion, index) => (
        <motion.div
          key={champion.id}
          className="group relative"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border transition-transform group-hover:scale-110">
            <img
              src={champion.imageUrl}
              alt={champion.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <motion.div
            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-card text-[10px] font-bold shadow-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <span className={cn(
              champion.winRate >= 55 ? 'text-success' :
              champion.winRate >= 50 ? 'text-foreground' :
              'text-destructive'
            )}>
              {champion.winRate}%
            </span>
          </motion.div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            <p className="font-medium">{champion.name}</p>
            <p className="text-muted-foreground">{champion.gamesPlayed} games</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
