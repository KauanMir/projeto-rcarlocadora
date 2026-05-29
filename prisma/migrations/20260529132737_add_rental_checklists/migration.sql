-- CreateEnum
CREATE TYPE "ChecklistType" AS ENUM ('PICKUP', 'RETURN');

-- CreateTable
CREATE TABLE "RentalChecklist" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "type" "ChecklistType" NOT NULL,
    "fuelLevel" TEXT NOT NULL,
    "mileage" INTEGER,
    "notes" TEXT,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentalChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RentalChecklist_rentalId_idx" ON "RentalChecklist"("rentalId");

-- CreateIndex
CREATE UNIQUE INDEX "RentalChecklist_rentalId_type_key" ON "RentalChecklist"("rentalId", "type");

-- AddForeignKey
ALTER TABLE "RentalChecklist" ADD CONSTRAINT "RentalChecklist_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
