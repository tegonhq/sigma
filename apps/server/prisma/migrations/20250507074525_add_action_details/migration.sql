-- AlterTable
ALTER TABLE "ConversationExecutionStep" ADD COLUMN     "actionId" TEXT,
ADD COLUMN     "actionInput" TEXT,
ADD COLUMN     "actionOutput" TEXT;
