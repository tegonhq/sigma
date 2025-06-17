/*
  Warnings:

  - You are about to drop the `Sync` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Sync" DROP CONSTRAINT "Sync_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "Sync" DROP CONSTRAINT "Sync_workspaceId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "invitationCodeId" TEXT;

-- DropTable
DROP TABLE "Sync";

-- CreateTable
CREATE TABLE "InvitationCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvitationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvitationCode_code_key" ON "InvitationCode"("code");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_invitationCodeId_fkey" FOREIGN KEY ("invitationCodeId") REFERENCES "InvitationCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
