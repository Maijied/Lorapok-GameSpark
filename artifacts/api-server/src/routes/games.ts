import { Router, type IRouter } from "express";
import {
  ListGamesResponse,
  GetDailyChallengeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const GAMES = [
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
    instructions: "Each word is shown in scrambled order. Type the correct word as fast as you can. Solve 10 words — points deducted for wrong answers and time taken.",
  },
];

router.get("/games", async (req, res): Promise<void> => {
  req.log.info("Listing games");
  const games = GAMES.map((g) => ({ ...g, bestScore: null }));
  res.json(ListGamesResponse.parse(games));
});

router.get("/games/daily", async (req, res): Promise<void> => {
  req.log.info("Getting daily challenge");
  const today = new Date().toISOString().split("T")[0];
  const games = GAMES.map((g) => ({ ...g, bestScore: null }));
  const response = {
    date: today,
    games,
    completedCount: 0,
    totalGames: games.length,
  };
  res.json(GetDailyChallengeResponse.parse(response));
});

export default router;
