import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { seededShuffle } from "@/lib/seeded-random";
import { playCorrect, playWrong, playVictory, playTick } from "@/lib/sound";

interface TriviaQuestProps {
  onComplete: (score: number, duration: number) => void;
  seed?: number;
}

interface Question {
  question: string;
  options: string[];
  correct: number;
  category: string;
  emoji: string;
}

const ALL_QUESTIONS: Question[] = [
  { question: "What is the speed of light (approx.)?", options: ["300 km/s","30,000 km/s","300,000 km/s","3,000,000 km/s"], correct: 2, category: "Physics", emoji: "💡" },
  { question: "How many sides does a hexagon have?", options: ["5","6","7","8"], correct: 1, category: "Math", emoji: "📐" },
  { question: "In what year did World War II end?", options: ["1943","1944","1945","1946"], correct: 2, category: "History", emoji: "📜" },
  { question: "What is the largest ocean on Earth?", options: ["Atlantic","Pacific","Indian","Arctic"], correct: 1, category: "Geography", emoji: "🌊" },
  { question: "Who wrote Romeo and Juliet?", options: ["Dickens","Shakespeare","Austen","Hemingway"], correct: 1, category: "Literature", emoji: "📖" },
  { question: "What is the chemical symbol for gold?", options: ["Ag","Fe","Au","Pb"], correct: 2, category: "Chemistry", emoji: "🧪" },
  { question: "What planet is known as the Red Planet?", options: ["Venus","Mars","Jupiter","Saturn"], correct: 1, category: "Astronomy", emoji: "🔭" },
  { question: "What is the powerhouse of the cell?", options: ["Nucleus","Ribosome","Mitochondria","Golgi apparatus"], correct: 2, category: "Biology", emoji: "🔬" },
  { question: "What is the square root of 144?", options: ["10","11","12","13"], correct: 2, category: "Math", emoji: "📐" },
  { question: "Who painted the Mona Lisa?", options: ["Michelangelo","Leonardo da Vinci","Picasso","Raphael"], correct: 1, category: "Art", emoji: "🎨" },
  { question: "What is the capital of Japan?", options: ["Osaka","Kyoto","Tokyo","Hiroshima"], correct: 2, category: "Geography", emoji: "🗾" },
  { question: "What gas do plants absorb during photosynthesis?", options: ["O₂","N₂","CO₂","H₂"], correct: 2, category: "Biology", emoji: "🌿" },
  { question: "What year did the first iPhone launch?", options: ["2005","2006","2007","2008"], correct: 2, category: "Technology", emoji: "📱" },
  { question: "What is the sum of angles in a triangle?", options: ["90°","120°","180°","360°"], correct: 2, category: "Math", emoji: "📐" },
  { question: "Which element has atomic number 1?", options: ["Helium","Hydrogen","Carbon","Oxygen"], correct: 1, category: "Chemistry", emoji: "🧪" },
  { question: "What is the largest planet in our solar system?", options: ["Saturn","Neptune","Jupiter","Uranus"], correct: 2, category: "Astronomy", emoji: "🔭" },
  { question: "What language has the most native speakers?", options: ["English","Spanish","Mandarin Chinese","Hindi"], correct: 2, category: "Language", emoji: "💬" },
  { question: "The Stroop effect is about…", options: ["A memory trick","Color-word interference","An optical illusion","A brain disorder"], correct: 1, category: "Psychology", emoji: "🧠" },
  { question: "What is the binary for decimal 10?", options: ["101","110","1010","1100"], correct: 2, category: "Computing", emoji: "💻" },
  { question: "How many bones are in the adult human body?", options: ["196","206","216","226"], correct: 1, category: "Biology", emoji: "🦴" },
  { question: "What is 17 × 13?", options: ["207","215","221","231"], correct: 2, category: "Math", emoji: "📐" },
  { question: "Which country is home to the Great Barrier Reef?", options: ["Brazil","New Zealand","South Africa","Australia"], correct: 3, category: "Geography", emoji: "🐠" },
  { question: "What does DNA stand for?", options: ["Dynamic Nuclear Acid","Deoxyribonucleic Acid","Directed Nucleotide Array","Digital Nuclear Agent"], correct: 1, category: "Biology", emoji: "🔬" },
  { question: "What is Newton's first law about?", options: ["F = ma","Inertia","Gravity","Thermodynamics"], correct: 1, category: "Physics", emoji: "💡" },
  { question: "In which country was Marie Curie born?", options: ["France","Russia","Poland","Germany"], correct: 2, category: "History", emoji: "📜" },
  { question: "What is the chemical formula for table salt?", options: ["KCl","NaOH","NaCl","CaCO₃"], correct: 2, category: "Chemistry", emoji: "🧪" },
  { question: "What is the Pythagorean theorem?", options: ["a+b=c","a²+b²=c²","a×b=c²","2πr=c"], correct: 1, category: "Math", emoji: "📐" },
  { question: "Which planet has the most moons?", options: ["Jupiter","Saturn","Uranus","Neptune"], correct: 1, category: "Astronomy", emoji: "🔭" },
  { question: "What colour is the sky on Mars?", options: ["Blue","White","Pink/Tan","Black"], correct: 2, category: "Astronomy", emoji: "🔭" },
  { question: "How many keys does a standard piano have?", options: ["72","76","88","92"], correct: 2, category: "Music", emoji: "🎵" },
];

