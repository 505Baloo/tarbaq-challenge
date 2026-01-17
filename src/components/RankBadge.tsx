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
    IRON: { bg: 'bg-gradient-to-r from-slate-400 to-slate-500', text: 'text-white' },
    BRONZE: { bg: 'bg-gradient-to-r from-amber-700 to-amber-800', text: 'text-white' },
    SILVER: { bg: 'bg-gradient-to-r from-slate-400 to-slate-500', text: 'text-white' },
    GOLD: { bg: 'bg-gradient-to-r from-yellow-500 to-amber-500', text: 'text-slate-900' },
    PLATINUM: { bg: 'bg-gradient-to-r from-teal-400 to-cyan-500', text: 'text-slate-900' },
    EMERALD: { bg: 'bg-gradient-to-r from-emerald-500 to-green-600', text: 'text-white' },
    DIAMOND: { bg: 'bg-gradient-to-r from-blue-400 to-indigo-500', text: 'text-white' },
    MASTER: { bg: 'bg-gradient-to-r from-purple-500 to-violet-600', text: 'text-white' },
    GRANDMASTER: { bg: 'bg-gradient-to-r from-red-500 to-rose-600', text: 'text-white' },
    CHALLENGER: { bg: 'bg-gradient-to-r from-amber-400 to-yellow-500', text: 'text-slate-900' },
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
        sm: 'px-2.5 py-1 text-xs gap-1.5',
        md: 'px-3 py-1.5 text-sm gap-1.5',
        lg: 'px-4 py-2 text-base gap-2',
    };

    const styles = rankStyles[rank];

    return (
        <motion.div
            className={cn(
                'inline-flex items-center rounded-full font-semibold shadow-md',
                styles.bg,
                styles.text,
                sizeClasses[size]
            )}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
        >
            <span>{rankEmojis[rank]}</span>
            <span className="capitalize font-bold">
                {rank.toLowerCase()}
                {showDivision && ` ${division}`}
            </span>
            <span className="font-mono font-bold opacity-90">• {lp} LP</span>
        </motion.div>
    );
};
