import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createRng } from "@/lib/seeded-random";
import { playCorrect, playWrong, playVictory, playTick } from "@/lib/sound";

interface ColorStroopProps {
  onComplete: (score: number, duration: number) => void;
  seed?: number;
}

interface ColorDef {
  name: string;
  hex: string;
  tailwind: string;
}

const COLORS: ColorDef[] = [
  { name: "RED",    hex: "#ef4444", tailwind: "bg-red-500 hover:bg-red-400 border-red-600" },
  { name: "BLUE",   hex: "#3b82f6", tailwind: "bg-blue-500 hover:bg-blue-400 border-blue-600" },
  { name: "GREEN",  hex: "#22c55e", tailwind: "bg-green-500 hover:bg-green-400 border-green-600" },
  { name: "YELLOW", hex: "#eab308", tailwind: "bg-yellow-500 hover:bg-yellow-400 border-yellow-600" },
  { name: "PURPLE", hex: "#a855f7", tailwind: "bg-purple-500 hover:bg-purple-400 border-purple-600" },
  { name: "ORANGE", hex: "#f97316", tailwind: "bg-orange-500 hover:bg-orange-400 border-orange-600" },
];

const TOTAL_ROUNDS = 20;
const TOTAL_TIME = 45;

interface Round {
  wordColor: ColorDef; // the color the word SAYS
  inkColor: ColorDef;  // the color the text is DRAWN in (correct answer)
  options: ColorDef[];
}

function generateRounds(seed?: number): Round[] {
  const rand = seed !== undefined ? createRng(seed) : () => Math.random();
  return Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
    const inkIdx = Math.floor(rand() * COLORS.length);
    let wordIdx: number;
    do { wordIdx = Math.floor(rand() * COLORS.length); } while (wordIdx === inkIdx);

    const inkColor = COLORS[inkIdx];
    const wordColor = COLORS[wordIdx];

    // Pick 3 distractor colors (not the ink color)
    const distractors = COLORS.filter(c => c.name !== inkColor.name)
      .sort(() => rand() - 0.5)
      .slice(0, 3);

    const options = [...distractors, inkColor].sort(() => rand() - 0.5);
    return { wordColor, inkColor, options };
  });
}

export default function ColorStroop({ onComplete, seed }: ColorStroopProps) {
  const [rounds] = useState(() => generateRounds(seed));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [streak, setStreak] = useState(0);
  const startTimeRef = useRef(Date.now());
  const scoreRef = useRef(0);

  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => {
    const iv = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 5 && t > 0) playTick();
        if (t <= 1) {
          clearInterval(iv);
          const dur = Math.floor((Date.now() - startTimeRef.current) / 1000);
          playVictory();
          onComplete(scoreRef.current, dur);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const handleChoice = (color: ColorDef) => {
    if (isLocked) return;
    const correct = rounds[currentIdx].inkColor.name === color.name;
    setIsLocked(true);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const bonus = newStreak >= 3 ? 15 : 0;
      setScore(s => s + 50 + bonus);
      playCorrect();
      setFeedback("correct");
    } else {
      setStreak(0);
      setScore(s => Math.max(0, s - 10));
      playWrong();
      setFeedback("wrong");
    }

    setTimeout(() => {
      setFeedback(null);
      setIsLocked(false);
      if (currentIdx + 1 >= TOTAL_ROUNDS) {
        const timeBonus = timeLeft * 3;
        playVictory();
        const dur = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onComplete(scoreRef.current + timeBonus, dur);
      } else {
        setCurrentIdx(i => i + 1);
      }
    }, 400);
  };

  const round = rounds[currentIdx];
  const timerPct = timeLeft / TOTAL_TIME;

  return (
    <div className="w-full max-w-md mx-auto text-center">
      {/* HUD */}
      <div className="flex justify-between items-center mb-4 font-mono text-sm tracking-widest text-zinc-400">
        <div>SCORE <span className="text-white font-bold">{score}</span></div>
        <div>{currentIdx + 1}/{TOTAL_ROUNDS}</div>
      </div>

      {/* Timer */}
      <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-8 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${timerPct > 0.5 ? "bg-primary" : timerPct > 0.25 ? "bg-yellow-500" : "bg-red-500"}`}
          animate={{ width: `${timerPct * 100}%` }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </div>

      {/* Instruction */}
      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-6">
        Click the <span className="text-white font-bold">ink color</span> — ignore what the word says
      </p>

      {/* The Stroop word */}
      <div className="h-36 flex flex-col items-center justify-center mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <span
              className="text-6xl sm:text-7xl font-black tracking-[0.15em]"
              style={{ color: round.inkColor.hex }}
            >
              {round.wordColor.name}
            </span>
            {feedback && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`absolute -top-4 -right-4 text-2xl`}
              >
                {feedback === "correct" ? "✓" : "✗"}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Color buttons */}
      <div className="grid grid-cols-2 gap-3">
        {round.options.map(color => (
          <motion.button
            key={color.name}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleChoice(color)}
            disabled={isLocked}
            className={`h-14 rounded-2xl font-black text-white text-lg tracking-widest border-2 transition-all shadow-lg disabled:opacity-70 ${color.tailwind}`}
          >
            {color.name}
          </motion.button>
        ))}
      </div>

      {streak >= 3 && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-yellow-400 text-xs font-bold tracking-widest"
        >
          🔥 {streak} STREAK — BONUS ACTIVE
        </motion.p>
      )}
    </div>
  );
}
