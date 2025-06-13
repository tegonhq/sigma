/*
  Warnings:

  - You are about to drop the `Prompt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Summary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Template` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Prompt" DROP CONSTRAINT "Prompt_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "Summary" DROP CONSTRAINT "Summary_taskId_fkey";

-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_workspaceId_fkey";

-- DropTable
DROP TABLE "Prompt";

-- DropTable
DROP TABLE "Summary";

-- DropTable
DROP TABLE "Template";
