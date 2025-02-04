/*
  Warnings:

  - Added the required column `workspaceId` to the `TaskOccurrence` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaskOccurrence" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferences" JSONB;

-- AddForeignKey
ALTER TABLE "TaskOccurrence" ADD CONSTRAINT "TaskOccurrence_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
