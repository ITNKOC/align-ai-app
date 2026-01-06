-- Migration: Add authentication and application tracking
-- Handle existing data by creating a default user

-- AlterTable: Add new tracking columns to Application
ALTER TABLE "Application" ADD COLUMN     "applicationNotes" TEXT,
ADD COLUMN     "appliedAt" TIMESTAMP(3),
ADD COLUMN     "appliedVia" TEXT,
ADD COLUMN     "followUpCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "interviewDate" TIMESTAMP(3),
ADD COLUMN     "interviewNotes" TEXT,
ADD COLUMN     "interviewType" TEXT,
ADD COLUMN     "lastFollowUpAt" TIMESTAMP(3),
ADD COLUMN     "nextFollowUpAt" TIMESTAMP(3),
ADD COLUMN     "responseDate" TIMESTAMP(3),
ADD COLUMN     "responseNotes" TEXT,
ADD COLUMN     "salaryOffered" TEXT;

-- AlterTable: Add new columns to JobOffer
ALTER TABLE "JobOffer" ADD COLUMN     "jobUrl" TEXT,
ADD COLUMN     "location" TEXT;

-- CreateTable: User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- Create a default migration user for existing data
-- Password is a bcrypt hash of "migration_user_temp_password"
INSERT INTO "User" ("id", "email", "password", "fullName", "createdAt", "updatedAt")
VALUES (
    'migration_default_user',
    'migration@alignai.local',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.J/XG/PQFIC1F/FO',
    'Utilisateur Migration',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- AlterTable: Add name column with default
ALTER TABLE "MasterProfile" ADD COLUMN "name" TEXT NOT NULL DEFAULT 'Mon CV';

-- AlterTable: Add userId column as nullable first
ALTER TABLE "MasterProfile" ADD COLUMN "userId" TEXT;

-- Update existing MasterProfile records to use the migration user
UPDATE "MasterProfile" SET "userId" = 'migration_default_user' WHERE "userId" IS NULL;

-- Now make userId required
ALTER TABLE "MasterProfile" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Application_jobOfferId_idx" ON "Application"("jobOfferId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "JobOffer_masterProfileId_idx" ON "JobOffer"("masterProfileId");

-- CreateIndex
CREATE INDEX "MasterProfile_userId_idx" ON "MasterProfile"("userId");

-- AddForeignKey
ALTER TABLE "MasterProfile" ADD CONSTRAINT "MasterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
