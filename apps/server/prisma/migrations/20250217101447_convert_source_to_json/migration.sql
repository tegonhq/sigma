/*
  Warnings:

  - You are about to drop the column `sourceExternalLinkId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_sourceExternalLinkId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "sourceExternalLinkId",
ADD COLUMN     "archived" TIMESTAMP(3),
ADD COLUMN     "source" JSONB;
