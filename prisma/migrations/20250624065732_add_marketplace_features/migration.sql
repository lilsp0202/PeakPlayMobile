/*
  Warnings:

  - You are about to drop the column `studentId` on the `CoachReview` table. All the data in the column will be lost.
  - You are about to alter the column `rating` on the `CoachReview` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to drop the column `date` on the `CoachingBooking` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `CoachingBooking` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `CoachingBooking` table. All the data in the column will be lost.
  - You are about to drop the column `coachId` on the `SpecializedCoach` table. All the data in the column will be lost.
  - You are about to drop the column `hourlyRate` on the `SpecializedCoach` table. All the data in the column will be lost.
  - You are about to drop the column `specialization` on the `SpecializedCoach` table. All the data in the column will be lost.
  - You are about to drop the column `totalReviews` on the `SpecializedCoach` table. All the data in the column will be lost.
  - You are about to alter the column `rating` on the `SpecializedCoach` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Float`.
  - Added the required column `athleteId` to the `CoachReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `CoachReview` table without a default value. This is not possible if the table is not empty.
  - Made the column `comment` on table `CoachReview` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `athleteId` to the `CoachingBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `CoachingBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionType` to the `CoachingBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `CoachingBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `SpecializedCoach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `SpecializedCoach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `SpecializedCoach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerHour` to the `SpecializedCoach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specialties` to the `SpecializedCoach` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SessionTodo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coachId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sessionDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SessionTodo_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionTodoItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "todoId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SessionTodoItem_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "SessionTodo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionTodoStudent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "todoId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    CONSTRAINT "SessionTodoStudent_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "SessionTodo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionTodoStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CoachReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "bookingId" TEXT,
    "rating" REAL NOT NULL,
    "title" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CoachReview_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CoachReview_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "SpecializedCoach" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CoachReview" ("coachId", "comment", "createdAt", "id", "rating", "updatedAt") SELECT "coachId", "comment", "createdAt", "id", "rating", "updatedAt" FROM "CoachReview";
DROP TABLE "CoachReview";
ALTER TABLE "new_CoachReview" RENAME TO "CoachReview";
CREATE TABLE "new_CoachingBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" DATETIME,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "price" REAL NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "meetingLink" TEXT,
    "location" TEXT,
    "performanceClips" TEXT,
    "feedback" TEXT,
    "rating" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CoachingBooking_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CoachingBooking_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "SpecializedCoach" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CoachingBooking" ("coachId", "createdAt", "duration", "id", "notes", "status", "updatedAt") SELECT "coachId", "createdAt", "duration", "id", "notes", "status", "updatedAt" FROM "CoachingBooking";
DROP TABLE "CoachingBooking";
ALTER TABLE "new_CoachingBooking" RENAME TO "CoachingBooking";
CREATE TABLE "new_SpecializedCoach" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "specialties" TEXT NOT NULL,
    "sport" TEXT NOT NULL DEFAULT 'CRICKET',
    "location" TEXT NOT NULL,
    "avatar" TEXT,
    "experience" INTEGER NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "pricePerHour" REAL NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "videoCallRate" REAL,
    "inPersonRate" REAL,
    "asyncFeedbackRate" REAL,
    "certifications" TEXT,
    "socialLinks" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "availability" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SpecializedCoach" ("availability", "bio", "createdAt", "experience", "id", "rating", "sport", "updatedAt") SELECT "availability", "bio", "createdAt", "experience", "id", coalesce("rating", 0) AS "rating", "sport", "updatedAt" FROM "SpecializedCoach";
DROP TABLE "SpecializedCoach";
ALTER TABLE "new_SpecializedCoach" RENAME TO "SpecializedCoach";
CREATE UNIQUE INDEX "SpecializedCoach_email_key" ON "SpecializedCoach"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
