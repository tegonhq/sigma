/*
  Warnings:

  - You are about to drop the column `dueDate` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "dueDate",
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "recurrence" TEXT[],
ADD COLUMN     "startTime" TIMESTAMP(3);
