import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Trophy, Clock, Calendar, Star, User, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { getLeaderboard, getAllRecentScores, getUserScores, type FirestoreScore, type LeaderboardEntry } from "@/lib/firestore";
import { AuthModal } from "@/components/auth/AuthModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const GAME_COLORS: Record<string, string> = {
  memory_match:    "bg-purple-500/15 text-purple-300 border-purple-700/30",
  number_sequence: "bg-blue-500/15 text-blue-300 border-blue-700/30",
  word_scramble:   "bg-emerald-500/15 text-emerald-300 border-emerald-700/30",
  math_sprint:     "bg-amber-500/15 text-amber-300 border-amber-700/30",
  color_stroop:    "bg-rose-500/15 text-rose-300 border-rose-700/30",
  reaction_blitz:  "bg-cyan-500/15 text-cyan-300 border-cyan-700/30",
  pattern_iq:      "bg-indigo-500/15 text-indigo-300 border-indigo-700/30",
  trivia_quest:    "bg-teal-500/15 text-teal-300 border-teal-700/30",
};

const MEDAL_COLORS = [
  "bg-yellow-500/20 text-yellow-400 border border-yellow-600/30",
  "bg-gray-400/20 text-gray-300 border border-gray-500/30",
  "bg-amber-700/20 text-amber-600 border border-amber-700/30",
];

function GameBadge({ gameType, gameName }: { gameType: string; gameName: string }) {
  const cls = GAME_COLORS[gameType] ?? "bg-zinc-700/30 text-zinc-300 border-zinc-600/30";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cls} whitespace-nowrap`}>
      {gameName}
    </span>
  );
}

function LeaderboardCard({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors"
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${MEDAL_COLORS[index] ?? "bg-zinc-700/20 text-zinc-400 border border-zinc-700/30"}`}>
        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
      </div>
      <Avatar className="w-9 h-9 shrink-0">
        <AvatarImage src={entry.photoURL ?? undefined} />
        <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
          {initials(entry.displayName ?? "?")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-sm truncate max-w-[120px]">{entry.displayName}</p>
          <GameBadge gameType={entry.gameType} gameName={entry.gameName} />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <Clock className="w-3 h-3 shrink-0" />
          <span>{Math.floor(entry.duration / 60)}:{String(entry.duration % 60).padStart(2, "0")}</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(entry.completedAt), "MMM d, yyyy")}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-xl font-black text-primary">{entry.score.toLocaleString()}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">pts</div>
      </div>
    </motion.div>
  );
}

