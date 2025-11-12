-- CreateTable
CREATE TABLE "UserPlaylist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserPlaylist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPlaylistTrack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playlistId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "trackId" TEXT,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "artworkUrl" TEXT,
    CONSTRAINT "UserPlaylistTrack_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "UserPlaylist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrackLike" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrackLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "handle" TEXT,
    "country" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "points" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 500,
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
INSERT INTO "new_users" ("bio", "country", "coverImage", "createdAt", "email", "handle", "id", "isVerified", "lastSubmissionAt", "name", "passwordHash", "points", "profileImage", "role", "socialLinks", "streakCount", "totalTipsGiven", "totalTipsReceived", "updatedAt") SELECT "bio", "country", "coverImage", "createdAt", "email", "handle", "id", "isVerified", "lastSubmissionAt", "name", "passwordHash", "points", "profileImage", "role", "socialLinks", "streakCount", "totalTipsGiven", "totalTipsReceived", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_handle_key" ON "users"("handle");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TrackLike_userId_trackId_key" ON "TrackLike"("userId", "trackId");
