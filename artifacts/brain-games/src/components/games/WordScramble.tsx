import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, Timer } from "lucide-react";
import { Input } from "@/components/ui/input";

interface WordScrambleProps {
  onComplete: (score: number, duration: number) => void;
}

const WORDS = [
  "PUZZLE", "MEMORY", "FOCUS", "BRAIN", "LOGIC", 
  "SMART", "THINK", "GENIUS", "NEURON", "SOLVE",
  "MENTAL", "WONDER", "BRIGHT", "CLEVER", "SYNAPSE",
  "RECALL", "WISDOM", "REASON", "ATTENT", "ACUMEN"
];

export default function WordScramble({ onComplete }: WordScrambleProps) {
  const [wordList] = useState(() => [...WORDS].sort(() => Math.random() - 0.5).slice(0, 10));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [seconds, setSeconds] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const currentWord = wordList[currentIndex] || "";

  useEffect(() => {
    // Timer
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentWord) {
      // Scramble word, ensuring it's actually different
      let scrambledWord = currentWord;
      while (scrambledWord === currentWord && currentWord.length > 1) {
        scrambledWord = currentWord.split('').sort(() => Math.random() - 0.5).join('');
      }
      setScrambled(scrambledWord);
      setUserInput("");
      inputRef.current?.focus();
    } else if (wordList.length > 0 && currentIndex >= wordList.length) {
      // Game finished successfully
      finishGame();
    }
  }, [currentIndex, currentWord, wordList.length]);

  const finishGame = () => {
    const timePenalty = seconds;
    const finalScore = Math.max(0, score + (lives * 50) - timePenalty);
    onComplete(finalScore, seconds);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput) return;

    if (userInput.toUpperCase() === currentWord) {
      // Correct
      setScore(s => s + 100);
      setCurrentIndex(i => i + 1);
    } else {
      // Wrong
      setLives(l => l - 1);
      setUserInput("");
      if (lives <= 1) {
        finishGame();
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
            <Heart key={i} className={`w-5 h-5 ${i <= lives ? 'fill-red-500 text-red-500' : 'text-zinc-700'}`} />
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
