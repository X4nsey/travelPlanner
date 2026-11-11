-- CreateTable
CREATE TABLE "PhotoRecord" (
    "id" TEXT NOT NULL,
    "countrySlug" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetKey" TEXT NOT NULL,
    "objectName" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "cityName" TEXT,
    "entityType" TEXT NOT NULL DEFAULT 'landmark',
    "url" TEXT NOT NULL,
    "thumbUrl" TEXT NOT NULL,
    "authorName" TEXT NOT NULL DEFAULT 'Wikimedia Commons',
    "authorUrl" TEXT NOT NULL DEFAULT '',
    "sourceName" TEXT NOT NULL DEFAULT 'Wikimedia Commons',
    "sourceUrl" TEXT NOT NULL DEFAULT '',
    "license" TEXT NOT NULL DEFAULT 'CC BY-SA',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "manualOverride" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" TEXT NOT NULL DEFAULT 'verified',
    "verificationNotes" TEXT NOT NULL DEFAULT '',
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PhotoRecord_countrySlug_idx" ON "PhotoRecord"("countrySlug");

-- CreateIndex
CREATE INDEX "PhotoRecord_verificationStatus_idx" ON "PhotoRecord"("verificationStatus");

-- CreateIndex
CREATE INDEX "PhotoRecord_manualOverride_idx" ON "PhotoRecord"("manualOverride");

-- CreateIndex
CREATE UNIQUE INDEX "PhotoRecord_countrySlug_targetType_targetKey_key" ON "PhotoRecord"("countrySlug", "targetType", "targetKey");
