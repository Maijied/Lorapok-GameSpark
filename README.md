<div align="center">

<img src="artifacts/brain-games/public/logo.png" alt="Lorapok BrainSpark" width="360" />

# Lorapok BrainSpark v2

**Daily brain training games — solo, competitive, or head-to-head with a friend.**

[![CI](https://github.com/Maijied/Lorapok-GameSpark/actions/workflows/ci.yml/badge.svg)](https://github.com/Maijied/Lorapok-GameSpark/actions/workflows/ci.yml)
[![Deploy](https://github.com/Maijied/Lorapok-GameSpark/actions/workflows/deploy.yml/badge.svg)](https://github.com/Maijied/Lorapok-GameSpark/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-22c55e)](LICENSE)

[**▶ Play Live**](https://maijied.github.io/Lorapok-GameSpark/) &nbsp;·&nbsp; [Lorapok Labs](https://lorapok.github.io) &nbsp;·&nbsp; [Report a Bug](https://github.com/Maijied/Lorapok-GameSpark/issues)

</div>

---

## Overview

Lorapok BrainSpark is a free, open-source daily brain training app built by [Lorapok Labs](https://lorapok.github.io). Three short games challenge your memory, pattern recognition, and vocabulary every day.

**v2** brings difficulty selection, a combo multiplier, letter-tile gameplay, Web Audio sound effects, an XP/level system, eight achievement badges, and real-time multiplayer — all with zero server required on the frontend (Firebase handles auth, scores, and rooms).

---

## What's New in v2

| Feature | Details |
|---|---|
| 🎮 **Memory Match difficulty** | Easy (4×4), Medium (5×4 + 120s timer), Hard (6×4 + 90s timer) |
| ⚡ **Combo multiplier** | Consecutive matches trigger a flash + chord — bonus score |
| 🔢 **Number Sequence timer bar** | Shrinking bar + digit-by-digit reveal + score pop-ups |
| 📖 **Word Scramble tiles** | Click letter tiles instead of typing; Hint & Shuffle buttons |
| 🔊 **Sound system** | Web Audio API tones — flip, match, combo, wrong, victory |
| 🏅 **8 Achievements** | First Step, Daily Hero, On Fire, Memory Master, and more |
| ⚡ **XP / Level system** | 50 XP per game, level up every 500 XP, animated progress bar |
| 🖼️ **Animated logo** | Floating glow animation with purple drop-shadow pulse |
| ⚔️ **Multiplayer** | Real-time 1v1 via Firestore room codes (all 3 games) |

---

## Games

| Game | How to Play | Difficulty Modes |
|---|---|---|
| **Memory Match** | Flip cards to find all matching icon pairs. Fewer flips + combos = higher score. | Easy · Medium · Hard |
| **Number Sequence** | Watch numbers flash, then recall the sequence. Grows each round; 3 lives. | Single mode |
| **Word Scramble** | Click letter tiles to spell the unscrambled word. Use Hint (−30 pts) or Shuffle as needed. | Single mode |

---

## Multiplayer — How It Works

1. Open any game → tap **"Challenge a Friend"**
2. **Create a Room** — a 6-character code is generated (e.g. `XK3P9A`)
3. Share the code; opponent enters it and joins
4. **3-2-1 countdown** syncs both players simultaneously
5. A seeded RNG ensures both players get **the exact same game content**
6. Side-by-side **results** with winner crown and time comparison

> Multiplayer requires signing in. Guest play is available for solo games.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework and build tool |
| TypeScript 5.9 | Full type safety |
| Tailwind CSS v4 | Utility-first styling |
| Framer Motion | Animations, transitions, layout effects |
| Wouter | Lightweight client-side routing |
| TanStack React Query | Server-state caching |
| Firebase JS SDK v10 | Google Auth + Firestore real-time database |
| Web Audio API | Sound effects — zero external dependencies |

### Backend (Replit / self-hosted)

| Technology | Purpose |
|---|---|
| Express 5 | REST API — static game list, daily challenge |
| PostgreSQL + Drizzle ORM | Score persistence (self-hosted mode) |
| pino | Structured JSON logging |
| Zod + Orval | Contract-first API validation |

### Infrastructure

| Technology | Purpose |
|---|---|
| pnpm workspaces | Monorepo package management |
| GitHub Actions | CI (typecheck + build) and CD (GitHub Pages) |
| Firebase | Auth, Firestore, Analytics |

---

## Project Structure

```
Lorapok-GameSpark/
├── artifacts/
│   ├── brain-games/                   # React + Vite frontend (GitHub Pages)
│   │   ├── public/                    # logo.png, favicon, robots.txt
│   │   └── src/
│   │       ├── components/
│   │       │   ├── auth/              # AuthModal — Google + email sign-in
│   │       │   ├── games/
│   │       │   │   ├── MemoryMatch.tsx       # v2: difficulty, combo, timer
│   │       │   │   ├── NumberSequence.tsx    # v2: timer bar, score pops, feedback
│   │       │   │   ├── WordScramble.tsx      # v2: letter tiles, hint, shuffle
│   │       │   │   └── GameResults.tsx       # Post-game score + new-best banner
│   │       │   └── layout/            # Navbar (animated logo), Footer, Layout
│   │       ├── contexts/              # AuthContext — Firebase Auth state
│   │       ├── lib/
│   │       │   ├── firebase.ts        # Firebase app init (lorapok-brainspark)
│   │       │   ├── firestore.ts       # Score submission, leaderboard, player stats
│   │       │   ├── multiplayer.ts     # Room creation, joining, real-time listener
│   │       │   ├── seeded-random.ts   # Xorshift32 RNG for fair multiplayer
│   │       │   ├── sound.ts           # Web Audio API sound effects
│   │       │   └── static-games.ts    # Fallback data for GitHub Pages (no API)
│   │       └── pages/
│   │           ├── Home.tsx           # Dashboard: XP bar, achievements, daily challenge
│   │           ├── GameCanvas.tsx     # Solo game wrapper + "Challenge a Friend"
│   │           ├── MultiplayerCanvas.tsx  # Lobby → countdown → play → results
│   │           └── Scores.tsx         # Leaderboard tabs
│   └── api-server/                    # Express 5 API (Replit deployment)
│       └── src/routes/                # games.ts, scores.ts, health.ts
├── lib/
│   ├── api-spec/openapi.yaml          # OpenAPI contract (source of truth)
│   ├── api-client-react/              # Generated React Query hooks
│   ├── api-zod/                       # Generated Zod schemas
│   └── db/                            # Drizzle ORM schema + client
└── .github/
    └── workflows/
        ├── ci.yml                     # Typecheck + build on every push/PR
        └── deploy.yml                 # Deploy to GitHub Pages on main
```

---

## Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [pnpm 10+](https://pnpm.io/) — `npm install -g pnpm`
- A [Firebase project](https://console.firebase.google.com/) with **Authentication** and **Firestore** enabled
- A [PostgreSQL](https://www.postgresql.org/) database (only needed for the Express API)

### 1. Clone and install

```bash
git clone https://github.com/Maijied/Lorapok-GameSpark.git
cd Lorapok-GameSpark
pnpm install
```

### 2. Configure Firebase

Open `artifacts/brain-games/src/lib/firebase.ts` and replace the config with your own:

```ts
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 3. Set environment variables

```bash
cp .env.example .env
```

```env
DATABASE_URL=postgresql://user:password@localhost:5432/brainspark
SESSION_SECRET=your-random-secret-here
```

### 4. Run locally

```bash
# Terminal 1 — API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend
PORT=18637 BASE_PATH=/ pnpm --filter @workspace/brain-games run dev
```

Open [http://localhost:18637](http://localhost:18637)

---

## Firebase Setup

### Step 1 — Enable Authentication

Firebase Console → **Authentication → Sign-in method**:
- Enable **Google**
- Enable **Email/Password**

### Step 2 — Enable Firestore

Firebase Console → **Firestore Database** → Create database → Production mode

### Step 3 — Security Rules

Firebase Console → **Firestore Database → Rules** → replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Solo scores — anyone can read; only authenticated users can write their own
    match /scores/{scoreId} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.uid == request.auth.uid;
    }

    // Multiplayer rooms — anyone can read; authenticated users create & update
    match /rooms/{roomId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }

  }
}
```

Click **Publish**.

### Step 4 — Composite Indexes

Firestore → **Indexes → Composite** — create two:

| Collection | Field 1 | Field 2 |
|---|---|---|
| `scores` | `uid` ASC | `completedAt` DESC |
| `scores` | `gameType` ASC | `score` DESC |

> Alternatively run the app, click the error links in the browser console — Firebase generates the indexes automatically.

---

## CI/CD

### CI — `ci.yml`
Runs on every push and PR:
1. Install pnpm + Node.js
2. `pnpm install`
3. `pnpm run typecheck:libs` — build composite lib packages
4. `pnpm run typecheck` — full cross-package typecheck
5. Build frontend with `PORT=3000 BASE_PATH=/Lorapok-GameSpark/`

### Deploy — `deploy.yml`
Runs on push to `main`:
1. Build frontend with `BASE_PATH=/Lorapok-GameSpark/`
2. Upload built files to GitHub Pages
3. Deploy to [`maijied.github.io/Lorapok-GameSpark`](https://maijied.github.io/Lorapok-GameSpark/)

**One-time setup:** GitHub repo → **Settings → Pages** → Source: **GitHub Actions**

---

## Gameplay Guide

### Memory Match
- Pick **Easy / Medium / Hard** before starting
- Flip two cards — if they match, they stay face-up
- Match pairs **consecutively** (no failed flip between) to build a **combo** for bonus points
- Medium and Hard have countdown timers — run out and you score 0

**Scoring:** `scoreBase − movePenalty − timePenalty + comboBonus`

| Difficulty | Base Score | Timer |
|---|---|---|
| Easy | 1,000 | None |
| Medium | 1,800 | 120s |
| Hard | 3,000 | 90s |

### Number Sequence
- Watch the digits flash across the screen during the memorize phase
- The **timer bar** shrinks as the memorize window closes
- Type the sequence back exactly and press Enter
- Correct → score pop-up, next round with one more digit
- Wrong → correct answer revealed briefly, one life lost (3 lives total)

**Scoring:** `round × 100` per correct answer

### Word Scramble
- **Click letter tiles** (from the pool) to build your answer
- Click a placed tile to return it to the pool
- **Hint** (−30 pts) — auto-places the next correct letter
- **Shuffle** — re-randomizes the pool order
- Auto-submits when all tiles are placed
- 10 words per game; 3 lives

**Scoring:** `100 pts per word + lives × 50 − seconds ÷ 2`

---

## Achievements

| Achievement | Unlock Condition |
|---|---|
| 🎮 First Step | Play your first game |
| ✅ Daily Hero | Complete all 3 daily games in one day |
| 🔥 On Fire | Reach a 3-day streak |
| ⚡ Speed Demon | Reach a 7-day streak |
| 🧠 Memory Master | Score 800+ in Memory Match |
| 📖 Word Wizard | Score 700+ in Word Scramble |
| 🔢 Number Ninja | Score 500+ in Number Sequence |
| 🏆 Veteran | Play 20+ total games |

---

## XP & Level System

| Stat | Value |
|---|---|
| XP per game | 50 XP |
| XP per level | 500 XP |
| Level formula | `floor(totalGames × 50 / 500) + 1` |

The animated XP bar on the dashboard shows your progress toward the next level.

---

## Development Commands

| Command | Description |
|---|---|
| `pnpm run typecheck` | Full typecheck across all packages |
| `pnpm run typecheck:libs` | Build composite lib packages only |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate React Query hooks from OpenAPI spec |
| `pnpm --filter @workspace/db run push` | Push DB schema to PostgreSQL (dev only) |

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push and open a Pull Request

Please open an issue first for significant changes.

---

## About Lorapok Labs

<div align="center">

**Lorapok Labs** · Bangladesh

*An open ecosystem built for everyone.*

[![GitHub](https://img.shields.io/badge/GitHub-Lorapok-181717?logo=github&logoColor=white)](https://github.com/Lorapok)
[![Twitter](https://img.shields.io/badge/Twitter-@LorapokLabs-1DA1F2?logo=twitter&logoColor=white)](https://twitter.com/LorapokLabs)
[![Website](https://img.shields.io/badge/Website-lorapok.github.io-4285F4?logo=google-chrome&logoColor=white)](https://lorapok.github.io)
[![Email](https://img.shields.io/badge/Email-lorapokdev@gmail.com-EA4335?logo=gmail&logoColor=white)](mailto:lorapokdev@gmail.com)

</div>

---

<div align="center">
  <sub>Built with care by Lorapok Labs · MIT License</sub>
</div>
