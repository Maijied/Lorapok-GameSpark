import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { seededShuffle } from "@/lib/seeded-random";
import { playCorrect, playWrong, playVictory, playTick } from "@/lib/sound";

interface PatternIQProps {
  onComplete: (score: number, duration: number) => void;
  seed?: number;
}

interface Question {
  sequence: string[];
  answer: string;
  choices: string[];
  rule: string;
  category: string;
}

const ALL_QUESTIONS: Question[] = [
  { sequence: ["3","6","9","12","?"],    answer: "15",  choices: ["13","15","18","21"],   rule: "+3",           category: "Arithmetic" },
  { sequence: ["2","4","8","16","?"],    answer: "32",  choices: ["28","30","32","36"],   rule: "×2",           category: "Geometric" },
  { sequence: ["1","4","9","16","?"],    answer: "25",  choices: ["20","24","25","30"],   rule: "n²",           category: "Squares" },
  { sequence: ["1","1","2","3","5","?"],  answer: "8",   choices: ["7","8","9","10"],      rule: "Fibonacci",    category: "Fibonacci" },
  { sequence: ["100","90","80","70","?"],answer: "60",  choices: ["55","60","65","70"],   rule: "−10",          category: "Arithmetic" },
  { sequence: ["5","10","20","40","?"],  answer: "80",  choices: ["60","70","80","100"],  rule: "×2",           category: "Geometric" },
  { sequence: ["1","3","7","15","?"],    answer: "31",  choices: ["27","29","31","33"],   rule: "×2+1",         category: "Formula" },
  { sequence: ["7","14","21","28","?"],  answer: "35",  choices: ["33","35","37","42"],   rule: "+7",           category: "Arithmetic" },
  { sequence: ["0","1","4","9","16","?"],answer: "25",  choices: ["20","22","25","30"],   rule: "n²",           category: "Squares" },
  { sequence: ["3","9","27","81","?"],   answer: "243", choices: ["162","200","243","250"],rule: "×3",          category: "Geometric" },
  { sequence: ["1","8","27","64","?"],   answer: "125", choices: ["100","121","125","128"],rule: "n³",          category: "Cubes" },
  { sequence: ["10","8","6","4","?"],    answer: "2",   choices: ["1","2","3","4"],        rule: "−2",          category: "Arithmetic" },
  { sequence: ["1","2","4","7","11","?"],answer: "16",  choices: ["14","15","16","17"],   rule: "+1,+2,+3…",   category: "Increasing diff" },
  { sequence: ["4","9","16","25","36","?"],answer:"49", choices: ["42","44","49","50"],   rule: "n²",          category: "Squares" },
  { sequence: ["2","3","5","7","11","?"],answer: "13",  choices: ["12","13","14","15"],   rule: "Primes",      category: "Primes" },
  { sequence: ["1","3","6","10","15","?"],answer:"21",  choices: ["18","19","21","24"],   rule: "Triangular",  category: "Triangular" },
  { sequence: ["64","32","16","8","?"],  answer: "4",   choices: ["2","4","6","8"],        rule: "÷2",          category: "Geometric" },
  { sequence: ["5","8","13","21","?"],   answer: "34",  choices: ["30","32","34","36"],   rule: "Fibonacci-like",category:"Fibonacci" },
  { sequence: ["2","6","12","20","30","?"],answer:"42", choices: ["36","40","42","44"],   rule: "n(n+1)",      category: "Formula" },
  { sequence: ["1","2","6","24","?"],    answer: "120", choices: ["48","96","120","144"], rule: "n!",          category: "Factorial" },
];

const TIME_PER_Q = 20;
const TOTAL_Q = 10;

