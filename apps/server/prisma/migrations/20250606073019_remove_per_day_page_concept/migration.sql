/*
  Warnings:

  - You are about to drop the column `pageId` on the `TaskOccurrence` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TaskOccurrence" DROP CONSTRAINT "TaskOccurrence_pageId_fkey";

-- DropIndex
DROP INDEX "TaskOccurrence_taskId_pageId_key";

-- AlterTable
ALTER TABLE "TaskOccurrence" DROP COLUMN "pageId";
