import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Trophy, Clock, RotateCcw, Home, Loader2, LogIn } from "lucide-react";

interface GameResultsProps {
  gameName: string;
  score: number;
  duration: number;
  bestScore?: number | null;
  onRestart: () => void;
  submitting?: boolean;
  isGuest?: boolean;
  onSignIn?: () => void;
}

export default function GameResults({ gameName, score, duration, bestScore, onRestart, submitting, isGuest, onSignIn }: GameResultsProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isNewBest = bestScore ? score > bestScore : true;

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-zinc-800 text-center relative overflow-hidden">
      {isNewBest && (
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none" />
      )}

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
        className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6 relative"
      >
        <Trophy className={`w-10 h-10 ${isNewBest ? "text-yellow-400" : "text-primary"}`} />
        {isNewBest && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-3 bg-yellow-500 text-black text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
          >
            New Best
          </motion.div>
        )}
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-2">Challenge Complete!</h2>
      <p className="text-zinc-400 mb-8">{gameName}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-800/50 rounded-2xl p-4 border border-zinc-700/50">
          <div className="text-sm font-medium text-zinc-400 mb-1 uppercase tracking-widest">Score</div>
          <div className="text-4xl font-black text-white">{score}</div>
        </div>
        <div className="bg-zinc-800/50 rounded-2xl p-4 border border-zinc-700/50">
          <div className="text-sm font-medium text-zinc-400 mb-1 flex items-center justify-center gap-1 uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5" /> Time
          </div>
          <div className="text-4xl font-black text-white">{formatDuration(duration)}</div>
        </div>
      </div>

      {submitting && (
        <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm mb-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Saving score...
        </div>
      )}

      {isGuest && !submitting && (
        <div className="mb-4 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-400">
          Score not saved.{" "}
          <button onClick={onSignIn} className="text-primary hover:underline font-medium inline-flex items-center gap-1">
            <LogIn className="w-3.5 h-3.5" /> Sign in
          </button>{" "}
          to appear on the leaderboard.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onRestart} className="flex-1 h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white rounded-xl">
          <RotateCcw className="w-4 h-4 mr-2" /> Play Again
        </Button>
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full h-12 text-base font-bold border-zinc-700 hover:bg-zinc-800 text-white rounded-xl">
            <Home className="w-4 h-4 mr-2" /> Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
