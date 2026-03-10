-- Make userId optional on designs
ALTER TABLE "designs" ALTER COLUMN "userId" DROP NOT NULL;

-- Make userId optional on orders, add guestEmail
ALTER TABLE "orders" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "guestEmail" TEXT;
