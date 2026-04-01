/*
  Warnings:

  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sale_price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price_override` on the `ProductVariant` table. All the data in the column will be lost.
  - The `color` column on the `ProductVariant` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `price` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "price",
DROP COLUMN "sale_price",
ADD COLUMN     "max_price" DOUBLE PRECISION,
ADD COLUMN     "min_price" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "price_override",
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "sale_price" DOUBLE PRECISION,
DROP COLUMN "color",
ADD COLUMN     "color" TEXT[];
