-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('FLIGHT_TICKET', 'HOTEL_BOOKING', 'INSURANCE', 'VISA_PASSPORT', 'EXCURSION_TICKET', 'RENTAL_TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('REQUIRED', 'PENDING', 'READY');

-- CreateTable
CREATE TABLE "TripDocument" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL DEFAULT 'OTHER',
    "status" "DocumentStatus" NOT NULL DEFAULT 'READY',
    "provider" TEXT NOT NULL DEFAULT '',
    "referenceCode" TEXT NOT NULL DEFAULT '',
    "eventDate" DATE,
    "endDate" DATE,
    "externalUrl" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "fileName" TEXT,
    "fileMimeType" TEXT,
    "fileSize" INTEGER,
    "fileDataBase64" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TripDocument_tripId_idx" ON "TripDocument"("tripId");

-- CreateIndex
CREATE INDEX "TripDocument_tripId_category_idx" ON "TripDocument"("tripId", "category");

-- CreateIndex
CREATE INDEX "TripDocument_tripId_status_idx" ON "TripDocument"("tripId", "status");

-- AddForeignKey
ALTER TABLE "TripDocument" ADD CONSTRAINT "TripDocument_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
