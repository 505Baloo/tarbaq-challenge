import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  isInGame: boolean;
}

export const StatusIndicator = ({ isInGame }: StatusIndicatorProps) => {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        className={cn(
          'h-2.5 w-2.5 rounded-full',
          isInGame ? 'bg-success' : 'bg-muted-foreground'
        )}
        animate={isInGame ? {
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <span className={cn(
        'text-sm font-medium',
        isInGame ? 'text-success' : 'text-muted-foreground'
      )}>
        {isInGame ? 'In Game' : 'Offline'}
      </span>
    </div>
  );
};
