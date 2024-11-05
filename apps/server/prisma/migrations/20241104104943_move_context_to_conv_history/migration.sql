/*
  Warnings:

  - You are about to drop the column `context` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `files` on the `ConversationHistory` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "UserType" ADD VALUE 'System';

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "context";

-- AlterTable
ALTER TABLE "ConversationHistory" DROP COLUMN "files",
ADD COLUMN     "context" JSONB;
