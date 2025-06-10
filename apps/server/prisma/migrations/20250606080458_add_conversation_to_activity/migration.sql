/*
  Warnings:

  - You are about to drop the column `activityId` on the `Conversation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_activityId_fkey";

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "conversationId" TEXT;

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "activityId";

-- AlterTable
ALTER TABLE "TaskOccurrence" ADD COLUMN     "metadata" JSONB DEFAULT '{}';

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
