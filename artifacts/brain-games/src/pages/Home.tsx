import { useGetDailyChallenge, getGetDailyChallengeQueryKey, useListGames, getListGamesQueryKey } from "@workspace/api-client-react";
import { STATIC_GAMES, STATIC_DAILY_CHALLENGE } from "@/lib/static-games";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Brain, Flame, Target, Trophy, Clock, Star, ArrowRight, LogIn, Lock, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getPlayerStats, type PlayerStats } from "@/lib/firestore";
import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";

const XP_PER_GAME = 50;
const XP_PER_LEVEL = 500;

function calcLevel(totalGames: number) {
  const xp = totalGames * XP_PER_GAME;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp % XP_PER_LEVEL;
  const pct = xpInLevel / XP_PER_LEVEL;
  return { level, xp, xpInLevel, pct };
}

interface Achievement {
  id: string;
  label: string;
  desc: string;
  icon: string;
  unlocked: (s: PlayerStats) => boolean;
  color: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_step",
    label: "First Step",
    desc: "Play your first game",
    icon: "🎮",
    unlocked: s => s.totalGamesPlayed >= 1,
    color: "border-zinc-500 bg-zinc-800/60",
  },
  {
    id: "daily_hero",
    label: "Daily Hero",
    desc: "Complete all 3 daily games",
    icon: "✅",
    unlocked: s => s.gamesPlayedToday >= 3,
    color: "border-emerald-600/50 bg-emerald-900/20",
  },
  {
    id: "on_fire",
    label: "On Fire",
    desc: "Reach a 3-day streak",
    icon: "🔥",
    unlocked: s => s.currentStreak >= 3,
    color: "border-orange-600/50 bg-orange-900/20",
  },
  {
    id: "speed_demon",
    label: "Speed Demon",
    desc: "Reach a 7-day streak",
    icon: "⚡",
    unlocked: s => s.currentStreak >= 7,
    color: "border-yellow-600/50 bg-yellow-900/20",
  },
  {
    id: "memory_master",
    label: "Memory Master",
    desc: "Score 800+ in Memory Match",
    icon: "🧠",
    unlocked: s => (s.bestScores.memory_match ?? 0) >= 800,
    color: "border-purple-600/50 bg-purple-900/20",
  },
  {
    id: "word_wizard",
    label: "Word Wizard",
    desc: "Score 700+ in Word Scramble",
    icon: "📖",
    unlocked: s => (s.bestScores.word_scramble ?? 0) >= 700,
    color: "border-blue-600/50 bg-blue-900/20",
  },
  {
    id: "number_ninja",
    label: "Number Ninja",
    desc: "Score 500+ in Number Sequence",
    icon: "🔢",
    unlocked: s => (s.bestScores.number_sequence ?? 0) >= 500,
    color: "border-cyan-600/50 bg-cyan-900/20",
  },
  {
    id: "veteran",
    label: "Veteran",
    desc: "Play 20+ total games",
    icon: "🏆",
    unlocked: s => s.totalGamesPlayed >= 20,
    color: "border-amber-600/50 bg-amber-900/20",
  },
];

