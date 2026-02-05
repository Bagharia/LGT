-- CreateTable
CREATE TABLE "order_designs" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "designId" INTEGER NOT NULL,
    "quantities" JSONB NOT NULL,
    "finalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_designs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order_designs" ADD CONSTRAINT "order_designs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_designs" ADD CONSTRAINT "order_designs_designId_fkey" FOREIGN KEY ("designId") REFERENCES "designs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
