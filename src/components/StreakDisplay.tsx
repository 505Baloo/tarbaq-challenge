import { motion } from 'framer-motion';
import { MatchResult } from '@/types/player';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  matches: MatchResult[];
}

export const StreakDisplay = ({ matches }: StreakDisplayProps) => {
  const currentStreak = calculateStreak(matches);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {matches.slice(0, 5).map((match, index) => (
          <motion.div
            key={index}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded text-xs font-bold',
              match.won
                ? 'bg-success/20 text-success'
                : 'bg-destructive/20 text-destructive'
            )}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
          >
            {match.won ? 'W' : 'L'}
          </motion.div>
        ))}
      </div>
      {currentStreak !== 0 && (
        <motion.span
          className={cn(
            'text-xs font-medium',
            currentStreak > 0 ? 'text-success' : 'text-destructive'
          )}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {currentStreak > 0 ? `🔥 ${currentStreak}W Streak` : `❄️ ${Math.abs(currentStreak)}L Streak`}
        </motion.span>
      )}
    </div>
  );
};

function calculateStreak(matches: MatchResult[]): number {
  if (matches.length === 0) return 0;
  
  const firstResult = matches[0].won;
  let streak = 0;
  
  for (const match of matches) {
    if (match.won === firstResult) {
      streak++;
    } else {
      break;
    }
  }
  
  return firstResult ? streak : -streak;
}
