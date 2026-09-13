-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateLimit_windowEnd_idx" ON "RateLimit"("windowEnd");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_key_windowEnd_key" ON "RateLimit"("key", "windowEnd");
