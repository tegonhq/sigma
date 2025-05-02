/*
  Warnings:

  - You are about to drop the column `integrationAccountId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `sourceId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_integrationAccountId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "integrationAccountId",
DROP COLUMN "sourceId",
DROP COLUMN "url",
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "sourceExternalLinkId" TEXT,
ADD COLUMN     "tags" TEXT[];

-- CreateTable
CREATE TABLE "TaskExternalLink" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),
    "taskId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "sourceId" TEXT,
    "url" TEXT NOT NULL,
    "integrationAccountId" TEXT NOT NULL,

    CONSTRAINT "TaskExternalLink_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_sourceExternalLinkId_fkey" FOREIGN KEY ("sourceExternalLinkId") REFERENCES "TaskExternalLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskExternalLink" ADD CONSTRAINT "TaskExternalLink_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskExternalLink" ADD CONSTRAINT "TaskExternalLink_integrationAccountId_fkey" FOREIGN KEY ("integrationAccountId") REFERENCES "IntegrationAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
