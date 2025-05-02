/*
  Warnings:

  - Added the required column `conversationHistoryId` to the `ConversationExecutionStep` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ConversationExecutionStep" ADD COLUMN     "conversationHistoryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ConversationExecutionStep" ADD CONSTRAINT "ConversationExecutionStep_conversationHistoryId_fkey" FOREIGN KEY ("conversationHistoryId") REFERENCES "ConversationHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
