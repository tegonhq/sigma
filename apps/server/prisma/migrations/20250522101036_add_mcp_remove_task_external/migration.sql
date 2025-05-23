/*
  Warnings:

  - The values [TaskExternalLink] on the enum `ModelName` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ModelName_new" AS ENUM ('Activity', 'AgentWorklog', 'Automation', 'Attachment', 'Conversation', 'ConversationHistory', 'IntegrationAccount', 'IntegrationDefinitionV2', 'List', 'Page', 'SyncAction', 'Task', 'TaskOccurrence', 'User', 'Workspace');
ALTER TABLE "SyncAction" ALTER COLUMN "modelName" TYPE "ModelName_new" USING ("modelName"::text::"ModelName_new");
ALTER TYPE "ModelName" RENAME TO "ModelName_old";
ALTER TYPE "ModelName_new" RENAME TO "ModelName";
DROP TYPE "ModelName_old";
COMMIT;

-- AlterTable
ALTER TABLE "Automation" ADD COLUMN     "mcps" TEXT[];
