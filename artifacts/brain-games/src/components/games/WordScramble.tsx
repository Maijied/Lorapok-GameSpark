import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Shuffle, Lightbulb } from "lucide-react";
import { seededShuffle } from "@/lib/seeded-random";
import { playCorrect, playWrong, playVictory, playTileClick, playHint } from "@/lib/sound";

interface WordScrambleProps {
  onComplete: (score: number, duration: number) => void;
  seed?: number;
}

interface Tile {
  id: number;
  letter: string;
}

const WORDS = [
  "PUZZLE", "MEMORY", "FOCUS", "BRAIN", "LOGIC",
  "SMART", "THINK", "GENIUS", "NEURON", "SOLVE",
  "MENTAL", "WONDER", "BRIGHT", "CLEVER", "SYNAPSE",
  "RECALL", "WISDOM", "REASON", "ATTENT", "ACUMEN",
  "NEURAL", "CORTEX", "REFLEX", "SIGNAL", "MASTER",
];

const HINT_COST = 30;

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
    while (result === word && word.length > 1 && attempts < 15) {
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
      : [...WORDS].sort(() => Math.random() - 0.5).slice(0, 10),
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [pool, setPool] = useState<Tile[]>([]);
  const [placed, setPlaced] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [seconds, setSeconds] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const scoreRef = useRef(score);
  const livesRef = useRef(lives);
  const secondsRef = useRef(seconds);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { secondsRef.current = seconds; }, [seconds]);

  const currentWord = wordList[currentIndex] ?? "";

  // Global timer
  useEffect(() => {
    const iv = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  // Reset tiles on word change
  useEffect(() => {
    if (!currentWord) return;
    const wordSeed = seed !== undefined ? seed + currentIndex * 7919 : undefined;
    const sc = scrambleWord(currentWord, wordSeed);
    setPool(sc.split("").map((letter, i) => ({ id: currentIndex * 100 + i, letter })));
    setPlaced([]);
    setFeedback(null);
    setIsChecking(false);
    setHintsUsed(0);
  }, [currentIndex, currentWord]);

  // Game end when past last word
  useEffect(() => {
    if (wordList.length > 0 && currentIndex >= wordList.length) {
      playVictory();
      const finalScore = Math.max(0, scoreRef.current + livesRef.current * 50 - Math.floor(secondsRef.current / 2));
      onComplete(finalScore, secondsRef.current);
    }
  }, [currentIndex]);

  const doCheck = (newPlaced: Tile[], currentScore: number, currentLives: number) => {
    setIsChecking(true);
    const answer = newPlaced.map(t => t.letter).join("");

    if (answer === currentWord) {
      playCorrect();
      setFeedback("correct");
      setScore(currentScore + 100);
      setTimeout(() => {
        setFeedback(null);
        setIsChecking(false);
        setCurrentIndex(i => i + 1);
      }, 500);
    } else {
      playWrong();
      setFeedback("wrong");
      const newLives = currentLives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimeout(() => {
          const finalScore = Math.max(0, currentScore + 0 - Math.floor(secondsRef.current / 2));
          onComplete(finalScore, secondsRef.current);
        }, 700);
      } else {
        setTimeout(() => {
          setFeedback(null);
          setIsChecking(false);
          const wordSeed = seed !== undefined ? seed + currentIndex * 7919 : undefined;
          const sc = scrambleWord(currentWord, wordSeed);
          setPool(sc.split("").map((letter, i) => ({ id: currentIndex * 100 + i + 50, letter })));
          setPlaced([]);
          setHintsUsed(0);
        }, 900);
      }
    }
  };

  const handlePoolClick = (tile: Tile) => {
    if (isChecking) return;
    playTileClick();
    const newPlaced = [...placed, tile];
    const newPool = pool.filter(t => t.id !== tile.id);
    setPool(newPool);
    setPlaced(newPlaced);
    if (newPlaced.length === currentWord.length) {
      doCheck(newPlaced, scoreRef.current, livesRef.current);
    }
  };

  const handlePlacedClick = (tile: Tile, index: number) => {
    if (isChecking) return;
    playTileClick();
    setPlaced(p => p.filter((_, i) => i !== index));
    setPool(p => [...p, tile]);
  };

  const handleShuffle = () => {
    if (isChecking) return;
    playTileClick();
    setPool(p => [...p].sort(() => Math.random() - 0.5));
  };

  const handleHint = () => {
    if (isChecking || pool.length === 0) return;
    // Next letter needed is at index placed.length
    const nextPos = placed.length;
    if (nextPos >= currentWord.length) return;
    const needed = currentWord[nextPos];
    const tileIdx = pool.findIndex(t => t.letter === needed);
    if (tileIdx === -1) return;
    playHint();
    setScore(s => Math.max(0, s - HINT_COST));
    setHintsUsed(h => h + 1);
    const tile = pool[tileIdx];
    const newPlaced = [...placed, tile];
    const newPool = pool.filter((_, i) => i !== tileIdx);
    setPool(newPool);
    setPlaced(newPlaced);
    if (newPlaced.length === currentWord.length) {
      doCheck(newPlaced, Math.max(0, scoreRef.current - HINT_COST), livesRef.current);
    }
  };

  const feedbackBg =
    feedback === "correct" ? "border-emerald-500/60 shadow-emerald-500/20" :
    feedback === "wrong"   ? "border-red-500/60 shadow-red-500/20" :
    "border-zinc-700/40";

  return (
    <div className="w-full max-w-md mx-auto text-center select-none">
      {/* HUD */}
      <div className="flex justify-between items-center w-full mb-6 font-mono text-sm tracking-widest text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="text-xs">⏱</span> {seconds}s
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map(i => (
            <Heart key={i} className={`w-5 h-5 transition-all ${i <= lives ? "fill-red-500 text-red-500" : "text-zinc-700"}`} />
          ))}
        </div>
        <div>WORDS <span className="text-white font-bold">{currentIndex}/{wordList.length}</span></div>
      </div>

      {/* Answer slots */}
      <motion.div
        className={`min-h-[72px] w-full flex items-center justify-center flex-wrap gap-2 p-4 rounded-2xl border shadow-lg mb-4 transition-all ${feedbackBg}`}
        animate={feedback === "wrong" ? { x: [-6, 6, -6, 6, 0] } : {}}
        transition={{ duration: 0.35 }}
      >
        {placed.length === 0 ? (
          <span className="text-zinc-600 text-sm tracking-widest">Click letters to spell the word…</span>
        ) : (
          placed.map((tile, index) => (
            <motion.button
              key={tile.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePlacedClick(tile, index)}
              disabled={isChecking}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-black text-lg sm:text-xl flex items-center justify-center transition-all border
                ${feedback === "correct" ? "bg-emerald-900/40 border-emerald-500/60 text-emerald-300" :
                  feedback === "wrong"   ? "bg-red-900/40 border-red-500/60 text-red-300" :
                  "bg-primary/20 border-primary/40 text-primary hover:bg-primary/30"}`}
            >
              {tile.letter}
            </motion.button>
          ))
        )}
      </motion.div>

      {/* Empty slots indicator */}
      <div className="flex items-center justify-center gap-1 mb-6">
        {Array.from({ length: currentWord.length }).map((_, i) => (
          <div
            key={i}
            className={`h-0.5 rounded-full transition-all ${i < placed.length ? "bg-primary w-5" : "bg-zinc-700 w-3"}`}
          />
        ))}
      </div>

      {/* Pool tiles */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 min-h-[56px]">
        <AnimatePresence>
          {pool.map(tile => (
            <motion.button
              key={tile.id}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              whileHover={{ scale: 1.15, y: -3 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePoolClick(tile)}
              disabled={isChecking}
              className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-zinc-800 border border-zinc-600 hover:bg-zinc-700 hover:border-zinc-400 font-black text-lg sm:text-xl text-white transition-all shadow-md"
            >
              {tile.letter}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShuffle}
          disabled={isChecking || pool.length < 2}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800/60 border border-zinc-700 px-3 py-2 rounded-lg disabled:opacity-40 transition-all"
        >
          <Shuffle className="w-3.5 h-3.5" /> Shuffle
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleHint}
          disabled={isChecking || pool.length === 0 || placed.length >= currentWord.length}
          className="flex items-center gap-1.5 text-xs font-semibold text-yellow-400/80 hover:text-yellow-300 bg-yellow-900/20 border border-yellow-700/40 px-3 py-2 rounded-lg disabled:opacity-40 transition-all"
        >
          <Lightbulb className="w-3.5 h-3.5" /> Hint {hintsUsed > 0 ? `(−${hintsUsed * HINT_COST}pts)` : `(−${HINT_COST}pts)`}
        </motion.button>
      </div>

      {/* Score display */}
      <div className="mt-4 text-zinc-500 text-sm">
        Score: <span className="text-white font-bold">{score}</span>
      </div>
    </div>
  );
}
