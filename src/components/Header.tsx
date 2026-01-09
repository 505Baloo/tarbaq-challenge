import { motion } from 'framer-motion';
import { Trophy, RefreshCw } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  playerCount: number;
}

export const Header = ({ onRefresh, isLoading, playerCount }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">SoloQ Ladder</h1>
            <p className="text-xs text-muted-foreground">{playerCount} challengers competing</p>
          </div>
        </motion.div>

        <div className="flex items-center gap-3">
          <motion.button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
