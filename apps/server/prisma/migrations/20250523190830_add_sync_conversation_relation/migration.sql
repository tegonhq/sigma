/*
  Warnings:

  - You are about to drop the column `date` on the `Sync` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Sync" DROP COLUMN "date",
ADD COLUMN     "conversationId" TEXT,
ADD COLUMN     "syncedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Sync" ADD CONSTRAINT "Sync_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
