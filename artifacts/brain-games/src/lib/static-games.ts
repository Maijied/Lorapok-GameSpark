export const STATIC_GAMES = [
  {
    id: 1,
    name: "Memory Match",
    type: "memory_match" as const,
    description: "Flip cards to find matching pairs. Train your visual memory and concentration.",
    difficulty: "easy" as const,
    instructions:
      "Cards are placed face-down in a grid. Flip two cards at a time — if they match, they stay revealed. Find all pairs to win. Fewer attempts = higher score.",
    bestScore: null,
  },
  {
    id: 2,
    name: "Number Sequence",
    type: "number_sequence" as const,
    description: "Watch a number sequence, then recall it from memory. Each round gets harder.",
    difficulty: "medium" as const,
    instructions:
      "A sequence of numbers flashes on screen. Memorize it, then type it back in the correct order. Sequences grow longer each round. You have 3 lives.",
    bestScore: null,
  },
  {
    id: 3,
    name: "Word Scramble",
    type: "word_scramble" as const,
    description: "Unscramble words against the clock. Tests vocabulary and pattern recognition.",
    difficulty: "medium" as const,
    instructions:
      "Each word is shown in scrambled order. Type the correct word as fast as you can. Solve 10 words — points deducted for wrong answers and time taken.",
    bestScore: null,
  },
];

const today = new Date().toISOString().split("T")[0];

export const STATIC_DAILY_CHALLENGE = {
  date: today,
  games: STATIC_GAMES,
  completedCount: 0,
  totalGames: 3,
};
