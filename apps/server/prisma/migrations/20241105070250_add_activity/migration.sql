-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),
    "type" TEXT NOT NULL,
    "eventData" JSONB NOT NULL,
    "name" TEXT NOT NULL,
    "integrationAccountId" TEXT,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_integrationAccountId_fkey" FOREIGN KEY ("integrationAccountId") REFERENCES "IntegrationAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
