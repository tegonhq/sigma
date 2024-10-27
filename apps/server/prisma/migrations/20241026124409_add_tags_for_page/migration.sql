/*
  Warnings:

  - The values [Label] on the enum `ModelName` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Label` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('Daily', 'Default');

-- AlterEnum
BEGIN;
CREATE TYPE "ModelName_new" AS ENUM ('Attachment', 'IntegrationAccount', 'IntegrationDefinitionV2', 'Task', 'SyncAction', 'User', 'Workspace', 'Page', 'Status');
ALTER TABLE "SyncAction" ALTER COLUMN "modelName" TYPE "ModelName_new" USING ("modelName"::text::"ModelName_new");
ALTER TYPE "ModelName" RENAME TO "ModelName_old";
ALTER TYPE "ModelName_new" RENAME TO "ModelName";
DROP TYPE "ModelName_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Label" DROP CONSTRAINT "Label_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Label" DROP CONSTRAINT "Label_workspaceId_fkey";

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "type" "PageType" NOT NULL DEFAULT 'Default';

-- DropTable
DROP TABLE "Label";
