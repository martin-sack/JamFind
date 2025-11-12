# JamFind Africa

A streaming platform that promotes African music and elevates under-recognized artists via community-submitted weekly playlists.

## Features

- **Weekly Playlists**: Users submit exactly 10 tracks per week (Monday-Sunday)
- **Community Rankings**: Transparent ranking algorithm based on frequency, recency, and diversity
- **African Focus**: Dedicated to promoting music from across the African continent and diaspora
- **Anti-Gaming**: Fraud detection and prevention measures
- **Modern UI**: Built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Email/Password + Google OAuth)
- **UI Components**: shadcn/ui + Radix UI
- **File Upload**: UploadThing
- **Queue**: BullMQ + Redis
- **Testing**: Vitest + Playwright

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis (for queue processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jamfind-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/jamfind_africa"

   # NextAuth
   NEXTAUTH_SECRET="your-nextauth-secret-here"
   NEXTAUTH_URL="http://localhost:3000"

   # OAuth Providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Redis
   REDIS_URL="redis://localhost:6379"

   # Storage (UploadThing or S3)
   UPLOADTHING_SECRET="your-uploadthing-secret"
   UPLOADTHING_APP_ID="your-uploadthing-app-id"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses a comprehensive schema including:
- **Users**: Authentication and profile data
- **Artists**: Artist information with verification status
- **Tracks**: Music tracks with metadata
- **Playlists**: Weekly user submissions
- **PlaylistItems**: Individual tracks in playlists
- **SubmissionStats**: Aggregated data for ranking
- **RankingSnapshots**: Weekly ranking results
- **FraudSignals**: Anti-gaming detection
- **AuditLogs**: System activity tracking

## Ranking Algorithm

Weekly rankings are computed using:
- **Frequency Score**: `log(1 + submitterCount)`
- **Recency Weight**: Decay factor for recent submissions
- **Diversity Weight**: Based on unique countries
- **Anti-Gaming**: Penalties for suspicious activity

## Core Flows

1. **Onboarding**: Email/password or Google OAuth with genre/mood preferences
2. **Weekly Submission**: Create 10-track playlist with validation
3. **Search & Discovery**: Global search with filters
4. **Billboard**: Weekly rankings with transparent scoring
5. **Track Upload**: Artist upload with moderation
6. **Admin Dashboard**: Moderation and system management

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run unit tests
- `npm run e2e` - Run E2E tests
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

### Project Structure

```
jamfind-app/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── submit/            # Playlist submission
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # Database client
│   └── utils.ts         # Utility functions
├── prisma/              # Database schema
│   ├── schema.prisma    # Prisma schema
│   └── seed.ts          # Database seed data
└── public/              # Static assets
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue on GitHub
- Join our community Discord
- Email: support@jamfind.africa
