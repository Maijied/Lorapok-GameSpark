import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "./firebase";

export type GameType =
  | "memory_match"
  | "number_sequence"
  | "word_scramble"
  | "math_sprint"
  | "color_stroop"
  | "reaction_blitz"
  | "pattern_iq"
  | "trivia_quest";

export interface MPPlayer {
  uid: string;
  displayName: string;
  photoURL: string | null;
}

export interface MPResult {
  score: number;
  duration: number;
}

export interface Room {
  id: string;
  gameType: GameType;
  status: "waiting" | "playing" | "finished";
  seed: number;
  host: MPPlayer;
  guest: MPPlayer | null;
  hostResult: MPResult | null;
  guestResult: MPResult | null;
  createdAt?: unknown;
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function createRoom(gameType: GameType, host: MPPlayer): Promise<string> {
  const roomId = generateRoomCode();
  const seed = Math.floor(Math.random() * 9_000_000) + 1_000_000;
  await setDoc(doc(db, "rooms", roomId), {
    gameType,
    status: "waiting",
    seed,
    host,
    guest: null,
    hostResult: null,
    guestResult: null,
    createdAt: serverTimestamp(),
  });
  return roomId;
}

export async function joinRoom(roomId: string, guest: MPPlayer): Promise<Room> {
  const roomRef = doc(db, "rooms", roomId.toUpperCase());
  const snap = await getDoc(roomRef);
  if (!snap.exists()) throw new Error("Room not found. Check the code and try again.");
  const data = snap.data() as Omit<Room, "id">;
  if (data.status !== "waiting") throw new Error("This room is already in progress or finished.");
  if (data.guest) throw new Error("Room is full.");
  if (data.host.uid === guest.uid) throw new Error("You can't join your own room. Share the code with a friend!");
  await updateDoc(roomRef, { guest, status: "playing" });
  return { id: roomId.toUpperCase(), ...data, guest, status: "playing" };
}

export async function submitMultiplayerResult(
  roomId: string,
  role: "host" | "guest",
  score: number,
  duration: number
): Promise<void> {
  const roomRef = doc(db, "rooms", roomId);
  const resultField = role === "host" ? "hostResult" : "guestResult";
  const otherField = role === "host" ? "guestResult" : "hostResult";

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(roomRef);
    const data = snap.data() as Omit<Room, "id">;
    const updates: Record<string, unknown> = { [resultField]: { score, duration } };
    if (data[otherField]) updates.status = "finished";
    tx.update(roomRef, updates);
  });
}

export function listenToRoom(roomId: string, callback: (room: Room | null) => void): () => void {
  return onSnapshot(doc(db, "rooms", roomId), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback({ id: snap.id, ...(snap.data() as Omit<Room, "id">) });
  });
}
