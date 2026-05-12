import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, Timer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { seededShuffle } from "@/lib/seeded-random";

interface WordScrambleProps {
  onComplete: (score: number, duration: number) => void;
  seed?: number;
}

const WORDS = [
  "PUZZLE", "MEMORY", "FOCUS", "BRAIN", "LOGIC",
  "SMART", "THINK", "GENIUS", "NEURON", "SOLVE",
  "MENTAL", "WONDER", "BRIGHT", "CLEVER", "SYNAPSE",
  "RECALL", "WISDOM", "REASON", "ATTENT", "ACUMEN",
];

function scrambleWord(word: string, wordSeed?: number): string {
  const letters = word.split("");
  let result: string;
  if (wordSeed !== undefined) {
    result = seededShuffle(letters, wordSeed).join("");
    if (result === word && word.length > 1) {
      result = seededShuffle(letters, wordSeed + 1).join("");
    }
  } else {
    result = word;
    let attempts = 0;
    while (result === word && word.length > 1 && attempts < 10) {
      result = [...letters].sort(() => Math.random() - 0.5).join("");
      attempts++;
    }
  }
  return result;
}

export default function WordScramble({ onComplete, seed }: WordScrambleProps) {
  const [wordList] = useState(() =>
    seed !== undefined
      ? seededShuffle([...WORDS], seed).slice(0, 10)
      : [...WORDS].sort(() => Math.random() - 0.5).slice(0, 10)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [seconds, setSeconds] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWord = wordList[currentIndex] ?? "";

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentWord) {
      const wordSeed = seed !== undefined ? seed + currentIndex * 7919 : undefined;
      setScrambled(scrambleWord(currentWord, wordSeed));
      setUserInput("");
      inputRef.current?.focus();
    } else if (wordList.length > 0 && currentIndex >= wordList.length) {
      const finalScore = Math.max(0, score + lives * 50 - seconds);
      onComplete(finalScore, seconds);
    }
  }, [currentIndex, currentWord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput) return;

    if (userInput.toUpperCase() === currentWord) {
      setScore(s => s + 100);
      setCurrentIndex(i => i + 1);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setUserInput("");
      if (newLives <= 0) {
        const finalScore = Math.max(0, score + newLives * 50 - seconds);
        onComplete(finalScore, seconds);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="flex justify-between items-center w-full mb-12 font-mono text-sm tracking-widest text-zinc-400">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4" /> {seconds}s
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map(i => (
            <Heart key={i} className={`w-5 h-5 ${i <= lives ? "fill-red-500 text-red-500" : "text-zinc-700"}`} />
          ))}
        </div>
        <div>WORDS: <span className="text-white font-bold">{currentIndex}/{wordList.length}</span></div>
      </div>

      <div className="h-48 flex flex-col items-center justify-center mb-8">
        <motion.div
          key={scrambled}
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          className="text-4xl sm:text-6xl font-black tracking-widest text-white mb-8 uppercase"
        >
          {scrambled}
        </motion.div>

        <form onSubmit={handleSubmit} className="w-full">
          <Input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value.toUpperCase())}
            className="h-16 text-center text-2xl sm:text-3xl font-bold uppercase tracking-widest bg-zinc-900/50 border-zinc-700 focus-visible:ring-primary text-primary-foreground"
            placeholder="UNSCRAMBLE..."
            autoComplete="off"
            spellCheck="false"
          />
        </form>
      </div>

      <div className="text-zinc-500 text-sm">
        Score: <span className="text-white font-bold">{score}</span>
      </div>
    </div>
  );
}
