/*
  Warnings:

  - The `status` column on the `Cart` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[orderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - The required column `orderId` was added to the `Order` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('active', 'abandoned', 'checked_out', 'expired');

-- DropIndex
DROP INDEX "GuestCart_token_key";

-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "status",
ADD COLUMN     "status" "CartStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "GuestCart" ALTER COLUMN "token" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");
