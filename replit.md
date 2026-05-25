# MindSpark / Lorapok BrainSpark v2

A daily brain training app for puzzle enthusiasts — three fully playable games (Memory Match, Number Sequence, Word Scramble) with difficulty modes, combo mechanics, sound effects, XP/level system, achievement badges, score tracking, streaks, leaderboard, and real-time multiplayer.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/brain-games run dev` — run the frontend (port 18637)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + framer-motion + wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Auth + Scores: Firebase (lorapok-brainspark project)
- Sound: Web Audio API (lib/sound.ts — zero dependencies)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/scores.ts` — scores table schema
- `artifacts/api-server/src/routes/games.ts` — games list + daily challenge (static, no DB)
- `artifacts/api-server/src/routes/scores.ts` — score submission, stats, leaderboard
- `artifacts/brain-games/src/pages/` — Home, GameCanvas, MultiplayerCanvas, Scores pages
- `artifacts/brain-games/src/components/games/` — MemoryMatch, NumberSequence, WordScramble, GameResults
- `artifacts/brain-games/src/lib/sound.ts` — Web Audio API sound system
- `artifacts/brain-games/src/lib/multiplayer.ts` — Firestore room operations
- `artifacts/brain-games/src/lib/seeded-random.ts` — deterministic RNG for fair multiplayer
- `artifacts/brain-games/src/lib/firebase.ts` — Firebase app init (project: lorapok-brainspark)
- `artifacts/brain-games/src/lib/firestore.ts` — score submission + player stats + leaderboard
- `artifacts/brain-games/src/lib/static-games.ts` — fallback game data for GitHub Pages

## Architecture decisions

- Games are fully client-side (no backend needed to play) — the server only stores and aggregates scores
- Static game list defined in `routes/games.ts` (no DB table needed for a fixed set of 3 games)
- Daily challenge uses today's date from the server; completion is tracked client-side via submitted scores
- Streak calculation is done in-memory from the scores table on each `/scores/stats` call
- Sound system uses raw Web Audio API oscillators — no external audio files or libraries
- XP/level system and achievements are computed purely from Firestore stats on the client — no separate Firestore writes needed

## Game mechanics (v2)

### Memory Match
- Difficulty selector: Easy (4×4, 8 pairs, no timer), Medium (5×4, 10 pairs, 120s), Hard (6×4, 12 pairs, 90s)
- Combo multiplier: consecutive correct matches trigger combo bonus + escalating chord sound
- Scoring: `scoreBase − movePenalty − timePenalty + comboBonus`
- 12 icons total (Brain, Star, Zap, Heart, Moon, Sun, Flame, Leaf, Sparkles, Crown, Rocket, Shield)
- In multiplayer mode: difficulty selector skipped, Easy used with seeded RNG

### Number Sequence
- Visual timer bar shrinks during memorize phase; turns yellow/red near end
- Digit-by-digit staggered reveal animation
- Score pop-ups (+N) float upward on correct answers
- Wrong answer reveals the correct sequence for 1.4s
- Scoring: `round × 100` per correct answer

### Word Scramble
- Letter tile UI: click to place, click placed tile to return, auto-submits when full
- Hint button: finds the next needed letter in pool, places it automatically (−30 pts)
- Shuffle button: randomizes pool order
- Answer row shakes red on wrong, glows green on correct
- Scoring: `100 per word + lives × 50 − seconds ÷ 2`

## XP & Achievements

- XP: 50 per game played, level up every 500 XP
- 8 achievements: First Step, Daily Hero, On Fire, Speed Demon, Memory Master, Word Wizard, Number Ninja, Veteran
- All computed from PlayerStats — no extra Firestore writes

## Multiplayer

- Firestore `rooms` collection: 6-char room codes, seeded RNG seed stored in room
- Flow: createRoom → share code → joinRoom → countdown → play → submitMultiplayerResult → listenToRoom → results
- Both players get identical game via seededShuffle/seededSequence from the same seed
- Requires Firebase auth (Google or email/password)

## GitHub / Deployment

- Repo: https://github.com/Maijied/Lorapok-GameSpark
- GitHub Pages: https://maijied.github.io/Lorapok-GameSpark/
- CI: typecheck + build on every push
- CD: deploy to GitHub Pages on main
- Base path: `/Lorapok-GameSpark/` — Vite requires `PORT` and `BASE_PATH` env vars

## Firestore Security Rules (apply in Firebase Console)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scores/{scoreId} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.uid == request.auth.uid;
    }
    match /rooms/{roomId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
  }
}
```

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, re-run codegen: `pnpm --filter @workspace/api-spec run codegen`
- After changing `lib/db/src/schema/`, run `pnpm run typecheck:libs` before typechecking api-server
- Games static list is in `artifacts/api-server/src/routes/games.ts` — not a DB table
- Daily challenge API route is `/api/games/daily` (not `/api/daily-challenge`)
- Sound system requires a user gesture to initialise AudioContext (browser policy) — first click triggers it
- MemoryMatch: when `seed` prop is provided (multiplayer), difficulty selector is skipped and Easy is used

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Push to GitHub via Node script using GITHUB_PERSONAL_ACCESS_TOKEN (git commands blocked in main agent)
