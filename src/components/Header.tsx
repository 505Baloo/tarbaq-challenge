import { RefreshCw, Trophy, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
    currentDay: number;
    totalDays: number;
    maxGamesAllowed: number;
    lastUpdated: Date | null;
    isLoading: boolean;
    onRefresh: () => void;
}

export const Header = ({
    currentDay,
    totalDays,
    maxGamesAllowed,
    lastUpdated,
    isLoading,
    onRefresh
}: HeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-yellow-500/10 p-2 rounded-xl border border-yellow-500/20">
                        <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white">
                        Tarba Solo/DuoQ <span className="text-indigo-600 dark:text-indigo-400">Challenge</span>
                    </h1>
                </div>
                <div className="ml-1 space-y-1">
                    <div className="flex items-center gap-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                            <CalendarClock className="w-4 h-4" />
                            Day {currentDay} <span className="text-slate-400 dark:text-slate-500">/ {totalDays}</span>
                        </span>
                        <span className="ml-2 pl-4 border-l border-slate-300 dark:border-slate-700">
                            Max Games Allowed : <span className="text-slate-900 dark:text-white">{maxGamesAllowed}</span>
                        </span>
                    </div>
                    <p className="text-xs text-slate-500">
                        Last updated {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <ThemeToggle />

                <Button onClick={onRefresh} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md dark:shadow-none">
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
            </div>
        </div>
    );
};
