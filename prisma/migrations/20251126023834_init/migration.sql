-- CreateTable
CREATE TABLE "MasterProfile" (
    "id" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "structuredData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOffer" (
    "id" TEXT NOT NULL,
    "masterProfileId" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "title" TEXT,
    "company" TEXT,
    "requiredSkills" TEXT[],
    "analysisResult" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "jobOfferId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'analyzing',
    "chatHistory" JSONB NOT NULL DEFAULT '[]',
    "strategies" JSONB NOT NULL DEFAULT '{}',
    "gapsAddressed" INTEGER NOT NULL DEFAULT 0,
    "totalGaps" INTEGER NOT NULL DEFAULT 3,
    "finalCvLatex" TEXT,
    "finalCoverLatex" TEXT,
    "finalCvPdf" BYTEA,
    "finalCoverPdf" BYTEA,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobOffer" ADD CONSTRAINT "JobOffer_masterProfileId_fkey" FOREIGN KEY ("masterProfileId") REFERENCES "MasterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "JobOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
