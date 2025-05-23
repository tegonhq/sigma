/*
  Warnings:

  - The values [Notification] on the enum `ModelName` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ModelName_new" AS ENUM ('Activity', 'AgentWorklog', 'Attachment', 'Conversation', 'ConversationHistory', 'IntegrationAccount', 'IntegrationDefinitionV2', 'List', 'Page', 'SyncAction', 'Task', 'TaskOccurrence', 'TaskExternalLink', 'User', 'Workspace');
ALTER TABLE "SyncAction" ALTER COLUMN "modelName" TYPE "ModelName_new" USING ("modelName"::text::"ModelName_new");
ALTER TYPE "ModelName" RENAME TO "ModelName_old";
ALTER TYPE "ModelName_new" RENAME TO "ModelName";
DROP TYPE "ModelName_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_workspaceId_fkey";

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "unread" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Notification";
