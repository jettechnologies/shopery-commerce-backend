/*
  Warnings:

  - You are about to drop the column `otp` on the `PasswordReset` table. All the data in the column will be lost.
  - Added the required column `otp_hash` to the `PasswordReset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PasswordReset"
ADD COLUMN "otp_hash" TEXT;

UPDATE "PasswordReset"
SET "otp_hash" = 'temporary-value';

ALTER TABLE "PasswordReset"
ALTER COLUMN "otp_hash" SET NOT NULL;