import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface FirestoreScore {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string | null;
  gameType: string;
  gameName: string;
  score: number;
  duration: number;
  completedAt: string;
}

export interface PlayerStats {
  totalGamesPlayed: number;
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
  gamesPlayedToday: number;
  dailyGoal: number;
  bestScores: {
    memory_match: number | null;
    number_sequence: number | null;
    word_scramble: number | null;
  };
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  gameType: string;
  gameName: string;
  score: number;
  duration: number;
  completedAt: string;
}

const GAME_NAMES: Record<string, string> = {
  memory_match: "Memory Match",
  number_sequence: "Number Sequence",
  word_scramble: "Word Scramble",
};

export async function submitScore(payload: {
  uid: string;
  displayName: string;
  photoURL: string | null;
  gameType: string;
  score: number;
  duration: number;
}): Promise<void> {
  await addDoc(collection(db, "scores"), {
    uid: payload.uid,
    displayName: payload.displayName,
    photoURL: payload.photoURL ?? null,
    gameType: payload.gameType,
    gameName: GAME_NAMES[payload.gameType] ?? payload.gameType,
    score: payload.score,
    duration: payload.duration,
    completedAt: serverTimestamp(),
  });
}

function toDate(val: unknown): Date {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  if (typeof val === "string") return new Date(val);
  return new Date();
}

export async function getUserScores(uid: string): Promise<FirestoreScore[]> {
  const q = query(
    collection(db, "scores"),
    where("uid", "==", uid),
    orderBy("completedAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      uid: data.uid,
      displayName: data.displayName,
      photoURL: data.photoURL ?? null,
      gameType: data.gameType,
      gameName: data.gameName,
      score: data.score,
      duration: data.duration,
      completedAt: toDate(data.completedAt).toISOString(),
    };
  });
}

export async function getPlayerStats(uid: string): Promise<PlayerStats> {
  const scores = await getUserScores(uid);

  const today = new Date().toISOString().split("T")[0];
  const gamesPlayedToday = scores.filter(
    (s) => s.completedAt.split("T")[0] === today
  ).length;

  const avg =
    scores.length > 0
      ? Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length)
      : 0;

  const best = (type: string) =>
    scores
      .filter((s) => s.gameType === type)
      .reduce<number | null>(
        (b, s) => (b === null || s.score > b ? s.score : b),
        null
      );

  const playedDays = new Set(scores.map((s) => s.completedAt.split("T")[0]));
  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  const checkDate = new Date();

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (playedDays.has(dateStr)) {
      streak++;
      if (i === 0 || (i === 1 && currentStreak === 0)) currentStreak = streak;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      if (i > 1) break;
      streak = 0;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return {
    totalGamesPlayed: scores.length,
    currentStreak,
    longestStreak,
    averageScore: avg,
    gamesPlayedToday,
    dailyGoal: 3,
    bestScores: {
      memory_match: best("memory_match"),
      number_sequence: best("number_sequence"),
      word_scramble: best("word_scramble"),
    },
  };
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const gameTypes = ["memory_match", "number_sequence", "word_scramble"];
  const results: LeaderboardEntry[] = [];

  for (const gameType of gameTypes) {
    const q = query(
      collection(db, "scores"),
      where("gameType", "==", gameType),
      orderBy("score", "desc"),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0].data();
      results.push({
        uid: d.uid,
        displayName: d.displayName,
        photoURL: d.photoURL ?? null,
        gameType: d.gameType,
        gameName: d.gameName,
        score: d.score,
        duration: d.duration,
        completedAt: toDate(d.completedAt).toISOString(),
      });
    }
  }

  return results;
}

export async function getAllRecentScores(limitCount = 20): Promise<FirestoreScore[]> {
  const q = query(
    collection(db, "scores"),
    orderBy("completedAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      uid: data.uid,
      displayName: data.displayName,
      photoURL: data.photoURL ?? null,
      gameType: data.gameType,
      gameName: data.gameName,
      score: data.score,
      duration: data.duration,
      completedAt: toDate(data.completedAt).toISOString(),
    };
  });
}
