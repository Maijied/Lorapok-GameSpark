import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Copy, Users, Swords, Trophy, Clock, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import MemoryMatch from "@/components/games/MemoryMatch";
import NumberSequence from "@/components/games/NumberSequence";
import WordScramble from "@/components/games/WordScramble";
import {
  createRoom,
  joinRoom,
  submitMultiplayerResult,
  listenToRoom,
  type Room,
  type GameType,
} from "@/lib/multiplayer";
import { STATIC_GAMES } from "@/lib/static-games";

type PageState =
  | "auth"
  | "lobby"
  | "loading"
  | "waiting"
  | "countdown"
  | "playing"
  | "waiting-result"
  | "finished"
  | "error";

const GAME_NAMES: Record<string, string> = {
  memory_match: "Memory Match",
  number_sequence: "Number Sequence",
  word_scramble: "Word Scramble",
};

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function PlayerCard({
  player,
  label,
  result,
  isWinner,
  waiting,
}: {
  player: { displayName: string; photoURL: string | null };
  label: string;
  result: { score: number; duration: number } | null;
  isWinner: boolean;
  waiting: boolean;
}) {
  return (
    <div className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all
      ${isWinner ? "border-primary bg-primary/10 shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)]" : "border-zinc-700 bg-zinc-900/50"}`}>
      {isWinner && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Crown className="w-3 h-3" /> WINNER
          </span>
        </div>
      )}
      <Avatar className="w-16 h-16 ring-2 ring-zinc-700">
        <AvatarImage src={player.photoURL ?? undefined} />
        <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
          {initials(player.displayName)}
        </AvatarFallback>
      </Avatar>
      <div className="text-center">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="font-bold text-white truncate max-w-[140px]">{player.displayName}</p>
      </div>
      {result ? (
        <div className="text-center">
          <p className="text-3xl font-black text-white">{result.score.toLocaleString()}</p>
          <p className="text-zinc-500 text-xs flex items-center gap-1 justify-center mt-1">
            <Clock className="w-3 h-3" /> {result.duration}s
          </p>
        </div>
      ) : waiting ? (
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Playing…
        </div>
      ) : (
        <div className="text-zinc-600 text-sm">—</div>
      )}
    </div>
  );
}

export default function MultiplayerCanvas() {
  const { type } = useParams<{ type: string }>();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [pageState, setPageState] = useState<PageState>(user ? "lobby" : "auth");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [role, setRole] = useState<"host" | "guest">("host");
  const [countdown, setCountdown] = useState(3);
  const [copied, setCopied] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);
  const countdownStarted = useRef(false);

  const gameType = type as GameType;
  const gameName = GAME_NAMES[type ?? ""] ?? "Game";
  const gameInfo = STATIC_GAMES.find(g => g.type === type);

  // Sync auth state
  useEffect(() => {
    if (user && pageState === "auth") setPageState("lobby");
  }, [user]);

  // Start countdown when room.status === 'playing'
  useEffect(() => {
    if (room?.status === "playing" && pageState === "waiting" && !countdownStarted.current) {
      countdownStarted.current = true;
      setPageState("countdown");
      setCountdown(3);
      let c = 3;
      const iv = setInterval(() => {
        c -= 1;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(iv);
          setPageState("playing");
        }
      }, 1000);
    }
    if (room?.status === "finished" && pageState === "waiting-result") {
      setPageState("finished");
    }
  }, [room?.status, pageState]);

  // Cleanup listener on unmount
  useEffect(() => () => { unsubRef.current?.(); }, []);

  const subscribeToRoom = useCallback((roomId: string) => {
    unsubRef.current?.();
    unsubRef.current = listenToRoom(roomId, (updatedRoom) => {
      if (!updatedRoom) { setError("Room no longer exists."); setPageState("error"); return; }
      setRoom(updatedRoom);
      if (updatedRoom.status === "finished") setPageState("finished");
    });
  }, []);

  const handleCreate = async () => {
    if (!user) return;
    setError("");
    setPageState("loading");
    try {
      const roomId = await createRoom(gameType, {
        uid: user.uid,
        displayName: user.displayName ?? "Player",
        photoURL: user.photoURL ?? null,
      });
      setRole("host");
      subscribeToRoom(roomId);
      setRoom({ id: roomId, gameType, status: "waiting", seed: 0, host: { uid: user.uid, displayName: user.displayName ?? "Player", photoURL: user.photoURL ?? null }, guest: null, hostResult: null, guestResult: null });
      setPageState("waiting");
    } catch (e) {
      setError(String(e));
      setPageState("lobby");
    }
  };

  const handleJoin = async () => {
    if (!user || !joinCode.trim()) return;
    setError("");
    setPageState("loading");
    try {
      const joined = await joinRoom(joinCode.trim(), {
        uid: user.uid,
        displayName: user.displayName ?? "Player",
        photoURL: user.photoURL ?? null,
      });
      setRole("guest");
      setRoom(joined);
      subscribeToRoom(joined.id);
      countdownStarted.current = false;
      setPageState("waiting");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setPageState("lobby");
    }
  };

  const handleGameComplete = async (score: number, duration: number) => {
    if (!room) return;
    setPageState("waiting-result");
    try {
      await submitMultiplayerResult(room.id, role, score, duration);
    } catch {
      // result will still show via snapshot listener
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(room?.id ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayAgain = () => {
    unsubRef.current?.();
    countdownStarted.current = false;
    setRoom(null);
    setJoinCode("");
    setError("");
    setPageState("lobby");
  };

  // Derived for results
  const hostResult = room?.hostResult ?? null;
  const guestResult = room?.guestResult ?? null;
  const bothDone = !!hostResult && !!guestResult;
  const hostWins = bothDone && (hostResult!.score > guestResult!.score);
  const guestWins = bothDone && (guestResult!.score > hostResult!.score);
  const isTie = bothDone && hostResult!.score === guestResult!.score;
  const iAmHost = role === "host";
  const myResult = iAmHost ? hostResult : guestResult;

  return (
    <>
      <div className="flex-1 bg-zinc-950 flex flex-col text-zinc-100 overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[700px] max-h-[700px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Header */}
        <div className="relative flex-shrink-0 px-4 py-3 flex justify-between items-center z-10">
          <Link href={`/game/${type}`}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-2 font-mono text-xs sm:text-sm tracking-widest text-zinc-500 uppercase">
            <Swords className="w-4 h-4 text-primary" />
            {gameName} · Multiplayer
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 z-0 w-full max-w-4xl mx-auto overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* AUTH */}
            {pageState === "auth" && (
              <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center max-w-sm w-full">
                <Swords className="w-16 h-16 text-primary mx-auto mb-6 opacity-80" />
                <h2 className="text-2xl font-bold mb-3">Sign in to play multiplayer</h2>
                <p className="text-zinc-400 mb-6">You need an account to challenge friends and appear on the leaderboard.</p>
                <Button className="w-full h-12" onClick={() => setAuthOpen(true)}>Sign In / Create Account</Button>
              </motion.div>
            )}

            {/* LOBBY */}
            {pageState === "lobby" && (
              <motion.div key="lobby" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="w-full max-w-md space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 mb-4">
                    <Swords className="w-10 h-10 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{gameName}</h1>
                  <p className="text-zinc-400 text-sm">{gameInfo?.description}</p>
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>
                )}

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Create a Room</span>
                  </div>
                  <p className="text-zinc-400 text-sm">Generate a room code and share it with your opponent. You'll both play the same game.</p>
                  <Button className="w-full h-12 font-bold" onClick={handleCreate}>
                    Create Room
                  </Button>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Swords className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Join a Room</span>
                  </div>
                  <Input
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character code"
                    className="h-12 text-center text-lg font-mono tracking-[0.3em] bg-zinc-900 border-zinc-700 uppercase"
                    maxLength={6}
                    onKeyDown={e => e.key === "Enter" && handleJoin()}
                  />
                  <Button variant="outline" className="w-full h-12 font-bold border-zinc-700 hover:border-primary hover:text-primary" onClick={handleJoin} disabled={joinCode.length < 6}>
                    Join Room
                  </Button>
                </div>
              </motion.div>
            )}

            {/* LOADING */}
            {pageState === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-zinc-400">Setting up room…</p>
              </motion.div>
            )}

            {/* WAITING */}
            {pageState === "waiting" && room && (
              <motion.div key="waiting" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="text-center max-w-sm w-full space-y-6">
                {role === "host" ? (
                  <>
                    <div>
                      <p className="text-zinc-400 text-sm uppercase tracking-widest mb-3">Your Room Code</p>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-5xl font-black tracking-[0.3em] text-white font-mono">{room.id}</span>
                        <Button variant="ghost" size="icon" onClick={handleCopy} className="text-zinc-400 hover:text-white">
                          <Copy className="w-5 h-5" />
                        </Button>
                      </div>
                      {copied && <p className="text-primary text-sm mt-2">Copied!</p>}
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4">
                      <p className="text-zinc-400 text-sm">Share this code with your opponent.</p>
                      <p className="text-zinc-600 text-xs mt-1">The game starts automatically when they join.</p>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-zinc-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Waiting for opponent…</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-3 text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span>Joined! Starting soon…</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* COUNTDOWN */}
            {pageState === "countdown" && (
              <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center">
                <p className="text-zinc-400 text-sm uppercase tracking-widest mb-4">Get Ready!</p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={countdown}
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.4 }}
                    className={`text-9xl font-black ${countdown === 0 ? "text-primary" : "text-white"}`}
                  >
                    {countdown === 0 ? "GO!" : countdown}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}

            {/* PLAYING */}
            {pageState === "playing" && room && (
              <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center">
                {gameType === "memory_match" && <MemoryMatch onComplete={handleGameComplete} seed={room.seed} />}
                {gameType === "number_sequence" && <NumberSequence onComplete={handleGameComplete} seed={room.seed} />}
                {gameType === "word_scramble" && <WordScramble onComplete={handleGameComplete} seed={room.seed} />}
              </motion.div>
            )}

            {/* WAITING FOR RESULT */}
            {pageState === "waiting-result" && room && (
              <motion.div key="waiting-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center max-w-sm w-full space-y-6">
                <Trophy className="w-16 h-16 text-primary mx-auto opacity-80" />
                <div>
                  <p className="text-zinc-400 text-sm uppercase tracking-widest mb-2">Your Score</p>
                  <p className="text-6xl font-black text-white">{myResult?.score.toLocaleString() ?? "—"}</p>
                </div>
                <div className="flex items-center justify-center gap-3 text-zinc-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Waiting for opponent…</span>
                </div>
              </motion.div>
            )}

            {/* FINISHED */}
            {pageState === "finished" && room && room.guest && (
              <motion.div key="finished" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl space-y-6">
                <div className="text-center">
                  <p className="text-zinc-400 text-xs uppercase tracking-widest mb-2">Final Results</p>
                  <h2 className="text-3xl font-black text-white">
                    {isTie ? "It's a Tie! 🤝" : iAmHost ? (hostWins ? "You Win! 🎉" : "You Lost 😔") : (guestWins ? "You Win! 🎉" : "You Lost 😔")}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <PlayerCard
                    player={room.host}
                    label="Host"
                    result={room.hostResult}
                    isWinner={!isTie && hostWins}
                    waiting={!room.hostResult}
                  />
                  <PlayerCard
                    player={room.guest}
                    label="Guest"
                    result={room.guestResult}
                    isWinner={!isTie && guestWins}
                    waiting={!room.guestResult}
                  />
                </div>

                {isTie && (
                  <div className="text-center text-zinc-400 text-sm bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3">
                    Dead even — try again to break the tie!
                  </div>
                )}

                <div className="flex gap-3">
                  <Button className="flex-1 h-12 font-bold" onClick={handlePlayAgain}>Play Again</Button>
                  <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full h-12 border-zinc-700">Home</Button>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ERROR */}
            {pageState === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center max-w-sm w-full space-y-4">
                <p className="text-red-400 text-lg font-semibold">{error || "Something went wrong."}</p>
                <Button onClick={handlePlayAgain}>Try Again</Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
