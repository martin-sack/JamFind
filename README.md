# 🎵 JamFind — Play the Music Game

> A weekly music discovery competition platform where users submit their top 10 tracks, earn XP, climb leaderboards, and compete for recognition.

---

## What Is JamFind?

JamFind is a gamified music platform built around a simple idea: **every week, submit your 10 best tracks and compete**. Users earn XP, build playlists, follow friends, and see their picks climb the charts. It's part music game, part social network, part discovery engine.

---

## Features

### 🎮 Core Game Loop
- **Submit Your 10** — Each week, pick up to 10 tracks across genre categories (Love, Hip-Hop, Party, Late Night, Driving, Chill, etc.)
- **XP System** — Users start with 500 XP and earn/spend it through submissions, votes, and battles
- **Weekly Charts** — Billboard-style Top 100 powered by stream completions and community signals
- **Leaderboard** — Ranked by XP and submission performance
- **Rewards** — Weekly payouts based on chart position and activity (badges, points)

### 🎵 Music
- Stream tracks directly via the built-in audio player
- Import playlists from Spotify, Apple Music, or YouTube links
- Create and manage personal playlists
- Like tracks to save them to your library
- Search the JamFind catalog

### 👥 Social
- Follow other users
- Activity feed showing what friends are doing
- See friends' playlists and submissions
- Creator profiles with stats and badges
- People You May Like discovery

### 🏆 Competition
- Playlist Challenges — themed competitions (e.g. "Best Late Night Drive Playlist")
- Battle mode — head-to-head playlist votes with XP stakes
- Challenge entries, voting, and rankings
- Streak system for consistent weekly submitters

### 📊 Charts & Analytics
- Weekly Top 100 tracks chart with rank delta indicators
- Top Playlist charts
- Global, Ghana, Nigeria, South Africa filters
- Stream event tracking (start, heartbeat, complete)
- Admin analytics dashboard

### 👤 User Accounts
- Email/password authentication
- Profile with bio, avatar, country, social links
- XP balance and history
- Submission history across all weeks
- Badges and creator recognition

### 🔔 Live Features
- Real-time activity ticker (Redis pub/sub)
- Live lounge feed with "Now Playing" updates
- Vote battle broadcasts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | SQLite (dev) via Prisma ORM |
| Auth | NextAuth.js (JWT + Credentials) |
| Styling | Tailwind CSS |
| UI Components | Radix UI |
| State | TanStack React Query + Zustand |
| Charts | Recharts |
| Queue | BullMQ + Redis |
| Storage | AWS S3 + UploadThing |
| Deployment | Vercel |

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/home` | Personalized dashboard for logged-in users |
| `/submit` | Weekly track submission builder |
| `/charts` | Billboard Top 100 weekly chart |
| `/leaderboard` | Global XP leaderboard |
| `/discover` | Music discovery feed |
| `/stream` | Stream Hub — search and play music |
| `/playlists/[id]` | Playlist detail page |
| `/playlists/new` | Create a new playlist |
| `/creator/[id]` | Creator profile page |
| `/rewards` | Your rewards, badges, and points |
| `/login` | Sign in page |
| `/account` | Account settings |
| `/admin` | Admin dashboard |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Redis (for live features and queue)

### Installation

```bash
# Clone the repo
git clone https://github.com/martin-sack/JamFind.git
cd JamFind

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your values

# Set up the database
npx prisma migrate dev

# Seed with demo data (optional)
npm run db:seed

# Start dev server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Redis (for live features)
REDIS_URL="redis://localhost:6379"

# AWS S3 (for audio uploads)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
AWS_S3_BUCKET=""

# Spotify (for playlist import)
SPOTIFY_CLIENT_ID=""
SPOTIFY_CLIENT_SECRET=""
```

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with demo data
npm run db:studio    # Open Prisma Studio
```

---

## Project Structure

```
jamfind-app/
├── app/                    # Next.js App Router pages
│   ├── (app)/              # Authenticated app pages
│   │   ├── charts/         # Weekly charts
│   │   ├── leaderboard/    # XP leaderboard
│   │   ├── rewards/        # User rewards
│   │   └── submit/         # Track submission
│   ├── api/                # API routes
│   ├── home/               # Personalized home
│   ├── stream/             # Stream hub
│   └── ...
├── components/             # Shared components
│   ├── Charts/             # Chart row components
│   ├── layout/             # Header, nav, banners
│   ├── lounge/             # Live lounge widgets
│   ├── player/             # Audio player
│   └── ui/                 # Base UI primitives
├── lib/                    # Utilities and services
│   ├── auth.ts             # NextAuth config
│   ├── db.ts               # Prisma client
│   ├── charts.ts           # Chart ranking logic
│   ├── xp.ts               # XP calculation
│   ├── rewards.ts          # Reward distribution
│   └── ...
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Migration history
└── hooks/                  # Custom React hooks
```

---

## Status

> ⚠️ **Platform Under Development** — Updates and changes will be applied soon.

Currently deployed in demo mode. Full authentication and user features will be enabled once the production database is configured.

---

## License

Private — All rights reserved.
