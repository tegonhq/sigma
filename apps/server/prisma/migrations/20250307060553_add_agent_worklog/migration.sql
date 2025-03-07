-- AlterEnum
ALTER TYPE "ModelName" ADD VALUE 'AgentWorklog';

-- CreateTable
CREATE TABLE "AgentWorklog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),
    "modelName" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "AgentWorklog_pkey" PRIMARY KEY ("id")
);
