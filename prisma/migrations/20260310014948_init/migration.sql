-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "documentType" TEXT,
    "originalText" TEXT NOT NULL,
    "summary" TEXT,
    "analysisMeta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WritingElement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "dependencies" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "completionCriteria" TEXT NOT NULL,
    "exampleOutput" TEXT NOT NULL,
    "badExample" TEXT,
    "hint" TEXT,
    "whyNeeded" TEXT,
    "userOutput" TEXT,
    "feedback" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WritingElement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "elementId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "aiFeedback" TEXT NOT NULL,
    "completionScore" INTEGER NOT NULL,
    "isPassed" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSubmission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserSubmission_elementId_fkey" FOREIGN KEY ("elementId") REFERENCES "WritingElement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgressStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "totalElements" INTEGER NOT NULL,
    "completedElements" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "lastWorkedAt" DATETIME,
    CONSTRAINT "ProgressStats_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "WritingElement_projectId_orderIndex_idx" ON "WritingElement"("projectId", "orderIndex");

-- CreateIndex
CREATE INDEX "UserSubmission_projectId_createdAt_idx" ON "UserSubmission"("projectId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProgressStats_projectId_key" ON "ProgressStats"("projectId");
