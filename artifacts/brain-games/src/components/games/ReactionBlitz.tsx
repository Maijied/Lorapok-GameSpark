import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createRng } from "@/lib/seeded-random";
import { playCorrect, playWrong, playVictory, playTick } from "@/lib/sound";

interface ReactionBlitzProps {
  onComplete: (score: number, duration: number) => void;
  seed?: number;
}

type Phase = "waiting" | "ready" | "go" | "result" | "false-start";

const TOTAL_ROUNDS = 10;
const MIN_DELAY = 1200;
const MAX_DELAY = 4000;

function getRandDelays(seed?: number): number[] {
  const rand = seed !== undefined ? createRng(seed) : () => Math.random();
  return Array.from({ length: TOTAL_ROUNDS }, () =>
    MIN_DELAY + rand() * (MAX_DELAY - MIN_DELAY),
  );
}

export default function ReactionBlitz({ onComplete, seed }: ReactionBlitzProps) {
  const [delays] = useState(() => getRandDelays(seed));
  const [phase, setPhase] = useState<Phase>("waiting");
  const [round, setRound] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const [falseStarts, setFalseStarts] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalStartRef = useRef(Date.now());

  const startRound = (r: number) => {
    setPhase("waiting");
    timeoutRef.current = setTimeout(() => {
      setPhase("go");
      startTimeRef.current = Date.now();
      playTick();
    }, delays[r]);
  };

  useEffect(() => {
    setPhase("ready");
  }, []);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const handleClick = () => {
    if (phase === "ready") {
      startRound(round);
      return;
    }

    if (phase === "waiting") {
      // False start
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setFalseStarts(f => f + 1);
      playWrong();
      setPhase("false-start");
      setTimeout(() => startRound(round), 1500);
      return;
    }

    if (phase === "go") {
      const ms = Date.now() - (startTimeRef.current ?? Date.now());
      setLastMs(ms);
      const newTimes = [...reactionTimes, ms];
      setReactionTimes(newTimes);
      playCorrect();
      setPhase("result");

      const nextRound = round + 1;
      if (nextRound >= TOTAL_ROUNDS) {
        // All done
        setTimeout(() => {
          const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
          const score = Math.max(0, Math.round(5000 - avg)) - falseStarts * 100;
          const dur = Math.floor((Date.now() - totalStartRef.current) / 1000);
          playVictory();
          onComplete(Math.max(0, score), dur);
        }, 1200);
      } else {
        setRound(nextRound);
        setTimeout(() => startRound(nextRound), 1200);
      }
    }
  };

  const avg = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : null;

  const getRating = (ms: number) => {
    if (ms < 200) return { label: "GODLIKE", color: "text-yellow-300" };
    if (ms < 250) return { label: "LIGHTNING", color: "text-emerald-400" };
    if (ms < 300) return { label: "FAST", color: "text-primary" };
    if (ms < 400) return { label: "AVERAGE", color: "text-zinc-300" };
    return { label: "SLOW", color: "text-zinc-500" };
  };

  return (
    <div className="w-full max-w-md mx-auto text-center select-none">
      {/* HUD */}
      <div className="flex justify-between items-center mb-6 font-mono text-sm tracking-widest text-zinc-400">
        <div>ROUND <span className="text-white font-bold">{Math.min(round + 1, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}</span></div>
        {avg !== null && <div>AVG <span className="text-primary font-bold">{avg}ms</span></div>}
        {falseStarts > 0 && <div className="text-red-400">⚠ {falseStarts} FALSE</div>}
      </div>

      {/* Reaction times bar chart */}
      {reactionTimes.length > 0 && (
        <div className="flex items-end justify-center gap-1 h-12 mb-6">
          {reactionTimes.map((t, i) => {
            const maxT = 600;
            const pct = Math.min(1, t / maxT);
            const color = t < 250 ? "bg-emerald-500" : t < 350 ? "bg-yellow-500" : "bg-red-500";
            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${pct * 100}%` }}
                className={`w-5 rounded-t ${color} opacity-80`}
                title={`${t}ms`}
              />
            );
          })}
          {Array.from({ length: TOTAL_ROUNDS - reactionTimes.length }).map((_, i) => (
            <div key={`empty-${i}`} className="w-5 h-1 rounded bg-zinc-800" />
          ))}
        </div>
      )}

      {/* Main interaction area */}
      <motion.button
        onClick={handleClick}
        className={`w-full h-56 rounded-3xl border-2 flex flex-col items-center justify-center transition-all select-none focus:outline-none
          ${phase === "go"
            ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_60px_-10px_rgba(34,197,94,0.5)]"
            : phase === "false-start"
            ? "bg-red-500/10 border-red-500/50"
            : phase === "waiting"
            ? "bg-yellow-500/5 border-yellow-600/30 cursor-wait"
            : "bg-primary/10 border-primary/30 hover:bg-primary/20"
          }`}
        whileTap={phase === "go" ? { scale: 0.97 } : {}}
      >
        <AnimatePresence mode="wait">
          {phase === "ready" && (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-5xl mb-3">⚡</div>
              <p className="text-white font-bold text-xl">Tap to Begin</p>
              <p className="text-zinc-500 text-sm mt-2">React when the circle turns GREEN</p>
            </motion.div>
          )}
          {phase === "waiting" && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div
                className="w-20 h-20 rounded-full bg-yellow-500/20 border-2 border-yellow-600/50 mx-auto mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <p className="text-yellow-400 font-bold text-lg">Wait…</p>
              <p className="text-zinc-600 text-sm mt-1">Don't click yet!</p>
            </motion.div>
          )}
          {phase === "go" && (
            <motion.div
              key="go"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.1 }}
            >
              <motion.div
                className="w-24 h-24 rounded-full bg-emerald-500/30 border-4 border-emerald-400 mx-auto mb-4 flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.4, repeat: Infinity }}
              >
                <span className="text-4xl">👆</span>
              </motion.div>
              <p className="text-emerald-400 font-black text-2xl tracking-widest">CLICK!</p>
            </motion.div>
          )}
          {phase === "result" && lastMs !== null && (
            <motion.div key="result" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <p className="text-5xl font-black text-white mb-2">{lastMs}<span className="text-2xl text-zinc-400">ms</span></p>
              <p className={`font-bold text-lg ${getRating(lastMs).color}`}>{getRating(lastMs).label}</p>
            </motion.div>
          )}
          {phase === "false-start" && (
            <motion.div
              key="false"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400"
            >
              <div className="text-4xl mb-2">⛔</div>
              <p className="font-bold text-lg">Too Early!</p>
              <p className="text-sm text-zinc-500">−100 pts penalty</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <p className="mt-4 text-zinc-600 text-xs">
        Best human avg reaction: ~250ms · World record: ~100ms
      </p>
    </div>
  );
}
