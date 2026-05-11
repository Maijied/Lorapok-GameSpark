import { Router, type IRouter } from "express";
import { desc, eq, max, avg, count } from "drizzle-orm";
import { db, scoresTable } from "@workspace/db";
import {
  ListScoresQueryParams,
  ListScoresResponse,
  SubmitScoreBody,
  GetStatsResponse,
  GetLeaderboardResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const GAME_NAMES: Record<string, string> = {
  memory_match: "Memory Match",
  number_sequence: "Number Sequence",
  word_scramble: "Word Scramble",
};

router.get("/scores", async (req, res): Promise<void> => {
  const parsed = ListScoresQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { gameType, limit } = parsed.data;
  const take = limit ?? 20;

  let query = db.select().from(scoresTable).$dynamic();
  if (gameType) {
    query = query.where(eq(scoresTable.gameType, gameType));
  }
  const scores = await query.orderBy(desc(scoresTable.completedAt)).limit(take);

  const mapped = scores.map((s) => ({
    ...s,
    completedAt: s.completedAt.toISOString(),
  }));

  res.json(ListScoresResponse.parse(mapped));
});

router.post("/scores", async (req, res): Promise<void> => {
  const parsed = SubmitScoreBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid score submission");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { gameType, score, duration } = parsed.data;
  const gameName = GAME_NAMES[gameType] ?? gameType;

  const [inserted] = await db
    .insert(scoresTable)
    .values({ gameType, gameName, score, duration })
    .returning();

  res.status(201).json({
    id: inserted.id,
    gameType: inserted.gameType,
    gameName: inserted.gameName,
    score: inserted.score,
    duration: inserted.duration,
    completedAt: inserted.completedAt.toISOString(),
  });
});

router.get("/scores/stats", async (req, res): Promise<void> => {
  req.log.info("Getting player stats");

  const allScores = await db
    .select()
    .from(scoresTable)
    .orderBy(desc(scoresTable.completedAt));

  const totalGamesPlayed = allScores.length;

  const today = new Date().toISOString().split("T")[0];
  const gamesPlayedToday = allScores.filter(
    (s) => s.completedAt.toISOString().split("T")[0] === today
  ).length;

  const avgScore =
    totalGamesPlayed > 0
      ? Math.round(allScores.reduce((sum, s) => sum + s.score, 0) / totalGamesPlayed)
      : 0;

  const bestMemoryMatch =
    allScores.filter((s) => s.gameType === "memory_match").reduce(
      (best, s) => (s.score > (best ?? 0) ? s.score : best),
      null as number | null
    );
  const bestNumberSequence =
    allScores.filter((s) => s.gameType === "number_sequence").reduce(
      (best, s) => (s.score > (best ?? 0) ? s.score : best),
      null as number | null
    );
  const bestWordScramble =
    allScores.filter((s) => s.gameType === "word_scramble").reduce(
      (best, s) => (s.score > (best ?? 0) ? s.score : best),
      null as number | null
    );

  // Calculate streak: count consecutive days with at least one game played
  const playedDays = new Set(
    allScores.map((s) => s.completedAt.toISOString().split("T")[0])
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  const checkDate = new Date();

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (playedDays.has(dateStr)) {
      streak++;
      if (i === 0 || i === 1) {
        currentStreak = streak;
      }
      longestStreak = Math.max(longestStreak, streak);
    } else {
      if (i > 1) break;
      streak = 0;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  const stats = {
    totalGamesPlayed,
    currentStreak,
    longestStreak,
    averageScore: avgScore,
    gamesPlayedToday,
    dailyGoal: 3,
    bestScores: {
      memory_match: bestMemoryMatch,
      number_sequence: bestNumberSequence,
      word_scramble: bestWordScramble,
    },
  };

  res.json(GetStatsResponse.parse(stats));
});

router.get("/scores/leaderboard", async (req, res): Promise<void> => {
  req.log.info("Getting leaderboard");

  const gameTypes = ["memory_match", "number_sequence", "word_scramble"];
  const entries: {
    gameType: string;
    gameName: string;
    score: number;
    duration: number;
    completedAt: string;
  }[] = [];

  for (const gameType of gameTypes) {
    const [top] = await db
      .select()
      .from(scoresTable)
      .where(eq(scoresTable.gameType, gameType))
      .orderBy(desc(scoresTable.score))
      .limit(1);

    if (top) {
      entries.push({
        gameType: top.gameType,
        gameName: top.gameName,
        score: top.score,
        duration: top.duration,
        completedAt: top.completedAt.toISOString(),
      });
    }
  }

  res.json(GetLeaderboardResponse.parse(entries));
});

export default router;
