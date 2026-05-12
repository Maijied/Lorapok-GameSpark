<div align="center">

<img src="artifacts/brain-games/public/logo.png" alt="Lorapok BrainSpark" width="340" />

# Lorapok BrainSpark

**Daily brain training games — solo or head-to-head with a friend.**

[![CI](https://github.com/Maijied/Lorapok-GameSpark/actions/workflows/ci.yml/badge.svg)](https://github.com/Maijied/Lorapok-GameSpark/actions/workflows/ci.yml)
[![Deploy](https://github.com/Maijied/Lorapok-GameSpark/actions/workflows/deploy.yml/badge.svg)](https://github.com/Maijied/Lorapok-GameSpark/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-22c55e)](LICENSE)

[**▶ Play Live**](https://maijied.github.io/Lorapok-GameSpark/) &nbsp;·&nbsp; [Lorapok Labs](https://lorapok.github.io) &nbsp;·&nbsp; [@LorapokLabs](https://twitter.com/LorapokLabs)

</div>

---

## Overview

Lorapok BrainSpark is a free, open-source daily brain training app built by [Lorapok Labs](https://lorapok.github.io). Three short daily games challenge your memory, pattern recognition, and vocabulary every day.

Sign in with Google or email to save scores, track streaks, and compete on a shared global leaderboard — or challenge a friend to a real-time head-to-head match where both of you play the exact same game simultaneously.

---

## Games

| Game | How to Play | Difficulty |
|------|-------------|------------|
| **Memory Match** | Flip cards on a 4×4 grid to find all matching icon pairs. Fewer flips = higher score. | Easy |
| **Number Sequence** | Watch a sequence of numbers flash on screen, then type it back from memory. Sequences grow each round. 3 lives. | Medium |
| **Word Scramble** | Unscramble 10 words against the clock. Bonus points for lives remaining; time deducted from score. | Medium |

---

## Features

- **3 fully playable games** — all game logic runs client-side
- **⚔️ Real-time Multiplayer** — challenge a friend with a 6-character room code; seeded RNG ensures both players get identical game content for a fair race
- **Firebase Authentication** — sign in with Google or email/password
- **Firestore leaderboard** — top scores per game type, shared across all players in real time
- **Personal stats dashboard** — streak tracking, daily challenge progress, personal bests
- **Daily challenge** — complete all 3 games each day to keep your streak alive
- **Responsive design** — works on mobile and desktop
- **GitHub Pages deployment** — static frontend with full Firebase backend, no server required

---

## Multiplayer — How It Works

1. Open any game and tap **"Challenge a Friend"**
2. **Create a Room** — a 6-character code is generated (e.g. `XK3P9A`)
3. Share the code with your opponent — they enter it on their device and tap **"Join Room"**
4. A **3-2-1 countdown** syncs both players, then the game starts simultaneously
5. Both players see the **same game** — same card layout, same number sequences, same words — thanks to a seeded random number generator stored in the room document
6. When both finish, a **side-by-side results screen** shows scores, times, and the winner

> Multiplayer requires signing in. Guest play is available for solo games.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework and build tool |
| TypeScript 5.9 | Type safety across the entire codebase |
| Tailwind CSS v4 | Utility-first styling |
| Framer Motion | Animations and transitions |
| Wouter | Lightweight client-side routing |
| TanStack React Query | Server state and cache management |
| Firebase JS SDK v10 | Authentication + Firestore real-time database |

### Backend (Replit / self-hosted)

| Technology | Purpose |
|---|---|
| Express 5 | REST API for static game list and daily challenge |
| PostgreSQL + Drizzle ORM | Score persistence (self-hosted mode) |
| pino | Structured JSON logging |
| Zod + Orval | OpenAPI contract-first request validation |

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
│   ├── brain-games/                  # React + Vite frontend
│   │   ├── public/                   # logo.png, favicon, robots.txt
│   │   └── src/
│   │       ├── components/
│   │       │   ├── auth/             # AuthModal — Google + email sign-in
│   │       │   ├── games/            # MemoryMatch, NumberSequence, WordScramble, GameResults
│   │       │   ├── layout/           # Navbar, Footer, Layout
│   │       │   └── ui/               # Shadcn/ui component library
│   │       ├── contexts/             # AuthContext — Firebase Auth state
│   │       ├── lib/
│   │       │   ├── firebase.ts       # Firebase app init
│   │       │   ├── firestore.ts      # Solo score operations
│   │       │   ├── multiplayer.ts    # Room creation, joining, real-time listener
│   │       │   ├── seeded-random.ts  # Deterministic RNG for fair multiplayer
│   │       │   └── static-games.ts   # Fallback game data for GitHub Pages
│   │       └── pages/
│   │           ├── Home.tsx          # Dashboard — daily challenge, stats
│   │           ├── GameCanvas.tsx    # Solo game wrapper
│   │           ├── MultiplayerCanvas.tsx  # Multiplayer lobby + game + results
│   │           └── Scores.tsx        # Leaderboard tabs
│   └── api-server/                   # Express 5 API (Replit deployment)
│       └── src/routes/               # games.ts, scores.ts, health.ts
├── lib/
│   ├── api-spec/openapi.yaml         # OpenAPI contract (source of truth)
│   ├── api-client-react/             # Generated React Query hooks
│   ├── api-zod/                      # Generated Zod schemas
│   └── db/                           # Drizzle ORM schema + client
└── .github/
    └── workflows/
        ├── ci.yml                    # Typecheck + build on every push/PR
        └── deploy.yml                # Deploy frontend to GitHub Pages on main
```

---

## Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [pnpm 10+](https://pnpm.io/) — `npm install -g pnpm`
- A [Firebase project](https://console.firebase.google.com/) with **Authentication** and **Firestore** enabled
- A [PostgreSQL](https://www.postgresql.org/) database (only needed for the Express API in self-hosted mode)

### 1. Clone and install

```bash
git clone https://github.com/Maijied/Lorapok-GameSpark.git
cd Lorapok-GameSpark
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Required — PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/brainspark

# Required — Express session secret (any long random string)
SESSION_SECRET=your-random-secret-here
```

### 3. Configure Firebase

Open `artifacts/brain-games/src/lib/firebase.ts` and replace the config object with your own project's credentials from the Firebase Console:

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

### 4. Run locally

```bash
# Terminal 1 — API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend (port 18637)
PORT=18637 BASE_PATH=/ pnpm --filter @workspace/brain-games run dev
```

Open [http://localhost:18637](http://localhost:18637) in your browser.

---

## Firebase Setup

### Step 1 — Enable Authentication

In the [Firebase Console](https://console.firebase.google.com/):

1. Go to **Authentication → Sign-in method**
2. Enable **Google**
3. Enable **Email/Password**

### Step 2 — Enable Firestore

1. Go to **Firestore Database**
2. Click **Create database** → choose **Production mode**
3. Select your preferred region

### Step 3 — Security Rules

Go to **Firestore Database → Rules** and replace the content with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Solo scores — anyone can read; only authenticated users can write their own score
    match /scores/{scoreId} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.uid == request.auth.uid;
    }

    // Multiplayer rooms — anyone can read; authenticated users can create and update
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

Firestore needs composite indexes for the leaderboard and personal score queries. Go to **Firestore Database → Indexes → Composite** and create:

| Collection | Fields | Order |
|---|---|---|
| `scores` | `uid` | Ascending |
| | `completedAt` | Descending |
| `scores` | `gameType` | Ascending |
| | `score` | Descending |

> Alternatively, run the app and click the error links in the browser console — Firebase will offer direct links to create each index automatically.

---

## CI/CD

Every push to `main` triggers two GitHub Actions pipelines:

### CI — `ci.yml`
Runs on every push and pull request:
1. Install pnpm + Node.js
2. Install dependencies
3. Build TypeScript libs
4. Typecheck API server
5. Typecheck and build frontend

### Deploy — `deploy.yml`
Runs on push to `main`:
1. Build frontend with `BASE_PATH=/Lorapok-GameSpark/`
2. Upload built files to GitHub Pages
3. Deploy automatically to [`maijied.github.io/Lorapok-GameSpark`](https://maijied.github.io/Lorapok-GameSpark/)

**One-time setup:** In your GitHub repo → **Settings → Pages** → set Source to **GitHub Actions**.

> The Express API is not deployed to GitHub Pages (it's a static host). Firebase handles auth and scores client-side, so all features — including multiplayer — work fully on GitHub Pages.

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

Contributions, bug reports, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push and open a Pull Request

Please open an issue first for significant changes so we can discuss the approach.

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
