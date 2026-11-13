-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('BEACH', 'SIGHTSEEING', 'MOUNTAIN', 'BUSINESS', 'WINTER_SPORT', 'WELLNESS_SPA', 'MIXED');

-- CreateEnum
CREATE TYPE "PackingCategory" AS ENUM ('DOCUMENTS', 'CLOTHING', 'FOOTWEAR', 'TECH', 'HYGIENE', 'PERSONAL', 'MEDICINE', 'ACTIVITY', 'OTHER');

-- CreateEnum
CREATE TYPE "PackingItemSource" AS ENUM ('GENERATED', 'CUSTOM');

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN IF NOT EXISTS "tripType" "TripType";

-- CreateTable
CREATE TABLE "PackingList" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "lastGeneratedAt" TIMESTAMP(3),
    "contextSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackingItem" (
    "id" TEXT NOT NULL,
    "packingListId" TEXT NOT NULL,
    "category" "PackingCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER,
    "isPacked" BOOLEAN NOT NULL DEFAULT false,
    "source" "PackingItemSource" NOT NULL DEFAULT 'GENERATED',
    "ruleKey" TEXT,
    "reason" TEXT,
    "isEditedByUser" BOOLEAN NOT NULL DEFAULT false,
    "isOutdated" BOOLEAN NOT NULL DEFAULT false,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackingItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PackingList_tripId_key" ON "PackingList"("tripId");

-- CreateIndex
CREATE INDEX "PackingItem_packingListId_category_idx" ON "PackingItem"("packingListId", "category");

-- CreateIndex
CREATE INDEX "PackingItem_packingListId_isDismissed_idx" ON "PackingItem"("packingListId", "isDismissed");

-- CreateIndex
CREATE UNIQUE INDEX "PackingItem_packingListId_ruleKey_key" ON "PackingItem"("packingListId", "ruleKey");

-- AddForeignKey
ALTER TABLE "PackingList" ADD CONSTRAINT "PackingList_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingItem" ADD CONSTRAINT "PackingItem_packingListId_fkey" FOREIGN KEY ("packingListId") REFERENCES "PackingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
