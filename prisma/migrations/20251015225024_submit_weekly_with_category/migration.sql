-- CreateTable
CREATE TABLE "WeeklySubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeeklySubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubmissionTrack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submissionId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "trackId" TEXT,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "artworkUrl" TEXT,
    "source" TEXT,
    "sourceId" TEXT,
    CONSTRAINT "SubmissionTrack_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "WeeklySubmission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklySubmission_userId_weekStart_category_key" ON "WeeklySubmission"("userId", "weekStart", "category");
