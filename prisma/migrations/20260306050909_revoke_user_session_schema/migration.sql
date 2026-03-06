/*
  Warnings:

  - You are about to drop the column `refreshToken` on the `UserSession` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[refreshTokenHash]` on the table `UserSession` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `refreshTokenHash` to the `UserSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revoked` to the `UserSession` table without a default value. This is not possible if the table is not empty.
  - The required column `session_id` was added to the `UserSession` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "UserSession_refreshToken_key";

-- AlterTable
ALTER TABLE "UserSession" DROP COLUMN "refreshToken",
ADD COLUMN     "refreshTokenHash" TEXT NOT NULL,
ADD COLUMN     "revoked" BOOLEAN NOT NULL,
ADD COLUMN     "session_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_refreshTokenHash_key" ON "UserSession"("refreshTokenHash");
