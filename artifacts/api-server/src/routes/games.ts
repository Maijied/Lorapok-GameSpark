import { Router, type IRouter } from "express";
import {
  ListGamesResponse,
  GetDailyChallengeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const CLASSIC_GAMES = [
  {
    id: 1,
    name: "Memory Match",
    type: "memory_match",
    description: "Flip cards to find matching pairs. Train your visual memory and concentration.",
    difficulty: "easy",
    instructions: "Cards are placed face-down in a grid. Flip two cards at a time — if they match, they stay revealed. Find all pairs to win. Fewer attempts = higher score.",
  },
  {
    id: 2,
    name: "Number Sequence",
    type: "number_sequence",
    description: "Watch a number sequence, then recall it from memory. Each round gets harder.",
    difficulty: "medium",
    instructions: "A sequence of numbers flashes on screen. Memorize it, then type it back in the correct order. Sequences grow longer each round. You have 3 lives.",
  },
  {
    id: 3,
    name: "Word Scramble",
    type: "word_scramble",
    description: "Unscramble words against the clock. Tests vocabulary and pattern recognition.",
    difficulty: "medium",
    instructions: "Each word is shown in scrambled order. Click letter tiles to spell the answer. Use Hint (−30 pts) or Shuffle as needed. Solve 10 words.",
  },
];

const ALL_GAMES = [
  ...CLASSIC_GAMES,
  {
    id: 4,
    name: "Math Sprint",
    type: "math_sprint",
    description: "Solve 20 arithmetic problems in 60 seconds. Operations ramp from easy addition to tricky division.",
    difficulty: "medium",
    instructions: "A math problem appears — type the answer and press Enter. 4 difficulty waves: addition → subtraction → multiplication → division. Score 50 pts per correct answer plus a time bonus at the end.",
  },
  {
    id: 5,
    name: "Color Stroop",
    type: "color_stroop",
    description: "The classic Stroop effect — click the ink color, not the word. Famously used in psychology research.",
    difficulty: "hard",
    instructions: "A color word (RED, BLUE…) appears in a different ink color. Click the button matching the INK color — ignore what the word says. 20 rounds, 45 seconds. Wrong answers deduct 10 pts.",
  },
  {
    id: 6,
    name: "Reaction Blitz",
    type: "reaction_blitz",
    description: "Click the target the instant it appears. Tests your neural reaction speed over 10 rounds.",
    difficulty: "easy",
    instructions: "Wait for the circle to turn GREEN, then tap as fast as you can. Clicking too early is a false start (−100 pts). Your average reaction time in milliseconds determines your score. Best humans avg ~250ms.",
  },
  {
    id: 7,
    name: "Pattern IQ",
    type: "pattern_iq",
    description: "Complete the number sequence. Covers arithmetic, geometric, Fibonacci, primes, squares, and more.",
    difficulty: "hard",
    instructions: "A number sequence with one missing element is shown. Select the correct answer from 4 choices. 10 questions, 20 seconds each. The rule is revealed after every answer.",
  },
  {
    id: 8,
    name: "Trivia Quest",
    type: "trivia_quest",
    description: "10 multiple-choice questions from Science, Math, History, Geography, Psychology, and more.",
    difficulty: "medium",
    instructions: "Four options are shown for each question. Select your answer before the 15-second timer runs out. Faster correct answers score more points. No penalty for wrong guesses.",
  },
];

router.get("/games", async (req, res): Promise<void> => {
  req.log.info("Listing games");
  const games = ALL_GAMES.map((g) => ({ ...g, bestScore: null }));
  res.json(ListGamesResponse.parse(games));
});

router.get("/games/daily", async (req, res): Promise<void> => {
  req.log.info("Getting daily challenge");
  const today = new Date().toISOString().split("T")[0];
  const games = CLASSIC_GAMES.map((g) => ({ ...g, bestScore: null }));
  const response = {
    date: today,
    games,
    completedCount: 0,
    totalGames: games.length,
  };
  res.json(GetDailyChallengeResponse.parse(response));
});

export default router;
