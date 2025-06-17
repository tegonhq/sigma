/*
  Warnings:

  - You are about to drop the `AIRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AIRequest" DROP CONSTRAINT "AIRequest_workspaceId_fkey";

-- DropTable
DROP TABLE "AIRequest";
