-- AlterTable
ALTER TABLE "designs" ADD COLUMN     "finalPrice" DOUBLE PRECISION,
ADD COLUMN     "quantities" JSONB,
ADD COLUMN     "totalPrice" DOUBLE PRECISION,
ADD COLUMN     "tshirtColor" TEXT;
