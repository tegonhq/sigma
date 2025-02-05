/*
  Warnings:

  - A unique constraint covering the columns `[name,workspaceId]` on the table `List` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "List" ADD COLUMN     "workspaceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "List_name_workspaceId_key" ON "List"("name", "workspaceId");

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
