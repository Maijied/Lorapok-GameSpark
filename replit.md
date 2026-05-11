# MindSpark

A daily brain training app for puzzle enthusiasts — three fully playable games (Memory Match, Number Sequence, Word Scramble) with score tracking, streaks, leaderboard, and daily challenge progress.

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

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/scores.ts` — scores table schema
- `artifacts/api-server/src/routes/games.ts` — games list + daily challenge (static, no DB)
- `artifacts/api-server/src/routes/scores.ts` — score submission, stats, leaderboard
- `artifacts/brain-games/src/pages/` — Home, GameCanvas, Scores pages
- `artifacts/brain-games/src/components/games/` — MemoryMatch, NumberSequence, WordScramble, GameResults

## Architecture decisions

- Games are fully client-side (no backend needed to play) — the server only stores and aggregates scores
- Static game list defined in `routes/games.ts` (no DB table needed for a fixed set of 3 games)
- Daily challenge uses today's date from the server; completion is tracked client-side via submitted scores
- Streak calculation is done in-memory from the scores table on each `/scores/stats` call

## Product

Three daily brain games: Memory Match (card flip pairs), Number Sequence (recall sequences), and Word Scramble (unscramble words). Dashboard shows daily challenge progress, streak, and personal bests. Leaderboard shows top score per game type.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, re-run codegen: `pnpm --filter @workspace/api-spec run codegen`
- After changing `lib/db/src/schema/`, run `pnpm run typecheck:libs` before typechecking api-server
- Games static list is in `artifacts/api-server/src/routes/games.ts` — not a DB table

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
