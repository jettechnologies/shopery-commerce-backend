/*
  Warnings:

  - A unique constraint covering the columns `[cartId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[categoryId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[postId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[commentId]` on the table `ProductComment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reviewId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - The required column `cartId` was added to the `Cart` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `categoryId` was added to the `Category` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `postId` was added to the `Post` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `productId` was added to the `Product` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `commentId` was added to the `ProductComment` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `reviewId` was added to the `Review` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `userId` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "public"."Cart" ADD COLUMN     "cartId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "categoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Post" ADD COLUMN     "postId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "productId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."ProductComment" ADD COLUMN     "commentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Review" ADD COLUMN     "reviewId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cart_cartId_key" ON "public"."Cart"("cartId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_categoryId_key" ON "public"."Category"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_postId_key" ON "public"."Post"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_productId_key" ON "public"."Product"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductComment_commentId_key" ON "public"."ProductComment"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_reviewId_key" ON "public"."Review"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "public"."User"("userId");
