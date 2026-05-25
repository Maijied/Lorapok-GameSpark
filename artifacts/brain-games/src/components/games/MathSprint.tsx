import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { createRng } from "@/lib/seeded-random";
import { playCorrect, playWrong, playVictory, playTick } from "@/lib/sound";

interface MathSprintProps {
  onComplete: (score: number, duration: number) => void;
  seed?: number;
}

type Op = "+" | "−" | "×" | "÷";

interface Problem {
  a: number;
  b: number;
  op: Op;
  answer: number;
  display: string;
}

const TOTAL_TIME = 60;
const TOTAL_PROBLEMS = 20;

function generateProblems(seed?: number): Problem[] {
  const rand = seed !== undefined ? createRng(seed) : () => Math.random();
  const problems: Problem[] = [];

  for (let i = 0; i < TOTAL_PROBLEMS; i++) {
    const wave = Math.floor(i / 5); // 0=easy, 1=medium, 2=hard, 3=expert
    let a: number, b: number, op: Op, answer: number;

    if (wave === 0) {
      a = Math.floor(rand() * 9) + 1;
      b = Math.floor(rand() * 9) + 1;
      op = rand() < 0.5 ? "+" : "−";
      if (op === "−" && b > a) [a, b] = [b, a];
      answer = op === "+" ? a + b : a - b;
    } else if (wave === 1) {
      a = Math.floor(rand() * 49) + 11;
      b = Math.floor(rand() * 19) + 2;
      op = rand() < 0.5 ? "+" : "−";
      if (op === "−" && b > a) [a, b] = [b, a];
      answer = op === "+" ? a + b : a - b;
    } else if (wave === 2) {
      a = Math.floor(rand() * 9) + 2;
      b = Math.floor(rand() * 9) + 2;
      op = "×";
      answer = a * b;
    } else {
      b = Math.floor(rand() * 8) + 2;
      answer = Math.floor(rand() * 10) + 1;
      a = b * answer;
      op = "÷";
    }

    problems.push({ a, b, op, answer, display: `${a} ${op} ${b} = ?` });
  }
  return problems;
}

const WAVE_LABELS = ["Easy", "Medium", "Hard", "Expert"];
const WAVE_COLORS = ["text-emerald-400", "text-yellow-400", "text-orange-400", "text-red-400"];

export default function MathSprint({ onComplete, seed }: MathSprintProps) {
  const [problems] = useState(() => generateProblems(seed));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [streak, setStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef(Date.now());
  const scoreRef = useRef(0);

  useEffect(() => { scoreRef.current = score; }, [score]);

  // Countdown
  useEffect(() => {
    const iv = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 5 && t > 0) playTick();
        if (t <= 1) {
          clearInterval(iv);
          const dur = Math.floor((Date.now() - startTimeRef.current) / 1000);
          onComplete(scoreRef.current, dur);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => { inputRef.current?.focus(); }, [currentIdx, feedback]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || !userInput.trim()) return;
    const guess = parseInt(userInput.trim(), 10);
    const correct = problems[currentIdx].answer;

    if (guess === correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const bonus = newStreak >= 3 ? 25 : 0;
      setScore(s => s + 50 + bonus);
      playCorrect();
      setFeedback("correct");
      setIsLocked(true);
      setTimeout(() => {
        setFeedback(null);
        setIsLocked(false);
        setUserInput("");
        if (currentIdx + 1 >= TOTAL_PROBLEMS) {
          const timeBonus = timeLeft * 5;
          playVictory();
          const dur = Math.floor((Date.now() - startTimeRef.current) / 1000);
          onComplete(scoreRef.current + timeBonus, dur);
        } else {
          setCurrentIdx(i => i + 1);
        }
      }, 350);
    } else {
      setStreak(0);
      playWrong();
      setFeedback("wrong");
      setIsLocked(true);
      setTimeout(() => {
        setFeedback(null);
        setIsLocked(false);
        setUserInput("");
        inputRef.current?.focus();
      }, 600);
    }
  };

  const problem = problems[currentIdx];
  const wave = Math.floor(currentIdx / 5);
  const timerPct = timeLeft / TOTAL_TIME;

  return (
    <div className="w-full max-w-md mx-auto text-center">
      {/* HUD */}
      <div className="flex justify-between items-center mb-4 font-mono text-sm tracking-widest text-zinc-400">
        <div>SCORE <span className="text-white font-bold">{score}</span></div>
        <AnimatePresence>
          {streak >= 3 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-yellow-400 font-black text-xs tracking-widest"
            >
              🔥 STREAK ×{streak}
            </motion.div>
          )}
        </AnimatePresence>
        <div>{currentIdx + 1}/{TOTAL_PROBLEMS}</div>
      </div>

      {/* Timer */}
      <div className="w-full h-2 bg-zinc-800 rounded-full mb-2 overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors ${timerPct > 0.5 ? "bg-primary" : timerPct > 0.25 ? "bg-yellow-500" : "bg-red-500"}`}
          animate={{ width: `${timerPct * 100}%` }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </div>
      <div className="flex justify-between text-xs text-zinc-600 mb-8">
        <span className={`font-bold ${WAVE_COLORS[wave]}`}>{WAVE_LABELS[wave]}</span>
        <span>{timeLeft}s</span>
      </div>

      {/* Problem */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.2 }}
          className={`text-5xl sm:text-6xl font-black font-mono mb-8 tracking-wide transition-colors ${
            feedback === "correct" ? "text-emerald-400" : feedback === "wrong" ? "text-red-400" : "text-white"
          }`}
        >
          {problem.a} {problem.op} {problem.b} <span className="text-zinc-600">=</span> ?
        </motion.div>
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={handleSubmit}>
        <motion.div
          animate={feedback === "wrong" ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.35 }}
        >
          <Input
            ref={inputRef}
            type="tel"
            value={userInput}
            onChange={e => setUserInput(e.target.value.replace(/[^0-9-]/g, ""))}
            disabled={isLocked}
            className="h-16 text-center text-3xl font-bold font-mono bg-zinc-900/60 border-zinc-700 focus-visible:ring-primary text-white"
            placeholder="?"
            autoComplete="off"
          />
        </motion.div>
        <p className="text-zinc-600 text-xs mt-3 uppercase tracking-widest">Press Enter to submit</p>
      </form>
    </div>
  );
}
