import { PrismaClient } from '@prisma/client';
import { conversationTitlePrompt, LLMModelEnum } from '@redplanethq/sol-sdk';
import { logger, task } from '@trigger.dev/sdk/v3';
import axios from 'axios';

const prisma = new PrismaClient();
export const createConversationTitle = task({
  id: 'create-conversation-title',
  run: async (payload: {
    conversationId: string;
    message: string;
    pat: string;
  }) => {
    const conversationTitleResponse = (
      await axios.post(
        `${process.env.BACKEND_HOST}/v1/ai_requests`,
        {
          messages: [
            {
              role: 'user',
              content: conversationTitlePrompt.replace(
                '{{message}}',
                payload.message,
              ),
            },
          ],
          llmModel: LLMModelEnum.CLAUDESONNET,
          model: 'beautify',
        },
        { headers: { Authorization: `Bearer ${payload.pat}` } },
      )
    ).data;

    const outputMatch = conversationTitleResponse.match(
      /<output>(.*?)<\/output>/s,
    );

    logger.info(`Conversation title data: ${JSON.stringify(outputMatch)}`);

    if (!outputMatch) {
      logger.error('No output found in recurrence response');
      throw new Error('Invalid response format from AI');
    }

    const jsonStr = outputMatch[1].trim();
    const conversationTitleData = JSON.parse(jsonStr);

    if (conversationTitleData) {
      await prisma.conversation.update({
        where: {
          id: payload.conversationId,
        },
        data: {
          title: conversationTitleData.title,
        },
      });
    }
  },
});
