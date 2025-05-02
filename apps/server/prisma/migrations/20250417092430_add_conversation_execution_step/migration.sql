-- CreateTable
CREATE TABLE "ConversationExecutionStep" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),
    "thought" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "ConversationExecutionStep_pkey" PRIMARY KEY ("id")
);
