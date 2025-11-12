-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "handle" TEXT,
    "country" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "points" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "profileImage" TEXT,
    "coverImage" TEXT,
    "socialLinks" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "totalTipsReceived" INTEGER NOT NULL DEFAULT 0,
    "totalTipsGiven" INTEGER NOT NULL DEFAULT 0,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "lastSubmissionAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "artists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "aka" TEXT NOT NULL,
    "country" TEXT,
    "socials" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "chartedWeeks" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "album" TEXT,
    "durationSec" INTEGER,
    "isrc" TEXT,
    "audioUrl" TEXT,
    "previewUrl" TEXT,
    "artworkUrl" TEXT,
    "genres" TEXT NOT NULL,
    "moods" TEXT NOT NULL,
    "language" TEXT,
    "country" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "uploadedByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tracks_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tracks_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "playlist_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playlistId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "playlist_items_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "playlists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "playlist_items_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "submission_stats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackId" TEXT NOT NULL,
    "weekStartDate" DATETIME NOT NULL,
    "submitterCount" INTEGER NOT NULL DEFAULT 0,
    "uniqueCountries" INTEGER NOT NULL DEFAULT 0,
    "recencyWeight" REAL NOT NULL DEFAULT 1.0,
    "diversityWeight" REAL NOT NULL DEFAULT 1.0,
    "totalWeightedScore" REAL NOT NULL DEFAULT 0.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "submission_stats_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ranking_snapshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekStartDate" DATETIME NOT NULL,
    "listType" TEXT NOT NULL,
    "payloadJSON" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "fraud_signals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "trackId" TEXT,
    "weekStartDate" DATETIME,
    "reason" TEXT NOT NULL,
    "score" REAL NOT NULL DEFAULT 0.0,
    "metadataJSON" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fraud_signals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fraud_signals_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rewards_payouts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekStart" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadataJSON" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "creator_badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeType" TEXT NOT NULL,
    "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadataJSON" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "creator_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "weekly_challenges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekStart" DATETIME NOT NULL,
    "theme" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "challenge_participants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rank" INTEGER,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "challenge_participants_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "weekly_challenges" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "challenge_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "challenge_participants_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tipping_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "platformFeeCents" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "transactionId" TEXT,
    "metadataJSON" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tipping_transactions_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tipping_transactions_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "playlists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekStartDate" DATETIME NOT NULL,
    "weekEndDate" DATETIME NOT NULL,
    "title" TEXT,
    "moodTags" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredUntil" DATETIME,
    "featuredPriceCents" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "playlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_handle_key" ON "users"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "tracks_isrc_key" ON "tracks"("isrc");

-- CreateIndex
CREATE INDEX "tracks_title_artistId_idx" ON "tracks"("title", "artistId");

-- CreateIndex
CREATE INDEX "tracks_title_idx" ON "tracks"("title");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_items_playlistId_trackId_key" ON "playlist_items"("playlistId", "trackId");

-- CreateIndex
CREATE UNIQUE INDEX "submission_stats_trackId_weekStartDate_key" ON "submission_stats"("trackId", "weekStartDate");

-- CreateIndex
CREATE INDEX "rewards_userId_weekStart_idx" ON "rewards"("userId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "rewards_payouts_weekStart_key" ON "rewards_payouts"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_challenges_weekStart_key" ON "weekly_challenges"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_participants_challengeId_userId_trackId_key" ON "challenge_participants"("challengeId", "userId", "trackId");

-- CreateIndex
CREATE UNIQUE INDEX "playlists_userId_weekStartDate_key" ON "playlists"("userId", "weekStartDate");
