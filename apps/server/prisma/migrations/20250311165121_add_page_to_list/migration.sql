/*
  Warnings:

  - You are about to drop the column `name` on the `List` table. All the data in the column will be lost.
  - Added the required column `pageId` to the `List` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "List_name_workspaceId_key";

-- AlterTable
ALTER TABLE "List" DROP COLUMN "name",
ADD COLUMN     "pageId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
