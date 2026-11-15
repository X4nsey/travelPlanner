-- CreateTable
CREATE TABLE "TripWeatherCache" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "resolvedCity" TEXT NOT NULL,
    "resolvedCountry" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "timezone" TEXT NOT NULL,
    "sourceMode" TEXT NOT NULL,
    "climateHint" TEXT NOT NULL,
    "climateLabelRu" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "daily" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripWeatherCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TripWeatherCache_tripId_key" ON "TripWeatherCache"("tripId");

-- CreateIndex
CREATE INDEX "TripWeatherCache_expiresAt_idx" ON "TripWeatherCache"("expiresAt");

-- AddForeignKey
ALTER TABLE "TripWeatherCache" ADD CONSTRAINT "TripWeatherCache_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
