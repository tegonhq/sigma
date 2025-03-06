/*
  Warnings:

  - A unique constraint covering the columns `[taskId,pageId]` on the table `TaskOccurrence` will be added. If there are existing duplicate values, this will fail.
  - Made the column `pageId` on table `TaskOccurrence` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "TaskOccurrence" DROP CONSTRAINT "TaskOccurrence_pageId_fkey";

-- DropIndex
DROP INDEX "TaskOccurrence_taskId_startTime_endTime_key";

-- AlterTable
ALTER TABLE "TaskOccurrence" ALTER COLUMN "pageId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TaskOccurrence_taskId_pageId_key" ON "TaskOccurrence"("taskId", "pageId");

-- AddForeignKey
ALTER TABLE "TaskOccurrence" ADD CONSTRAINT "TaskOccurrence_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
