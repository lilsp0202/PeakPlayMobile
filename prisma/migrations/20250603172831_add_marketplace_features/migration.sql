-- CreateTable
CREATE TABLE "SpecializedCoach" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coachId" TEXT NOT NULL,
    "sport" TEXT NOT NULL DEFAULT 'CRICKET',
    "specialization" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "hourlyRate" DECIMAL NOT NULL,
    "availability" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "rating" DECIMAL,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SpecializedCoach_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoachingBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalAmount" DECIMAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CoachingBooking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CoachingBooking_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "SpecializedCoach" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoachReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CoachReview_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CoachReview_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "SpecializedCoach" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SpecializedCoach_coachId_key" ON "SpecializedCoach"("coachId");

-- CreateIndex
CREATE INDEX "CoachingBooking_studentId_idx" ON "CoachingBooking"("studentId");

-- CreateIndex
CREATE INDEX "CoachingBooking_coachId_idx" ON "CoachingBooking"("coachId");

-- CreateIndex
CREATE INDEX "CoachReview_studentId_idx" ON "CoachReview"("studentId");

-- CreateIndex
CREATE INDEX "CoachReview_coachId_idx" ON "CoachReview"("coachId"); 