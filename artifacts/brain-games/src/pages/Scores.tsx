import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Trophy, Clock, Calendar, Star, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { getLeaderboard, getAllRecentScores, getUserScores } from "@/lib/firestore";
import { AuthModal } from "@/components/auth/AuthModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Scores() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["firestore", "leaderboard"],
    queryFn: getLeaderboard,
  });

  const { data: allScores, isLoading: allScoresLoading } = useQuery({
    queryKey: ["firestore", "scores"],
    queryFn: () => getAllRecentScores(30),
  });

  const { data: myScores, isLoading: myScoresLoading } = useQuery({
    queryKey: ["firestore", "myScores", user?.uid],
    queryFn: () => (user ? getUserScores(user.uid) : null),
    enabled: !!user,
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Leaderboard & History</h1>
          </div>

          <Tabs defaultValue="leaderboard" className="w-full">
            <TabsList className="mb-8 w-full max-w-lg h-12 bg-card border border-border">
              <TabsTrigger value="leaderboard" className="flex-1 data-[state=active]:bg-primary/20">Top Scores</TabsTrigger>
              <TabsTrigger value="global" className="flex-1 data-[state=active]:bg-primary/20">Global Feed</TabsTrigger>
              <TabsTrigger value="mine" className="flex-1 data-[state=active]:bg-primary/20">My History</TabsTrigger>
            </TabsList>

            {/* LEADERBOARD TAB */}
            <TabsContent value="leaderboard" className="mt-0">
              {leaderboardLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
              ) : leaderboard && leaderboard.length > 0 ? (
                <div className="grid gap-4">
                  {leaderboard.map((entry, index) => (
                    <div key={`${entry.gameType}-${index}`} className="flex items-center justify-between p-5 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0
                          ${index === 0 ? "bg-yellow-500/20 text-yellow-500" :
                            index === 1 ? "bg-gray-400/20 text-gray-400" :
                            "bg-amber-600/20 text-amber-600"}`}>
                          {index + 1}
                        </div>
                        <Avatar className="w-9 h-9 shrink-0">
                          <AvatarImage src={entry.photoURL ?? undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                            {initials(entry.displayName ?? "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-lg">{entry.gameName}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {entry.displayName}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDuration(entry.duration)}</span>
                            <span className="hidden sm:flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {format(new Date(entry.completedAt), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <div className="text-2xl font-black text-primary">{entry.score}</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Points</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card border border-border rounded-2xl">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-bold mb-2">No top scores yet</h3>
                  <p className="text-muted-foreground">Be the first to set a record!</p>
                </div>
              )}
            </TabsContent>

            {/* GLOBAL FEED TAB */}
            <TabsContent value="global" className="mt-0">
              {allScoresLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                </div>
              ) : allScores && allScores.length > 0 ? (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-secondary/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <div className="col-span-4">Player</div>
                    <div className="col-span-3">Game</div>
                    <div className="col-span-2 text-right">Score</div>
                    <div className="col-span-2 text-right">Time</div>
                    <div className="col-span-1 text-right">Date</div>
                  </div>
                  <div className="divide-y divide-border">
                    {allScores.map((score) => (
                      <div key={score.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-secondary/20 transition-colors">
                        <div className="col-span-4 flex items-center gap-2">
                          <Avatar className="w-7 h-7 shrink-0">
                            <AvatarImage src={score.photoURL ?? undefined} />
                            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                              {initials(score.displayName ?? "?")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium truncate">{score.displayName}</span>
                        </div>
                        <div className="col-span-3 text-sm text-muted-foreground truncate">{score.gameName}</div>
                        <div className="col-span-2 text-right font-bold text-primary">{score.score}</div>
                        <div className="col-span-2 text-right text-sm text-muted-foreground">{formatDuration(score.duration)}</div>
                        <div className="col-span-1 text-right text-xs text-muted-foreground">{format(new Date(score.completedAt), "MMM d")}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-card border border-border rounded-2xl">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-bold mb-2">No activity yet</h3>
                  <p className="text-muted-foreground">Play some games to kick things off!</p>
                </div>
              )}
            </TabsContent>

            {/* MY HISTORY TAB */}
            <TabsContent value="mine" className="mt-0">
              {!user ? (
                <div className="text-center py-16 bg-card border border-border rounded-2xl">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-bold mb-2">Sign in to see your history</h3>
                  <p className="text-muted-foreground mb-6">Your personal scores and progress are saved to your account.</p>
                  <Button onClick={() => setAuthOpen(true)} className="gap-2">Sign in</Button>
                </div>
              ) : myScoresLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                </div>
              ) : myScores && myScores.length > 0 ? (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-secondary/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <div className="col-span-5">Game</div>
                    <div className="col-span-3 text-right">Score</div>
                    <div className="col-span-2 text-right">Time</div>
                    <div className="col-span-2 text-right">Date</div>
                  </div>
                  <div className="divide-y divide-border">
                    {myScores.map((score) => (
                      <div key={score.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-secondary/20 transition-colors">
                        <div className="col-span-5 font-medium">{score.gameName}</div>
                        <div className="col-span-3 text-right font-bold text-primary">{score.score}</div>
                        <div className="col-span-2 text-right text-muted-foreground">{formatDuration(score.duration)}</div>
                        <div className="col-span-2 text-right text-sm text-muted-foreground">{format(new Date(score.completedAt), "MMM d")}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-card border border-border rounded-2xl">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-bold mb-2">No games played yet</h3>
                  <p className="text-muted-foreground">Your history will appear here after your first game.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
