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
      "Each word is shown in scrambled order. Click letter tiles to spell the answer. Use Hint (−30 pts) or Shuffle as needed. Solve 10 words.",
    bestScore: null,
  },
  {
    id: 4,
    name: "Math Sprint",
    type: "math_sprint" as const,
    description: "Solve 20 arithmetic problems in 60 seconds. Operations ramp from easy addition to tricky division.",
    difficulty: "medium" as const,
    instructions:
      "A math problem appears — type the answer and press Enter. 4 difficulty waves: addition → subtraction → multiplication → division. Score 50 pts per correct answer plus a time bonus.",
    bestScore: null,
  },
  {
    id: 5,
    name: "Color Stroop",
    type: "color_stroop" as const,
    description: "The classic Stroop effect — click the ink color, not the word. Famously used in psychology research.",
    difficulty: "hard" as const,
    instructions:
      "A color word (RED, BLUE…) appears in a different ink color. Click the button matching the INK color — ignore what the word says. 20 rounds, 45 seconds.",
    bestScore: null,
  },
  {
    id: 6,
    name: "Reaction Blitz",
    type: "reaction_blitz" as const,
    description: "Click the target the instant it appears. Tests your neural reaction speed over 10 rounds.",
    difficulty: "easy" as const,
    instructions:
      "Wait for the circle to turn GREEN, then tap as fast as you can. Clicking too early is a false start (−100 pts). Your average reaction time determines your score.",
    bestScore: null,
  },
  {
    id: 7,
    name: "Pattern IQ",
    type: "pattern_iq" as const,
    description: "Complete the number sequence. Covers arithmetic, geometric, Fibonacci, primes, squares, and more.",
    difficulty: "hard" as const,
    instructions:
      "A number sequence with one missing element is shown. Select the correct answer from 4 choices. 10 questions, 20 seconds each.",
    bestScore: null,
  },
  {
    id: 8,
    name: "Trivia Quest",
    type: "trivia_quest" as const,
    description: "10 multiple-choice questions from Science, Math, History, Geography, Psychology, and more.",
    difficulty: "medium" as const,
    instructions:
      "Four options are shown for each question. Select your answer before the 15-second timer runs out. Faster correct answers score more.",
    bestScore: null,
  },
];

export const STATIC_CLASSIC_GAMES = STATIC_GAMES.slice(0, 3);

const today = new Date().toISOString().split("T")[0];

export const STATIC_DAILY_CHALLENGE = {
  date: today,
  games: STATIC_CLASSIC_GAMES,
  completedCount: 0,
  totalGames: 3,
};
