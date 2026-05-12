import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useListGames, getListGamesQueryKey } from "@workspace/api-client-react";
import { STATIC_GAMES } from "@/lib/static-games";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trophy, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MemoryMatch from "@/components/games/MemoryMatch";
import NumberSequence from "@/components/games/NumberSequence";
import WordScramble from "@/components/games/WordScramble";
import GameResults from "@/components/games/GameResults";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { submitScore } from "@/lib/firestore";

type GameState = "intro" | "playing" | "results";

const STATS_QUERY_KEY = ["firestore", "stats"];
const SCORES_QUERY_KEY = ["firestore", "scores"];
const LEADERBOARD_QUERY_KEY = ["firestore", "leaderboard"];

export default function GameCanvas() {
  const { type } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const { data: _games, isLoading } = useListGames({ query: { queryKey: getListGamesQueryKey(), retry: false } });
  const games = _games ?? STATIC_GAMES;

  const [gameState, setGameState] = useState<GameState>("intro");
  const [results, setResults] = useState<{ score: number; duration: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const game = games?.find((g) => g.type === type);

  useEffect(() => {
    setGameState("intro");
    setResults(null);
  }, [type]);

  const handleGameComplete = async (score: number, duration: number) => {
    setResults({ score, duration });
    setGameState("results");

    if (!user) return;
    if (!type || !["memory_match", "number_sequence", "word_scramble"].includes(type)) return;

    setSubmitting(true);
    try {
      await submitScore({
        uid: user.uid,
        displayName: user.displayName ?? "Anonymous",
        photoURL: user.photoURL,
        gameType: type,
        score,
        duration,
      });
      queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SCORES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEADERBOARD_QUERY_KEY });
    } catch {
      // score submission failed silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setGameState("intro");
    setResults(null);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black/90 text-white">
        <Skeleton className="w-64 h-64 rounded-full opacity-20" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Game not found</h2>
        <Button onClick={() => setLocation("/")}>Return Home</Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 bg-zinc-950 flex flex-col relative overflow-hidden text-zinc-100">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative flex-shrink-0 px-4 py-3 flex justify-between items-center z-10">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <div className="font-mono text-xs sm:text-sm tracking-widest text-zinc-500 uppercase">{game.name}</div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 z-0 w-full max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {gameState === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center max-w-md w-full bg-zinc-900/50 backdrop-blur-md p-8 sm:p-12 rounded-3xl border border-zinc-800"
              >
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-white">{game.name}</h1>
                <p className="text-zinc-400 text-lg mb-8 leading-relaxed">{game.instructions}</p>

                <div className="flex items-center justify-center gap-4 mb-8 text-sm text-zinc-500 font-medium uppercase tracking-wider">
                  <span className="bg-zinc-800 px-3 py-1 rounded-md">Difficulty: {game.difficulty}</span>
                  {game.bestScore && (
                    <span className="flex items-center gap-1 bg-zinc-800 px-3 py-1 rounded-md text-primary">
                      <Trophy className="w-3.5 h-3.5" /> Best: {game.bestScore}
                    </span>
                  )}
                </div>

                {!user && (
                  <p className="text-zinc-500 text-sm mb-4 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3">
                    <button onClick={() => setAuthOpen(true)} className="text-primary hover:underline font-medium">Sign in</button> to save your scores and appear on the leaderboard.
                  </p>
                )}

                <Button
                  size="lg"
                  className="w-full h-14 text-lg font-bold rounded-xl shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] transition-all hover:scale-105"
                  onClick={() => setGameState("playing")}
                >
                  Start Solo
                </Button>

                <Link href={`/multiplayer/${type}`} className="block mt-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-12 font-semibold rounded-xl border-zinc-700 hover:border-primary hover:text-primary transition-all gap-2"
                  >
                    <Swords className="w-4 h-4" /> Challenge a Friend
                  </Button>
                </Link>
              </motion.div>
            )}

            {gameState === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center"
              >
                {type === "memory_match" && <MemoryMatch onComplete={handleGameComplete} />}
                {type === "number_sequence" && <NumberSequence onComplete={handleGameComplete} />}
                {type === "word_scramble" && <WordScramble onComplete={handleGameComplete} />}
              </motion.div>
            )}

            {gameState === "results" && results && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
              >
                <GameResults
                  gameName={game.name}
                  score={results.score}
                  duration={results.duration}
                  bestScore={game.bestScore}
                  onRestart={handleRestart}
                  submitting={submitting}
                  isGuest={!user}
                  onSignIn={() => setAuthOpen(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
