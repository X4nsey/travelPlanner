-- CreateTable
CREATE TABLE "ExchangeRateCache" (
    "baseCurrency" "Currency" NOT NULL,
    "ratesJson" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'cbr',
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRateCache_pkey" PRIMARY KEY ("baseCurrency")
);
