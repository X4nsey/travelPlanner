-- CreateTable
CREATE TABLE "FavoriteCountry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "countrySlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteCountry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FavoriteCountry_userId_idx" ON "FavoriteCountry"("userId");

-- CreateIndex
CREATE INDEX "FavoriteCountry_countrySlug_idx" ON "FavoriteCountry"("countrySlug");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteCountry_userId_countrySlug_key" ON "FavoriteCountry"("userId", "countrySlug");

-- AddForeignKey
ALTER TABLE "FavoriteCountry" ADD CONSTRAINT "FavoriteCountry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
