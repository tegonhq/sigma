/*
  Warnings:

  - You are about to drop the `TaskExternalLink` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TaskExternalLink" DROP CONSTRAINT "TaskExternalLink_integrationAccountId_fkey";

-- DropForeignKey
ALTER TABLE "TaskExternalLink" DROP CONSTRAINT "TaskExternalLink_taskId_fkey";

-- AlterTable
ALTER TABLE "IntegrationAccount" ADD COLUMN     "automationId" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "integrationAccountId" TEXT;

-- DropTable
DROP TABLE "TaskExternalLink";

-- CreateTable
CREATE TABLE "Automation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),
    "text" TEXT NOT NULL,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "integrationAccountIds" TEXT[],

    CONSTRAINT "Automation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_integrationAccountId_fkey" FOREIGN KEY ("integrationAccountId") REFERENCES "IntegrationAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
