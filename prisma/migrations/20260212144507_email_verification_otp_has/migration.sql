/*
  Warnings:

  - You are about to drop the column `otp` on the `EmailVerification` table. All the data in the column will be lost.
  - Added the required column `otp_hash` to the `EmailVerification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailVerification" DROP COLUMN "otp",
ADD COLUMN     "otp_hash" TEXT NOT NULL;
