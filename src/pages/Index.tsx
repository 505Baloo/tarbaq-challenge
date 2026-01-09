import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Ladder } from '@/components/Ladder';
import { mockPlayers } from '@/data/mockPlayers';

const Index = () => {
  const [players, setPlayers] = useState(mockPlayers);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, this would fetch from Riot API
    setPlayers([...mockPlayers]);
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onRefresh={handleRefresh} 
        isLoading={isLoading}
        playerCount={players.length}
      />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Ladder players={players} />
        </motion.div>
      </main>

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>
    </div>
  );
};

export default Index;