function ScoreRow({ score, showPlayer = false }: { score: FirestoreScore; showPlayer?: boolean }) {
  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/20 transition-colors border-b border-border last:border-0">
      {showPlayer && (
        <Avatar className="w-7 h-7 shrink-0">
          <AvatarImage src={score.photoURL ?? undefined} />
          <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
            {initials(score.displayName ?? "?")}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="flex-1 min-w-0">
        {showPlayer && (
          <p className="text-xs font-semibold text-white truncate mb-0.5">{score.displayName}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <GameBadge gameType={score.gameType} gameName={score.gameName} />
          <span className="text-[10px] text-muted-foreground">{format(new Date(score.completedAt), "MMM d")}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-bold text-primary">{score.score.toLocaleString()}</div>
        <div className="text-[10px] text-muted-foreground">{Math.floor(score.duration / 60)}:{String(score.duration % 60).padStart(2, "0")}</div>
      </div>
    </div>
  );
}

export default function Scores() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [filterGame, setFilterGame] = useState<string>("all");

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["firestore", "leaderboard"],
    queryFn: getLeaderboard,
  });

  const { data: allScores, isLoading: allScoresLoading } = useQuery({
    queryKey: ["firestore", "scores"],
    queryFn: () => getAllRecentScores(50),
  });

  const { data: myScores, isLoading: myScoresLoading } = useQuery({
    queryKey: ["firestore", "myScores", user?.uid],
    queryFn: () => (user ? getUserScores(user.uid) : null),
    enabled: !!user,
  });

  const filteredGlobal = filterGame === "all"
    ? allScores
    : allScores?.filter(s => s.gameType === filterGame);

  const filteredMine = filterGame === "all"
    ? myScores
    : myScores?.filter(s => s.gameType === filterGame);

  const allGameTypes = Array.from(new Set(allScores?.map(s => s.gameType) ?? []));

  return (
    <>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Leaderboard</h1>
              <p className="text-muted-foreground text-sm">Top scores & game history</p>
            </div>
          </div>

          <Tabs defaultValue="leaderboard" className="w-full">
            <TabsList className="mb-6 w-full h-11 bg-card border border-border grid grid-cols-3">
              <TabsTrigger value="leaderboard" className="text-xs sm:text-sm data-[state=active]:bg-primary/20 rounded-lg">🏆 Top Scores</TabsTrigger>
              <TabsTrigger value="global" className="text-xs sm:text-sm data-[state=active]:bg-primary/20 rounded-lg">🌐 Global</TabsTrigger>
              <TabsTrigger value="mine" className="text-xs sm:text-sm data-[state=active]:bg-primary/20 rounded-lg">👤 My History</TabsTrigger>
            </TabsList>

            {/* LEADERBOARD TAB */}
            <TabsContent value="leaderboard" className="mt-0 space-y-3">
              {leaderboardLoading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
              ) : leaderboard && leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
                  <LeaderboardCard key={`${entry.gameType}-${index}`} entry={entry} index={index} />
                ))
              ) : (
                <EmptyState
                  icon={<Star className="w-10 h-10 text-muted-foreground opacity-40" />}
                  title="No top scores yet"
                  desc="Be the first to set a record!"
                />
              )}
            </TabsContent>

            {/* GLOBAL FEED TAB */}
            <TabsContent value="global" className="mt-0">
              <GameFilter
                types={allGameTypes}
                allScores={allScores ?? []}
                selected={filterGame}
                onChange={setFilterGame}
              />
              {allScoresLoading ? (
                <div className="space-y-2 mt-4">
                  {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                </div>
              ) : filteredGlobal && filteredGlobal.length > 0 ? (
                <div className="bg-card border border-border rounded-2xl overflow-hidden mt-4">
                  {filteredGlobal.map(score => (
                    <ScoreRow key={score.id} score={score} showPlayer />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Clock className="w-10 h-10 text-muted-foreground opacity-40" />}
                  title="No activity yet"
                  desc="Play some games to kick things off!"
                />
              )}
            </TabsContent>

            {/* MY HISTORY TAB */}
            <TabsContent value="mine" className="mt-0">
              {!user ? (
                <div className="text-center py-14 bg-card border border-border rounded-2xl px-6">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <h3 className="text-lg font-bold mb-2">Sign in to see your history</h3>
                  <p className="text-muted-foreground mb-6 text-sm">Your personal scores and progress are saved to your account.</p>
                  <Button onClick={() => setAuthOpen(true)} className="gap-2">Sign in</Button>
                </div>
              ) : (
                <>
                  <GameFilter
                    types={Array.from(new Set(myScores?.map(s => s.gameType) ?? []))}
                    allScores={myScores ?? []}
                    selected={filterGame}
                    onChange={setFilterGame}
                  />
                  {myScoresLoading ? (
                    <div className="space-y-2 mt-4">
                      {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                    </div>
                  ) : filteredMine && filteredMine.length > 0 ? (
                    <>
                      {/* Stats summary */}
                      <div className="grid grid-cols-3 gap-2 mb-4 mt-4">
                        {[
                          { label: "Total Games", value: myScores?.length ?? 0 },
                          { label: "Best Score", value: Math.max(0, ...(myScores?.map(s => s.score) ?? [0])) },
                          { label: "Avg Score", value: myScores?.length ? Math.round(myScores.reduce((a, s) => a + s.score, 0) / myScores.length) : 0 },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
                            <div className="font-black text-lg text-primary">{value.toLocaleString()}</div>
                            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{label}</div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        {filteredMine.map(score => (
                          <ScoreRow key={score.id} score={score} showPlayer={false} />
                        ))}
                      </div>

                      <div className="mt-4 text-center">
                        <Link href="/">
                          <Button variant="outline" className="border-border gap-2">Play More Games</Button>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <EmptyState
                      icon={<Clock className="w-10 h-10 text-muted-foreground opacity-40" />}
                      title="No games played yet"
                      desc="Your history will appear here after your first game."
                    />
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}

function GameFilter({
  types,
  allScores,
  selected,
  onChange,
}: {
  types: string[];
  allScores: FirestoreScore[];
  selected: string;
  onChange: (v: string) => void;
}) {
  if (types.length === 0) return null;
  const counts = types.reduce<Record<string, number>>((acc, t) => {
    acc[t] = allScores.filter(s => s.gameType === t).length;
    return acc;
  }, {});

  return (
    <div className="flex items-center gap-2 flex-wrap mt-1 mb-2">
      <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <button
        onClick={() => onChange("all")}
        className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition-colors ${
          selected === "all" ? "bg-primary/20 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
        }`}
      >
        All ({allScores.length})
      </button>
      {types.map(t => {
        const name = allScores.find(s => s.gameType === t)?.gameName ?? t;
        const cls = GAME_COLORS[t] ?? "bg-zinc-700/30 text-zinc-300 border-zinc-600/30";
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition-colors ${
              selected === t ? cls : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {name} ({counts[t] ?? 0})
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="text-center py-14 bg-card border border-border rounded-2xl px-6 mt-4">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{desc}</p>
    </div>
  );
}
