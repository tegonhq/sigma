/*
  Warnings:

  - You are about to drop the `Brief` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Brief" DROP CONSTRAINT "Brief_workspaceId_fkey";

-- DropTable
DROP TABLE "Brief";
