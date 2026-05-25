import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Star, Zap, Heart, Moon, Sun, Flame, Leaf,
  Sparkles, Crown, Rocket, Shield,
} from "lucide-react";
import { seededShuffle } from "@/lib/seeded-random";
import { playFlip, playMatch, playCombo, playWrong, playVictory } from "@/lib/sound";

interface MemoryMatchProps {
  onComplete: (score: number, duration: number) => void;
  seed?: number;
}

type Difficulty = "easy" | "medium" | "hard";

interface DiffConfig {
  pairs: number;
  cols: number;
  timer: number | null;
  label: string;
  scoreBase: number;
  gridClass: string;
  cardClass: string;
  color: string;
}

const CONFIGS: Record<Difficulty, DiffConfig> = {
  easy:   { pairs: 8,  cols: 4, timer: null, label: "Easy",   scoreBase: 1000, gridClass: "grid-cols-4", cardClass: "h-16 sm:h-20",  color: "text-emerald-400 border-emerald-600/40 bg-emerald-900/20" },
  medium: { pairs: 10, cols: 5, timer: 120,  label: "Medium", scoreBase: 1800, gridClass: "grid-cols-5", cardClass: "h-14 sm:h-16",  color: "text-yellow-400 border-yellow-600/40 bg-yellow-900/20" },
  hard:   { pairs: 12, cols: 6, timer: 90,   label: "Hard",   scoreBase: 3000, gridClass: "grid-cols-6", cardClass: "h-11 sm:h-14",  color: "text-red-400 border-red-600/40 bg-red-900/20" },
};

const ALL_ICONS = [Brain, Star, Zap, Heart, Moon, Sun, Flame, Leaf, Sparkles, Crown, Rocket, Shield];

type Phase = "select" | "playing";

function CardBack() {
  return (
    <svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="cbg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a0533" />
          <stop offset="100%" stopColor="#0d1142" />
        </linearGradient>
        <pattern id="cgrid" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M8,0L0,0 0,8" fill="none" stroke="rgba(124,58,237,0.18)" strokeWidth="0.4" />
        </pattern>
        <filter id="cglow">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="80" height="100" rx="8" fill="url(#cbg)" />
      <rect width="80" height="100" rx="8" fill="url(#cgrid)" />

      {/* Border */}
      <rect x="1" y="1" width="78" height="98" rx="7" fill="none" stroke="rgba(124,58,237,0.35)" strokeWidth="1" />

      {/* Top label */}
      <text x="40" y="13" textAnchor="middle" fontFamily="sans-serif" fontWeight="700" fontSize="5"
        fill="rgba(124,58,237,0.6)" letterSpacing="2.5">LORAPOK</text>

      {/* Brain shape (center) */}
      <g filter="url(#cglow)" transform="translate(40,50)">
        {/* Left hemisphere */}
        <path d="M0,-17 C-5,-17 -12,-13 -14,-7 C-16,-1 -14,6 -10,11 C-7,14 -4,16 0,17"
          fill="none" stroke="rgba(124,58,237,0.7)" strokeWidth="1.5" strokeLinecap="round" />
        {/* Right hemisphere */}
        <path d="M0,-17 C5,-17 12,-13 14,-7 C16,-1 14,6 10,11 C7,14 4,16 0,17"
          fill="none" stroke="rgba(124,58,237,0.7)" strokeWidth="1.5" strokeLinecap="round" />
        {/* Center divide */}
        <line x1="0" y1="-12" x2="0" y2="14" stroke="rgba(124,58,237,0.4)" strokeWidth="0.8" strokeDasharray="2,2" />
        {/* Gyri lines left */}
        <path d="M-9,-8 C-11,-4 -11,2 -9,6" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1" strokeLinecap="round" />
        <path d="M-4,-12 C-6,-8 -6,-2 -4,2" fill="none" stroke="rgba(167,139,250,0.4)" strokeWidth="1" strokeLinecap="round" />
        {/* Gyri lines right */}
        <path d="M9,-8 C11,-4 11,2 9,6" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1" strokeLinecap="round" />
        <path d="M4,-12 C6,-8 6,-2 4,2" fill="none" stroke="rgba(167,139,250,0.4)" strokeWidth="1" strokeLinecap="round" />
        {/* Lightning bolt */}
        <path d="M3,-5 L-1,3 L2,3 L-2,10 L7,0 L3,0 Z"
          fill="rgba(167,139,250,0.95)" />
      </g>

      {/* Corner dots */}
      <circle cx="8" cy="8" r="1.5" fill="rgba(124,58,237,0.5)" />
      <circle cx="72" cy="8" r="1.5" fill="rgba(124,58,237,0.5)" />
      <circle cx="8" cy="92" r="1.5" fill="rgba(124,58,237,0.5)" />
      <circle cx="72" cy="92" r="1.5" fill="rgba(124,58,237,0.5)" />

      {/* Bottom label */}
      <text x="40" y="89" textAnchor="middle" fontFamily="sans-serif" fontWeight="700" fontSize="4.5"
        fill="rgba(124,58,237,0.6)" letterSpacing="2">BRAINSPARK</text>

      {/* Accent lines */}
      <line x1="18" y1="19" x2="62" y2="19" stroke="rgba(124,58,237,0.2)" strokeWidth="0.5" />
      <line x1="18" y1="81" x2="62" y2="81" stroke="rgba(124,58,237,0.2)" strokeWidth="0.5" />
    </svg>
  );
}

