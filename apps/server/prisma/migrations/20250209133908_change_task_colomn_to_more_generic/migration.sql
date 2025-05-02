/*
  Warnings:

  - You are about to drop the column `recurrenceText` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "recurrenceText",
ADD COLUMN     "scheduleText" TEXT;
