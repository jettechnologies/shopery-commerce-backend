/*
  Warnings:

  - A unique constraint covering the columns `[session_id]` on the table `UserSession` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserSession_session_id_key" ON "UserSession"("session_id");
