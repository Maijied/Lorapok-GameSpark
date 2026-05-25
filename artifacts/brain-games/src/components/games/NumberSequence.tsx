import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { seededSequence } from "@/lib/seeded-random";
import { playCorrect, playWrong, playVictory, playTick } from "@/lib/sound";

interface NumberSequenceProps {
  onComplete: (score: number, duration: number) => void;
  seed?: number;
}

type Phase = "memorize" | "recall" | "feedback";

interface ScorePop { id: number; value: number; }

const MEMORIZE_BASE_MS = 2200;
const MEMORIZE_PER_DIGIT_MS = 600;

export default function NumberSequence({ onComplete, seed }: NumberSequenceProps) {
  const [sequence, setSequence] = useState("");
  const [userInput, setUserInput] = useState("");
  const [phase, setPhase] = useState<Phase>("memorize");
  const [round, setRound] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now);
  const [timerPct, setTimerPct] = useState(1);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [wrongReveal, setWrongReveal] = useState("");
  const [scorePops, setScorePops] = useState<ScorePop[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const popIdRef = useRef(0);

  const scoreRef = useRef(score);
  const livesRef = useRef(lives);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { livesRef.current = lives; }, [lives]);

  const generateSeq = (length: number, roundNum: number): string => {
    if (seed !== undefined) {
      return seededSequence(length, seed + roundNum * 9973);
    }
    return Array.from({ length }, () => Math.floor(Math.random() * 10).toString()).join("");
  };

  const startRound = useCallback((r: number) => {
    const seqLen = 2 + r;
    const newSeq = generateSeq(seqLen, r);
    setSequence(newSeq);
    setUserInput("");
    setFeedback(null);
    setWrongReveal("");
    setPhase("memorize");
    setTimerPct(1);

    const totalMs = MEMORIZE_BASE_MS + seqLen * MEMORIZE_PER_DIGIT_MS;
    const start = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 1 - elapsed / totalMs);
      setTimerPct(pct);
      if (pct <= 0.1) playTick();
      if (elapsed >= totalMs) {
        clearInterval(timerRef.current!);
        setPhase("recall");
      }
    }, 80);
  }, [seed]);

  useEffect(() => {
    startRound(1);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (phase === "recall" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  const addScorePop = (value: number) => {
    const id = ++popIdRef.current;
    setScorePops(p => [...p, { id, value }]);
    setTimeout(() => setScorePops(p => p.filter(x => x.id !== id)), 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== "recall" || !userInput) return;

    if (userInput === sequence) {
      const earned = round * 100;
      setScore(s => s + earned);
      addScorePop(earned);
      playCorrect();
      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        setRound(r => {
          const next = r + 1;
          startRound(next);
          return next;
        });
      }, 600);
    } else {
      playWrong();
      setFeedback("wrong");
      setWrongReveal(sequence);
      const newLives = livesRef.current - 1;
      setLives(newLives);
      if (newLives <= 0) {
        playVictory();
        setTimeout(() => {
          const duration = Math.floor((Date.now() - startTime) / 1000);
          onComplete(scoreRef.current, duration);
        }, 1000);
      } else {
        setTimeout(() => {
          setFeedback(null);
          setWrongReveal("");
          startRound(round);
        }, 1400);
      }
    }
  };

  const digits = sequence.split("");

  return (
    <div className="w-full max-w-md mx-auto text-center relative">
      {/* Score pops */}
      <AnimatePresence>
        {scorePops.map(pop => (
          <motion.div
            key={pop.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -60, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 text-emerald-400 font-black text-2xl pointer-events-none z-20"
          >
            +{pop.value}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* HUD */}
      <div className="flex justify-between items-center w-full mb-6 font-mono text-sm tracking-widest text-zinc-400">
        <div>SCORE <span className="text-white font-bold">{score}</span></div>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              animate={i === lives + 1 ? { scale: [1, 1.4, 0.8, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              <Heart className={`w-5 h-5 transition-all ${i <= lives ? "fill-red-500 text-red-500" : "text-zinc-700"}`} />
            </motion.div>
          ))}
        </div>
        <div>ROUND <span className="text-white font-bold">{round}</span></div>
      </div>

      {/* Timer bar */}
      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-8">
        <motion.div
          className={`h-full rounded-full transition-colors ${timerPct > 0.5 ? "bg-primary" : timerPct > 0.25 ? "bg-yellow-500" : "bg-red-500"}`}
          animate={{ width: phase === "memorize" ? `${timerPct * 100}%` : "0%" }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Main display */}
      <div className="h-44 flex flex-col items-center justify-center mb-8 relative">
        <AnimatePresence mode="wait">
          {phase === "memorize" && (
            <motion.div
              key="memorize"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, filter: "blur(12px)", scale: 1.1 }}
              className="flex items-center gap-2 sm:gap-3"
            >
              {digits.map((d, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="text-5xl sm:text-7xl font-black font-mono text-white"
                >
                  {d}
                </motion.span>
              ))}
            </motion.div>
          )}

          {phase === "recall" && !feedback && (
            <motion.div
              key="recall"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <p className="text-zinc-500 text-sm mb-4 uppercase tracking-widest">Type the sequence</p>
              <form onSubmit={handleSubmit}>
                <Input
                  ref={inputRef}
                  type="tel"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value.replace(/[^0-9]/g, ""))}
                  className="h-20 text-center text-4xl sm:text-5xl font-mono tracking-[0.3em] bg-zinc-900/50 border-zinc-700 focus-visible:ring-primary text-white"
                  placeholder="···"
                  autoComplete="off"
                  maxLength={sequence.length}
                />
                <button type="submit" className="sr-only">Submit</button>
              </form>
            </motion.div>
          )}

          {phase === "feedback" || feedback ? (
            <motion.div
              key="feedback"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              {feedback === "correct" ? (
                <div className="text-5xl sm:text-7xl font-black text-emerald-400">✓</div>
              ) : (
                <>
                  <div className="text-5xl sm:text-6xl font-black text-red-400">✗</div>
                  {wrongReveal && (
                    <div className="text-sm text-zinc-400">
                      Answer: <span className="text-white font-mono font-bold tracking-widest">{wrongReveal}</span>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="text-zinc-600 text-xs uppercase tracking-widest h-5">
        {phase === "memorize" ? "Memorize the sequence…" : phase === "recall" ? "Press Enter to submit" : ""}
      </div>
    </div>
  );
}
