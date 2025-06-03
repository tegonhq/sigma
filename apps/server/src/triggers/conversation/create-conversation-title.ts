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
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: payload.conversationId,
      },
    });

    const activity =
      conversation.activityId &&
      (await prisma.activity.findUnique({
        where: { id: conversation.activityId },
        include: {
          integrationAccount: {
            include: {
              integrationDefinition: true,
            },
          },
        },
      }));

    const isActivity = !!conversation.activityId;
    const activitySource =
      activity?.integrationAccount.integrationDefinition.name;

    const conversationTitleResponse = (
      await axios.post(
        `${process.env.BACKEND_HOST}/v1/ai_requests`,
        {
          messages: [
            {
              role: 'user',
              content: conversationTitlePrompt
                .replace('{{message}}', payload.message)
                .replace('{{isActivity}}', isActivity.toString())
                .replace('{{activitySource}}', activitySource),
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