export default function MemoryMatch({ onComplete, seed }: MemoryMatchProps) {
  const [phase, setPhase] = useState<Phase>(seed !== undefined ? "playing" : "select");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [cards, setCards] = useState<{ id: number; iconId: number; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboFlash, setComboFlash] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cfg = CONFIGS[difficulty];

  const initGame = (diff: Difficulty) => {
    const c = CONFIGS[diff];
    const iconIds = [...Array(c.pairs).keys(), ...Array(c.pairs).keys()];
    const shuffled = seed !== undefined
      ? seededShuffle(iconIds, seed)
      : [...iconIds].sort(() => Math.random() - 0.5);
    setCards(shuffled.map((iconId, index) => ({ id: index, iconId, isFlipped: false, isMatched: false })));
    setMatches(0);
    setMoves(0);
    setCombo(0);
    setFlippedIndices([]);
    setIsLocked(false);
    setStartTime(Date.now());
    if (c.timer) {
      setTimeLeft(c.timer);
    } else {
      setTimeLeft(null);
    }
  };

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setPhase("playing");
    initGame(diff);
  };

  useEffect(() => {
    if (seed !== undefined) initGame("easy");
  }, [seed]);

  useEffect(() => {
    if (phase !== "playing" || timeLeft === null) return;
    if (timeLeft <= 0) {
      const dur = Math.floor((Date.now() - (startTime ?? Date.now())) / 1000);
      onComplete(0, dur);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t === null || t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        if (t <= 10) playFlip();
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, timeLeft === null ? null : Math.floor(timeLeft / cfg.timer! || 1)]);

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;
    playFlip();

    const newCards = [...cards];
    newCards[index] = { ...newCards[index], isFlipped: true };
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsLocked(true);
      const [a, b] = newFlipped;

      if (newCards[a].iconId === newCards[b].iconId) {
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo >= 2) {
          playCombo();
          setComboFlash(true);
          setTimeout(() => setComboFlash(false), 800);
        } else {
          playMatch();
        }

        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === a || i === b ? { ...c, isMatched: true } : c,
          ));
          setFlippedIndices([]);
          setMatches(m => {
            const next = m + 1;
            if (next === cfg.pairs) {
              const duration = Math.floor((Date.now() - (startTime ?? Date.now())) / 1000);
              const optimalMoves = cfg.pairs;
              const movePenalty = Math.max(0, moves + 1 - optimalMoves) * 15;
              const timePenalty = cfg.timer
                ? Math.max(0, (cfg.timer - (timeLeft ?? cfg.timer)) * 2)
                : duration * 2;
              const comboBonus = combo * 30;
              playVictory();
              if (timerRef.current) clearInterval(timerRef.current);
              onComplete(Math.max(100, cfg.scoreBase - movePenalty - timePenalty + comboBonus), duration);
            }
            return next;
          });
          setIsLocked(false);
        }, 500);
      } else {
        setCombo(0);
        playWrong();
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === a || i === b ? { ...c, isFlipped: false } : c,
          ));
          setFlippedIndices([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  if (phase === "select") {
    return (
      <div className="w-full max-w-sm mx-auto text-center space-y-5 px-2">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Choose Difficulty</h2>
          <p className="text-zinc-500 text-sm">Higher difficulty = more pairs, bigger score bonus</p>
        </div>
        <div className="space-y-3">
          {(["easy", "medium", "hard"] as Difficulty[]).map(diff => {
            const c = CONFIGS[diff];
            return (
              <motion.button
                key={diff}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => startGame(diff)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${c.color}`}
              >
                <div className="text-left">
                  <div className="font-bold text-lg text-white">{c.label}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {c.pairs} pairs · {c.cols}×{Math.ceil((c.pairs * 2) / c.cols)} grid
                    {c.timer ? ` · ${c.timer}s timer` : " · No timer"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Up to</div>
                  <div className="font-black text-white text-xl">{c.scoreBase.toLocaleString()}</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  const timerPct = cfg.timer && timeLeft !== null ? timeLeft / cfg.timer : null;
  const iconSize = difficulty === "hard" ? "w-4 h-4 sm:w-5 sm:h-5" : difficulty === "medium" ? "w-5 h-5 sm:w-6 sm:h-6" : "w-6 h-6 sm:w-8 sm:h-8";

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-3 px-1">
      {/* HUD */}
      <div className="flex justify-between w-full font-mono text-xs sm:text-sm tracking-widest text-zinc-400 px-1">
        <div>MOVES <span className="text-white font-bold">{moves}</span></div>

        <AnimatePresence>
          {comboFlash && (
            <motion.div
              key="combo"
              initial={{ scale: 0.5, opacity: 0, y: 10 }}
              animate={{ scale: 1.2, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -10 }}
              className="text-yellow-400 font-black text-xs sm:text-base tracking-widest"
            >
              ⚡ COMBO ×{combo}!
            </motion.div>
          )}
        </AnimatePresence>

        <div>PAIRS <span className="text-white font-bold">{matches}/{cfg.pairs}</span></div>
      </div>

      {/* Timer bar */}
      {timerPct !== null && (
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-colors ${timerPct > 0.5 ? "bg-emerald-500" : timerPct > 0.25 ? "bg-yellow-500" : "bg-red-500"}`}
            animate={{ width: `${timerPct * 100}%` }}
            transition={{ duration: 0.9, ease: "linear" }}
          />
        </div>
      )}

      {/* Grid */}
      <div className={`grid ${cfg.gridClass} gap-1.5 sm:gap-2 w-full`}>
        {cards.map((card, index) => {
          const IconComponent = ALL_ICONS[card.iconId];
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.015 }}
              className={`relative ${cfg.cardClass} cursor-pointer select-none`}
              style={{ perspective: "600px" }}
              onClick={() => handleCardClick(index)}
            >
              <motion.div
                className="w-full h-full relative"
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ duration: 0.35 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Card Back — Lorapok design */}
                <div
                  className="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-md hover:shadow-primary/20 transition-shadow"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <CardBack />
                </div>

                {/* Card Front — icon */}
                <div
                  className={`absolute inset-0 backface-hidden rounded-xl flex items-center justify-center shadow-lg border
                    ${card.isMatched ? "bg-primary/20 border-primary/60 shadow-primary/20" : "bg-zinc-800 border-zinc-600"}`}
                  style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                >
                  <IconComponent className={`${iconSize} ${card.isMatched ? "text-primary" : "text-zinc-200"}`} />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {seed === undefined && (
        <button
          onClick={() => setPhase("select")}
          className={`text-xs font-bold px-3 py-1 rounded-full border ${cfg.color} opacity-60 hover:opacity-100 transition-opacity`}
        >
          {cfg.label} · Change Difficulty
        </button>
      )}
    </div>
  );
}
