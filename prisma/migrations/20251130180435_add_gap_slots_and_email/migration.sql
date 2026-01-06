-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "conversationSummary" TEXT,
ADD COLUMN     "currentGapIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "followUpEmail" JSONB,
ADD COLUMN     "gapSlots" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "taskMemory" JSONB NOT NULL DEFAULT '{}',
ALTER COLUMN "totalGaps" SET DEFAULT 0;
