/*
  Warnings:

  - Added the required column `workspaceId` to the `AgentWorklog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AgentWorklog" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AgentWorklog" ADD CONSTRAINT "AgentWorklog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
