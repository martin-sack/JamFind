-- CreateTable
CREATE TABLE "stream_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "trackId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "msPlayed" INTEGER,
    "device" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "boosts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artistId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "boosts_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "boosts_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
