import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { seededSequence } from "@/lib/seeded-random";

interface NumberSequenceProps {
  onComplete: (score: number, duration: number) => void;
  seed?: number;
}

type Phase = "memorize" | "recall";

export default function NumberSequence({ onComplete, seed }: NumberSequenceProps) {
  const [sequence, setSequence] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [phase, setPhase] = useState<Phase>("memorize");
  const [round, setRound] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const generateSeq = (length: number, roundNum: number): string => {
    if (seed !== undefined) {
      // deterministic: combine base seed with round number
      return seededSequence(length, seed + roundNum * 9973);
    }
    return Array.from({ length }, () => Math.floor(Math.random() * 10).toString()).join("");
  };

  const startRound = (r: number) => {
    const newSeq = generateSeq(2 + r, r);
    setSequence(newSeq);
    setUserInput("");
    setPhase("memorize");
    const displayTime = 2000 + r * 500;
    setTimeout(() => setPhase("recall"), displayTime);
  };

  useEffect(() => {
    startRound(round);
  }, [round]);

  useEffect(() => {
    if (phase === "recall" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== "recall" || !userInput) return;

    if (userInput === sequence) {
      setScore(s => s + round * 100);
      setRound(r => r + 1);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        onComplete(score, duration);
      } else {
        startRound(round);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="flex justify-between items-center w-full mb-12 font-mono text-sm tracking-widest text-zinc-400">
        <div>SCORE: <span className="text-white font-bold">{score}</span></div>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map(i => (
            <Heart key={i} className={`w-5 h-5 ${i <= lives ? "fill-red-500 text-red-500" : "text-zinc-700"}`} />
          ))}
        </div>
        <div>ROUND: <span className="text-white font-bold">{round}</span></div>
      </div>

      <div className="h-48 flex items-center justify-center mb-8">
        <AnimatePresence mode="wait">
          {phase === "memorize" ? (
            <motion.div
              key="memorize"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              className="text-5xl sm:text-7xl font-bold tracking-[0.5em] font-mono text-white text-center ml-[0.25em]"
            >
              {sequence}
            </motion.div>
          ) : (
            <motion.div
              key="recall"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <form onSubmit={handleSubmit}>
                <Input
                  ref={inputRef}
                  type="tel"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ""))}
                  className="h-20 text-center text-4xl sm:text-5xl font-mono tracking-[0.2em] bg-zinc-900/50 border-zinc-700 focus-visible:ring-primary text-white"
                  placeholder="Type sequence..."
                  autoComplete="off"
                  maxLength={sequence.length}
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-zinc-500 text-sm h-6">
        {phase === "memorize" ? "Memorize the sequence..." : "Press Enter to submit"}
      </div>
    </div>
  );
}