export default function Home() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const { data: _dailyChallenge, isLoading: challengeLoading } = useGetDailyChallenge({
    query: { queryKey: getGetDailyChallengeQueryKey(), retry: false },
  });
  const dailyChallenge = _dailyChallenge ?? STATIC_DAILY_CHALLENGE;

  const { data: _games, isLoading: gamesLoading } = useListGames({
    query: { queryKey: getListGamesQueryKey(), retry: false },
  });
  const games = _games ?? STATIC_GAMES;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["firestore", "stats", user?.uid],
    queryFn: () => (user ? getPlayerStats(user.uid) : null),
    enabled: !!user,
  });

  const levelInfo = stats ? calcLevel(stats.totalGamesPlayed) : null;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">

          {/* Header */}
          <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                {user ? `Welcome back, ${user.displayName?.split(" ")[0] ?? "Player"} 👋` : "Welcome Back"}
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                {user ? "Your mind is your weapon — sharpen it daily." : "Sharpen your mind with today's Lorapok BrainSpark challenges."}
              </p>
            </div>

            {user ? (
              statsLoading ? (
                <Skeleton className="h-16 w-56 rounded-2xl" />
              ) : stats ? (
                <motion.div variants={item} className="flex gap-3">
                  <div className="bg-card border border-border px-4 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
                    <Flame className={`w-6 h-6 ${stats.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Streak</div>
                      <div className="font-bold text-xl leading-none">{stats.currentStreak}d</div>
                    </div>
                  </div>
                  <div className="bg-card border border-border px-4 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
                    <Target className="w-6 h-6 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Today</div>
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
          </motion.div>

          {/* XP / Level bar */}
          {user && levelInfo && (
            <motion.div variants={item} className="bg-card border border-border rounded-2xl px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Level {levelInfo.level}</div>
                    <div className="text-xs text-muted-foreground">{levelInfo.xp} XP total</div>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <span className="text-primary font-semibold">{levelInfo.xpInLevel}</span> / {XP_PER_LEVEL} XP to Level {levelInfo.level + 1}
                </div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-violet-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.pct * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {/* Stats row */}
          {user && stats && (
            <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Games Played", value: stats.totalGamesPlayed, icon: "🎮" },
                { label: "Avg Score",    value: stats.averageScore,      icon: "📊" },
                { label: "Best Streak",  value: `${stats.longestStreak}d`, icon: "🔥" },
                { label: "Today",        value: `${stats.gamesPlayedToday}/${stats.dailyGoal}`, icon: "✅" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-card border border-border rounded-xl px-4 py-3 text-center">
                  <div className="text-lg mb-0.5">{icon}</div>
                  <div className="text-2xl font-black">{value}</div>
                  <div className="text-xs text-muted-foreground font-medium mt-0.5">{label}</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Daily challenge */}
          <motion.section variants={item}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold tracking-tight">Today's Daily Challenge</h2>
              {dailyChallenge && (
                <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {dailyChallenge.completedCount} of {dailyChallenge.totalGames} completed
                </span>
              )}
            </div>

            {challengeLoading ? (
              <div className="grid md:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
              </div>
            ) : dailyChallenge ? (
              <div className="grid md:grid-cols-3 gap-5">
                {dailyChallenge.games.map((game) => (
                  <Link key={game.id} href={`/game/${game.type}`}>
                    <div className="group bg-card border border-border p-6 rounded-2xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer h-full flex flex-col">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {game.type === "memory_match"    && <Brain className="w-6 h-6" />}
                        {game.type === "number_sequence" && <Clock className="w-6 h-6" />}
                        {game.type === "word_scramble"   && <Star  className="w-6 h-6" />}
                      </div>
                      <h3 className="font-bold text-xl mb-2">{game.name}</h3>
                      <p className="text-muted-foreground text-sm flex-1">{game.description}</p>
                      <div className="mt-5 flex items-center justify-between">
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
            <h2 className="text-2xl font-bold tracking-tight mb-5">Quick Play</h2>
            {gamesLoading ? (
              <div className="grid md:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-5">
                {games.map((game) => {
                  const bestKey = game.type as "memory_match" | "number_sequence" | "word_scramble";
                  const best = stats?.bestScores?.[bestKey] ?? null;
                  return (
                    <Link key={game.id} href={`/game/${game.type}`}>
                      <div className="group bg-card/50 border border-border p-6 rounded-2xl hover:bg-card transition-all duration-300 hover:border-primary/30">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{game.name}</h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{game.description}</p>
                        {best !== null && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span>Best: <span className="text-white font-semibold">{best}</span></span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.section>

          {/* Achievements */}
          {user && stats && (
            <motion.section variants={item}>
              <h2 className="text-2xl font-bold tracking-tight mb-5">Achievements</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ACHIEVEMENTS.map(achievement => {
                  const unlocked = achievement.unlocked(stats);
                  return (
                    <motion.div
                      key={achievement.id}
                      whileHover={unlocked ? { scale: 1.03, y: -2 } : {}}
                      className={`relative p-4 rounded-2xl border text-center transition-all ${
                        unlocked
                          ? `${achievement.color} shadow-sm`
                          : "border-zinc-800 bg-zinc-900/30 opacity-45 grayscale"
                      }`}
                    >
                      {!unlocked && (
                        <Lock className="w-3 h-3 text-zinc-600 absolute top-2 right-2" />
                      )}
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <div className="font-bold text-xs sm:text-sm text-white leading-tight">{achievement.label}</div>
                      <div className="text-xs text-zinc-500 mt-1 leading-tight">{achievement.desc}</div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* Sign-in prompt for guests */}
          {!user && (
            <motion.div variants={item} className="bg-card/50 border border-primary/20 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-2">Track Your Progress</h3>
              <p className="text-muted-foreground text-sm mb-5 max-w-xs mx-auto">
                Sign in to unlock streaks, achievements, leaderboards, and multiplayer mode.
              </p>
              <button
                onClick={() => setAuthOpen(true)}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                <LogIn className="w-4 h-4" /> Sign In Free
              </button>
            </motion.div>
          )}

        </motion.div>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
