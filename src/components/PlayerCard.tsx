import { motion } from 'framer-motion';
import { Rank, Division } from '@/types/player';
import { cn } from '@/lib/utils';

interface RankBadgeProps {
    rank: Rank;
    division: Division;
    lp: number;
    size?: 'sm' | 'md' | 'lg';
}

const rankStyles: Record<Rank, { bg: string; text: string }> = {
    IRON: { bg: 'bg-rank-iron', text: 'text-slate-800' },
    BRONZE: { bg: 'bg-rank-bronze', text: 'text-slate-900' },
    SILVER: { bg: 'bg-rank-silver', text: 'text-slate-800' },
    GOLD: { bg: 'bg-rank-gold', text: 'text-amber-900' },
    PLATINUM: { bg: 'bg-rank-platinum', text: 'text-cyan-900' },
    EMERALD: { bg: 'bg-rank-emerald', text: 'text-emerald-950' },
    DIAMOND: { bg: 'bg-rank-diamond', text: 'text-blue-950' },
    MASTER: { bg: 'bg-rank-master', text: 'text-purple-950' },
    GRANDMASTER: { bg: 'bg-rank-grandmaster', text: 'text-red-950' },
    CHALLENGER: { bg: 'bg-rank-challenger', text: 'text-amber-950' },
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

    const styles = rankStyles[rank];

    return (
        <motion.div
            className={cn(
                'inline-flex items-center rounded-full font-semibold shadow-sm',
                styles.bg,
                styles.text,
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
            <span className="font-mono font-bold">{lp} LP</span>
        </motion.div>
    );
};
