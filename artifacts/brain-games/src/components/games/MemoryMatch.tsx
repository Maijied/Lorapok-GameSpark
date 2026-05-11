import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Star, Zap, Heart, Moon, Sun, Flame, Leaf, Shield, Trophy } from "lucide-react";

interface MemoryMatchProps {
  onComplete: (score: number, duration: number) => void;
}

const ICONS = [Brain, Star, Zap, Heart, Moon, Sun, Flame, Leaf];

export default function MemoryMatch({ onComplete }: MemoryMatchProps) {
  const [cards, setCards] = useState<{ id: number; iconId: number; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    // Initialize game
    const shuffledCards = [...ICONS, ...ICONS]
      .map((_, index) => ({ id: index, iconId: index % ICONS.length }))
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ ...card, id: index, isFlipped: false, isMatched: false }));
    
    setCards(shuffledCards);
    setStartTime(Date.now());
  }, []);

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setMoves(m => m + 1);
      setIsLocked(true);

      const [firstIndex, secondIndex] = newFlippedIndices;
      
      if (cards[firstIndex].iconId === cards[secondIndex].iconId) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setMatches(m => m + 1);
          setIsLocked(false);

          if (matches + 1 === ICONS.length) {
            // Game complete
            const duration = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
            // Base score 1000, minus penalty for extra moves and time
            const optimalMoves = ICONS.length;
            const extraMovesPenalty = Math.max(0, moves + 1 - optimalMoves) * 20;
            const timePenalty = duration * 2;
            const finalScore = Math.max(100, 1000 - extraMovesPenalty - timePenalty);
            
            onComplete(finalScore, duration);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      <div className="flex justify-between w-full mb-8 font-mono text-sm tracking-widest text-zinc-400">
        <div>MOVES: <span className="text-white font-bold">{moves}</span></div>
        <div>MATCHES: <span className="text-white font-bold">{matches}/{ICONS.length}</span></div>
      </div>
      
      <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full aspect-square">
        {cards.map((card, index) => {
          const IconComponent = ICONS[card.iconId];
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              className="relative w-full h-full cursor-pointer perspective-1000"
              onClick={() => handleCardClick(index)}
            >
              <motion.div
                className="w-full h-full relative preserve-3d transition-all duration-500 rounded-xl sm:rounded-2xl"
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front (face down) */}
                <div className="absolute inset-0 backface-hidden bg-zinc-800/80 border border-zinc-700/50 rounded-xl sm:rounded-2xl hover:bg-zinc-700/80 transition-colors shadow-lg shadow-black/20" />
                
                {/* Back (face up) */}
                <div 
                  className={`absolute inset-0 backface-hidden rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 border
                    ${card.isMatched ? 'bg-primary/20 border-primary/50' : 'bg-zinc-800 border-zinc-600'}
                  `}
                  style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                >
                  <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 ${card.isMatched ? 'text-primary' : 'text-zinc-300'}`} />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
