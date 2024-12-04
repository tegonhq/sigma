-- AddForeignKey
ALTER TABLE "ConversationHistory" ADD CONSTRAINT "ConversationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