export default function PatternIQ({ onComplete, seed }: PatternIQProps) {
  const [questions] = useState<Question[]>(() =>
    seededShuffle([...ALL_QUESTIONS], seed ?? Math.floor(Math.random() * 9999)).slice(0, TOTAL_Q),
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [selected, setSelected] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const startTimeRef = useRef(Date.now());
  const scoreRef = useRef(0);

  useEffect(() => { scoreRef.current = score; }, [score]);

  // Per-question timer
  useEffect(() => {
    setTimeLeft(TIME_PER_Q);
    setSelected(null);
    setIsLocked(false);

    const iv = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 5 && t > 0) playTick();
        if (t <= 1) {
          clearInterval(iv);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [currentIdx]);

  const handleTimeout = () => {
    setIsLocked(true);
    playWrong();
    advance(false, 0);
  };

  const advance = (wasCorrect: boolean, bonus: number) => {
    setTimeout(() => {
      const next = currentIdx + 1;
      if (next >= TOTAL_Q) {
        playVictory();
        const dur = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onComplete(scoreRef.current, dur);
      } else {
        setCurrentIdx(next);
      }
    }, wasCorrect ? 700 : 1000);
  };

  const handleChoice = (choice: string) => {
    if (isLocked) return;
    setIsLocked(true);
    setSelected(choice);
    const correct = choice === questions[currentIdx].answer;

    if (correct) {
      const timeBonus = timeLeft * 5;
      setScore(s => s + 100 + timeBonus);
      playCorrect();
      advance(true, timeBonus);
    } else {
      playWrong();
      advance(false, 0);
    }
  };

  const q = questions[currentIdx];
  const timerPct = timeLeft / TIME_PER_Q;
  const shuffledChoices = q.choices;

  return (
    <div className="w-full max-w-md mx-auto text-center">
      {/* HUD */}
      <div className="flex justify-between items-center mb-4 font-mono text-sm tracking-widest text-zinc-400">
        <div>SCORE <span className="text-white font-bold">{score}</span></div>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
          {q.category}
        </span>
        <div>{currentIdx + 1}/{TOTAL_Q}</div>
      </div>

      {/* Timer */}
      <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-8 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${timerPct > 0.5 ? "bg-primary" : timerPct > 0.25 ? "bg-yellow-500" : "bg-red-500"}`}
          animate={{ width: `${timerPct * 100}%` }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </div>

      {/* Sequence display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-10"
        >
          <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 mb-3">
            {q.sequence.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center justify-center rounded-2xl font-black text-xl sm:text-2xl
                  ${item === "?" ? "w-14 h-14 sm:w-16 sm:h-16 bg-primary/20 border-2 border-primary text-primary animate-pulse" : "w-12 h-12 sm:w-14 sm:h-14 bg-zinc-800 border border-zinc-700 text-white"}`}
              >
                {item}
              </motion.div>
            ))}
          </div>
          <p className="text-zinc-600 text-xs uppercase tracking-widest">Find the missing number</p>
        </motion.div>
      </AnimatePresence>

      {/* Choices */}
      <div className="grid grid-cols-2 gap-3">
        {shuffledChoices.map(choice => {
          const isSelected = selected === choice;
          const isCorrect = choice === q.answer;
          let style = "bg-zinc-800/80 border-zinc-700 hover:border-primary/50 hover:bg-zinc-700/80 text-white";
          if (isSelected && isCorrect) style = "bg-emerald-900/40 border-emerald-500 text-emerald-300";
          if (isSelected && !isCorrect) style = "bg-red-900/40 border-red-500 text-red-300";
          if (isLocked && !isSelected && isCorrect) style = "bg-emerald-900/20 border-emerald-600/50 text-emerald-400";

          return (
            <motion.button
              key={choice}
              whileHover={!isLocked ? { scale: 1.03 } : {}}
              whileTap={!isLocked ? { scale: 0.97 } : {}}
              onClick={() => handleChoice(choice)}
              disabled={isLocked}
              className={`h-14 rounded-2xl font-black text-2xl border-2 transition-all ${style}`}
            >
              {choice}
            </motion.button>
          );
        })}
      </div>

      {isLocked && selected && (
        <p className={`mt-4 text-sm font-semibold ${selected === q.answer ? "text-emerald-400" : "text-zinc-500"}`}>
          {selected === q.answer ? `✓ Correct! Rule: ${q.rule}` : `Answer: ${q.answer} — Rule: ${q.rule}`}
        </p>
      )}
    </div>
  );
}
