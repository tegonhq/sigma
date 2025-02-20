/*
  Warnings:

  - The values [Activity] on the enum `ModelName` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ModelName_new" AS ENUM ('Attachment', 'IntegrationAccount', 'IntegrationDefinitionV2', 'Task', 'SyncAction', 'User', 'Workspace', 'Page', 'Status', 'Conversation', 'ConversationHistory', 'List');
ALTER TABLE "SyncAction" ALTER COLUMN "modelName" TYPE "ModelName_new" USING ("modelName"::text::"ModelName_new");
ALTER TYPE "ModelName" RENAME TO "ModelName_old";
ALTER TYPE "ModelName_new" RENAME TO "ModelName";
DROP TYPE "ModelName_old";
COMMIT;
