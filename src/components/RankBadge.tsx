import { motion } from 'framer-motion';
import { Rank, Division } from '@/types/player';
import { cn } from '@/lib/utils';

interface RankBadgeProps {
  rank: Rank;
  division: Division;
  lp: number;
  size?: 'sm' | 'md' | 'lg';
}

const rankColors: Record<Rank, string> = {
  IRON: 'rank-iron bg-rank-iron',
  BRONZE: 'rank-bronze bg-rank-bronze',
  SILVER: 'rank-silver bg-rank-silver',
  GOLD: 'rank-gold bg-rank-gold',
  PLATINUM: 'rank-platinum bg-rank-platinum',
  EMERALD: 'rank-emerald bg-rank-emerald',
  DIAMOND: 'rank-diamond bg-rank-diamond',
  MASTER: 'rank-master bg-rank-master',
  GRANDMASTER: 'rank-grandmaster bg-rank-grandmaster',
  CHALLENGER: 'rank-challenger bg-rank-challenger',
};

const rankEmojis: Record<Rank, string> = {
  IRON: '🪨',
  BRONZE: '🥉',
  SILVER: '🥈',
  GOLD: '🥇',
  PLATINUM: '💎',
  EMERALD: '💚',
  DIAMOND: '💠',
  MASTER: '🏆',
  GRANDMASTER: '👑',
  CHALLENGER: '⚔️',
};

export const RankBadge = ({ rank, division, lp, size = 'md' }: RankBadgeProps) => {
  const showDivision = !['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(rank);
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  return (
    <motion.div
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        rankColors[rank],
        sizeClasses[size]
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <span>{rankEmojis[rank]}</span>
      <span className="capitalize">
        {rank.toLowerCase()}
        {showDivision && ` ${division}`}
      </span>
      <span className="font-mono opacity-80">{lp} LP</span>
    </motion.div>
  );
};
