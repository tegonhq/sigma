/*
  Warnings:

  - You are about to drop the column `conversationId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `sourceId` on the `Activity` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_conversationId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "conversationId",
DROP COLUMN "sourceId";

-- AlterTable
ALTER TABLE "ConversationHistory" ADD COLUMN     "activityId" TEXT;

-- AddForeignKey
ALTER TABLE "ConversationHistory" ADD CONSTRAINT "ConversationHistory_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