const TIME_PER_Q = 15;
const TOTAL_Q = 10;

const CATEGORY_COLORS: Record<string, string> = {
  Physics: "text-yellow-400", Math: "text-blue-400", History: "text-amber-400",
  Geography: "text-emerald-400", Literature: "text-pink-400", Chemistry: "text-cyan-400",
  Astronomy: "text-purple-400", Biology: "text-green-400", Art: "text-rose-400",
  Technology: "text-sky-400", Language: "text-indigo-400", Psychology: "text-violet-400",
  Computing: "text-teal-400", Music: "text-orange-400",
};

export default function TriviaQuest({ onComplete, seed }: TriviaQuestProps) {
  const [questions] = useState<Question[]>(() =>
    seededShuffle([...ALL_QUESTIONS], seed ?? Math.floor(Math.random() * 9999)).slice(0, TOTAL_Q),
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [selected, setSelected] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const startTimeRef = useRef(Date.now());
  const scoreRef = useRef(0);

  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => {
    setTimeLeft(TIME_PER_Q);
    setSelected(null);
    setIsLocked(false);

    const iv = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 5 && t > 0) playTick();
        if (t <= 1) {
          clearInterval(iv);
          setIsLocked(true);
          setSelected(-1);
          playWrong();
          setTimeout(() => advance(), 1200);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [currentIdx]);

  const advance = () => {
    setTimeout(() => {
      const next = currentIdx + 1;
      if (next >= TOTAL_Q) {
        playVictory();
        const dur = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onComplete(scoreRef.current, dur);
      } else {
        setCurrentIdx(next);
      }
    }, 600);
  };

  const handleChoice = (idx: number) => {
    if (isLocked) return;
    setIsLocked(true);
    setSelected(idx);
    const correct = idx === questions[currentIdx].correct;
    if (correct) {
      const timeBonus = timeLeft * 6;
      setScore(s => s + 100 + timeBonus);
      setCorrectCount(c => c + 1);
      playCorrect();
    } else {
      playWrong();
    }
    setTimeout(advance, correct ? 800 : 1200);
  };

  const q = questions[currentIdx];
  const timerPct = timeLeft / TIME_PER_Q;
  const catColor = CATEGORY_COLORS[q.category] ?? "text-primary";

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      {/* HUD */}
      <div className="flex justify-between items-center mb-4 font-mono text-sm tracking-widest text-zinc-400">
        <div>SCORE <span className="text-white font-bold">{score}</span></div>
        <div>✓ <span className="text-emerald-400 font-bold">{correctCount}</span>/{currentIdx}</div>
        <div>{currentIdx + 1}/{TOTAL_Q}</div>
      </div>

      {/* Timer */}
      <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-6 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${timerPct > 0.5 ? "bg-primary" : timerPct > 0.3 ? "bg-yellow-500" : "bg-red-500"}`}
          animate={{ width: `${timerPct * 100}%` }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="mb-6"
        >
          <div className={`text-xs font-bold uppercase tracking-widest mb-3 ${catColor}`}>
            {q.emoji} {q.category}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug min-h-[3.5rem] flex items-center justify-center">
            {q.question}
          </h3>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.options.map((option, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === q.correct;
          const isTimeout = selected === -1;

          let style = "bg-zinc-800/80 border-zinc-700 hover:border-primary/50 hover:bg-zinc-700/80 text-white text-left";
          if (isLocked && isCorrect)        style = "bg-emerald-900/40 border-emerald-500 text-emerald-200";
          if (isSelected && !isCorrect)     style = "bg-red-900/40 border-red-500 text-red-200";
          if (isTimeout && !isCorrect)      style = "bg-zinc-900/40 border-zinc-800 text-zinc-600";

          return (
            <motion.button
              key={idx}
              whileHover={!isLocked ? { scale: 1.02, x: 3 } : {}}
              whileTap={!isLocked ? { scale: 0.98 } : {}}
              onClick={() => handleChoice(idx)}
              disabled={isLocked}
              className={`px-4 py-3 rounded-2xl font-semibold border-2 transition-all text-sm sm:text-base ${style}`}
            >
              <span className="text-zinc-500 font-mono mr-2">{String.fromCharCode(65 + idx)}.</span>
              {option}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
