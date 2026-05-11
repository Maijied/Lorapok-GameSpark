<div align="center">

<img src="artifacts/brain-games/public/logo.png" alt="Lorapok BrainSpark" width="320" />

# Lorapok BrainSpark

**Daily brain training games to sharpen memory, concentration, and pattern recognition.**

[![CI](https://github.com/Maijied/Lorapok-GameSpark/actions/workflows/ci.yml/badge.svg)](https://github.com/Maijied/Lorapok-GameSpark/actions/workflows/ci.yml)
[![Deploy](https://github.com/Maijied/Lorapok-GameSpark/actions/workflows/deploy.yml/badge.svg)](https://github.com/Maijied/Lorapok-GameSpark/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[**Play Live →**](https://maijied.github.io/Lorapok-GameSpark/) &nbsp;·&nbsp; [Lorapok Labs](https://lorapok.github.io) &nbsp;·&nbsp; [@LorapokLabs](https://twitter.com/LorapokLabs)

</div>

---

## What is BrainSpark?

BrainSpark is a free, open-source daily brain training app built by [Lorapok Labs](https://lorapok.github.io) — *An open ecosystem built for everyone.* Three short, focused games challenge your memory and concentration every day. Sign in with Google or email to track your streak, save scores, and compete on a shared global leaderboard powered by Firebase.

---

## Games

| Game | Description | Difficulty |
|---|---|---|
| **Memory Match** | Flip cards on a 4×4 grid to find matching icon pairs. Fewer attempts = higher score. | Easy |
| **Number Sequence** | Watch a sequence of numbers flash on screen, then recall it in order. Sequences grow longer each round. 3 lives. | Medium |
| **Word Scramble** | Unscramble 10 words against the clock. Points are awarded for speed and accuracy. 3 lives. | Medium |

---

## Features

- **3 fully playable games** — all client-side, no backend required to play
- **Firebase Authentication** — sign in with Google or email/password
- **Firestore leaderboard** — real-time shared rankings across all players
- **Personal stats** — streak tracking, best scores, daily goal progress
- **Daily challenge** — complete all 3 games each day to keep your streak alive
- **Lorapok branding** — dark indigo theme, smooth framer-motion animations
- **Responsive** — works on desktop and mobile

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework and build tool |
| TypeScript 5.9 | Static typing |
| Tailwind CSS v4 | Styling |
| Framer Motion | Animations and transitions |
| Wouter | Client-side routing |
| TanStack React Query | Server state management |
| Firebase JS SDK | Auth + Firestore |

### Backend (Replit / self-hosted)
| Technology | Purpose |
|---|---|
| Express 5 | API server |
| PostgreSQL + Drizzle ORM | Score persistence (server mode) |
| pino | Structured logging |
| Zod + Orval | OpenAPI contract-first validation |

### Infrastructure
| Technology | Purpose |
|---|---|
| pnpm workspaces | Monorepo package management |
| GitHub Actions | CI (typecheck + build) and CD (GitHub Pages deploy) |
| Firebase | Auth, Firestore database, Analytics |

---

## Project Structure

```
Lorapok-GameSpark/
├── artifacts/
│   ├── brain-games/          # React + Vite frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── auth/     # AuthModal (Google + email sign-in)
│   │   │   │   ├── games/    # MemoryMatch, NumberSequence, WordScramble, GameResults
│   │   │   │   ├── layout/   # Navbar, Footer, Layout
│   │   │   │   └── ui/       # Shadcn/ui component library
│   │   │   ├── contexts/     # AuthContext (Firebase Auth state)
│   │   │   ├── lib/          # firebase.ts, firestore.ts, static-games.ts
│   │   │   └── pages/        # Home, GameCanvas, Scores
│   │   └── public/           # logo.png, favicon
│   └── api-server/           # Express 5 API (Replit deployment)
│       └── src/
│           └── routes/       # games.ts, scores.ts, health.ts
├── lib/
│   ├── api-spec/             # openapi.yaml (source of truth)
│   ├── api-client-react/     # Generated React Query hooks
│   ├── api-zod/              # Generated Zod schemas
│   └── db/                   # Drizzle ORM schema + client
└── .github/
    └── workflows/
        ├── ci.yml            # Typecheck + build on every PR
        └── deploy.yml        # Deploy frontend to GitHub Pages on main
```

---

## Getting Started

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- [pnpm 10+](https://pnpm.io/)
- A [Firebase project](https://console.firebase.google.com/) with **Authentication** and **Firestore** enabled
- A [PostgreSQL](https://www.postgresql.org/) database (for the API server in Replit mode)

### Installation

```bash
# Clone the repo
git clone https://github.com/Maijied/Lorapok-GameSpark.git
cd Lorapok-GameSpark

# Install dependencies
pnpm install

# Set required environment variables
cp .env.example .env
# Fill in DATABASE_URL and SESSION_SECRET
```

### Running Locally

```bash
# Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start the frontend (port 18637) in another terminal
PORT=18637 BASE_PATH=/ pnpm --filter @workspace/brain-games run dev
```

Open [http://localhost:18637](http://localhost:18637) in your browser.

### Building for Production

```bash
# Typecheck everything
pnpm run typecheck

# Build the frontend (for GitHub Pages)
PORT=3000 BASE_PATH=/Lorapok-GameSpark/ pnpm --filter @workspace/brain-games run build
# Output: artifacts/brain-games/dist/public/
```

---

## Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable **Authentication** → Sign-in providers: **Google** + **Email/Password**
3. Enable **Firestore Database** in production mode
4. Set Firestore **Security Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scores/{scoreId} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.uid == request.auth.uid;
    }
  }
}
```

5. Create two **composite indexes** in Firestore → Indexes:
   - Collection: `scores` | Fields: `uid` (Asc) → `completedAt` (Desc)
   - Collection: `scores` | Fields: `gameType` (Asc) → `score` (Desc)

---

## CI/CD

Every push to `main` triggers two GitHub Actions workflows:

### CI — `ci.yml`
Runs on every push and pull request:
- Installs pnpm and dependencies
- Builds TypeScript libs
- Typechecks the full monorepo
- Builds the frontend

### Deploy — `deploy.yml`
Runs on push to `main` only:
- Builds the frontend with the correct GitHub Pages base path
- Deploys to [GitHub Pages](https://maijied.github.io/Lorapok-GameSpark/) automatically

> **Note:** Only the frontend is deployed to GitHub Pages. Firebase handles auth and scores on the client side, so all core features work. The Express API (daily challenge endpoint) is used when self-hosting on Replit.

---

## Development Commands

| Command | Description |
|---|---|
| `pnpm run typecheck` | Full typecheck across all packages |
| `pnpm run typecheck:libs` | Build composite lib packages only |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks from OpenAPI spec |
| `pnpm --filter @workspace/db run push` | Push DB schema changes (dev only) |

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## About Lorapok Labs

<div align="center">

**Lorapok Labs** · Bangladesh

*An open ecosystem built for everyone.*

[![GitHub](https://img.shields.io/badge/GitHub-Lorapok-181717?logo=github)](https://github.com/Lorapok)
[![Twitter](https://img.shields.io/badge/Twitter-@LorapokLabs-1DA1F2?logo=twitter)](https://twitter.com/LorapokLabs)
[![Website](https://img.shields.io/badge/Website-lorapok.github.io-4285F4?logo=google-chrome&logoColor=white)](https://lorapok.github.io)
[![Email](https://img.shields.io/badge/Email-lorapokdev@gmail.com-EA4335?logo=gmail)](mailto:lorapokdev@gmail.com)

</div>

---

<div align="center">
  <sub>Built with care by Lorapok Labs · MIT License</sub>
</div>
