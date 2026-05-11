import { useGetDailyChallenge, getGetDailyChallengeQueryKey, useListGames, getListGamesQueryKey } from "@workspace/api-client-react";
import { STATIC_GAMES, STATIC_DAILY_CHALLENGE } from "@/lib/static-games";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Brain, Flame, Target, Trophy, Clock, Star, ArrowRight, LogIn } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getPlayerStats } from "@/lib/firestore";
import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";

export default function Home() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const { data: dailyChallenge, isLoading: challengeLoading } = useGetDailyChallenge({ query: { queryKey: getGetDailyChallengeQueryKey(), placeholderData: STATIC_DAILY_CHALLENGE } });
  const { data: games, isLoading: gamesLoading } = useListGames({ query: { queryKey: getListGamesQueryKey(), placeholderData: STATIC_GAMES } });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["firestore", "stats", user?.uid],
    queryFn: () => (user ? getPlayerStats(user.uid) : null),
    enabled: !!user,
  });

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Welcome Back</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                {user ? `Sharpen your mind, ${user.displayName?.split(" ")[0] ?? "Player"}.` : "Sharpen your mind with today's Lorapok BrainSpark challenges."}
              </p>
            </div>

            {user ? (
              statsLoading ? (
                <Skeleton className="h-16 w-56 rounded-2xl" />
              ) : stats ? (
                <motion.div variants={item} className="flex gap-4">
                  <div className="bg-card border border-border px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
                    <Flame className={`w-6 h-6 ${stats.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
                    <div>
                      <div className="text-sm text-muted-foreground font-medium">Streak</div>
                      <div className="font-bold text-xl leading-none">{stats.currentStreak} Days</div>
                    </div>
                  </div>
                  <div className="bg-card border border-border px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
                    <Target className="w-6 h-6 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground font-medium">Daily Goal</div>
                      <div className="font-bold text-xl leading-none">{stats.gamesPlayedToday}/{stats.dailyGoal}</div>
                    </div>
                  </div>
                </motion.div>
              ) : null
            ) : (
              <motion.div variants={item}>
                <button
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-3 bg-card border border-border px-5 py-3 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <LogIn className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <div className="text-sm font-semibold">Sign in to track progress</div>
                    <div className="text-xs text-muted-foreground">Save scores & join the leaderboard</div>
                  </div>
                </button>
              </motion.div>
            )}
          </div>

          {/* Stats bar (signed in only) */}
          {user && stats && (
            <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Games Played", value: stats.totalGamesPlayed },
                { label: "Avg Score", value: stats.averageScore },
                { label: "Best Streak", value: `${stats.longestStreak}d` },
                { label: "Avg Score", value: stats.averageScore },
              ].map(({ label, value }, i) => (
                <div key={i} className="bg-card border border-border rounded-xl px-4 py-3 text-center">
                  <div className="text-2xl font-black">{value}</div>
                  <div className="text-xs text-muted-foreground font-medium mt-0.5">{label}</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Daily challenge */}
          <motion.section variants={item}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Today's Daily Challenge</h2>
              {dailyChallenge && (
                <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {dailyChallenge.completedCount} of {dailyChallenge.totalGames} completed
                </span>
              )}
            </div>

            {challengeLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
              </div>
            ) : dailyChallenge ? (
              <div className="grid md:grid-cols-3 gap-6">
                {dailyChallenge.games.map((game) => (
                  <Link key={game.id} href={`/game/${game.type}`}>
                    <div className="group bg-card border border-border p-6 rounded-2xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer h-full flex flex-col">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {game.type === "memory_match" && <Brain className="w-6 h-6" />}
                        {game.type === "number_sequence" && <Clock className="w-6 h-6" />}
                        {game.type === "word_scramble" && <Star className="w-6 h-6" />}
                      </div>
                      <h3 className="font-bold text-xl mb-2">{game.name}</h3>
                      <p className="text-muted-foreground text-sm flex-1">{game.description}</p>
                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
                          {game.difficulty}
                        </span>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border p-8 rounded-2xl text-center">
                <p className="text-muted-foreground">Unable to load daily challenge.</p>
              </div>
            )}
          </motion.section>

          {/* Quick play */}
          <motion.section variants={item}>
            <h2 className="text-2xl font-bold tracking-tight mb-6">Quick Play</h2>
            {gamesLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
              </div>
            ) : games ? (
              <div className="grid md:grid-cols-3 gap-6">
                {games.map((game) => {
                  const bestKey = game.type as "memory_match" | "number_sequence" | "word_scramble";
                  const best = stats?.bestScores?.[bestKey] ?? null;
                  return (
                    <Link key={game.id} href={`/game/${game.type}`}>
                      <div className="group bg-card/50 border border-border p-6 rounded-2xl hover:bg-card transition-all duration-300">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{game.name}</h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{game.description}</p>
                        {best !== null && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span>Your best: {best}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </motion.section>
        </motion.div>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
