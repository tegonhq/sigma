/*
  Warnings:

  - The values [Status] on the enum `ModelName` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `statusId` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the `Status` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ModelName_new" AS ENUM ('Attachment', 'IntegrationAccount', 'IntegrationDefinitionV2', 'Task', 'SyncAction', 'User', 'Workspace', 'Page', 'Conversation', 'ConversationHistory', 'List');
ALTER TABLE "SyncAction" ALTER COLUMN "modelName" TYPE "ModelName_new" USING ("modelName"::text::"ModelName_new");
ALTER TYPE "ModelName" RENAME TO "ModelName_old";
ALTER TYPE "ModelName_new" RENAME TO "ModelName";
DROP TYPE "ModelName_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_statusId_fkey";

-- DropForeignKey
ALTER TABLE "Status" DROP CONSTRAINT "Status_workspaceId_fkey";

-- AlterTable
ALTER TABLE "Page" DROP COLUMN "statusId";

-- DropTable
DROP TABLE "Status";
