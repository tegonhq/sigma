import { PrismaClient } from '@prisma/client';
import { convertTiptapJsonToHtml } from '@sigma/editor-extensions';
import { LLMModelEnum } from '@tegonhq/sigma-sdk';
import { logger, task } from '@trigger.dev/sdk/v3';
import axios from 'axios';

import { MEMORY_MERGE_SYSTEM_PROMPT, MEMORY_MERGE_USER_PROMPT } from './prompt';

const prisma = new PrismaClient();

export const memoryUpdateSchedule = task({
  id: 'memory-update-schedule',
  run: async (payload: { conversationId: string }) => {
    const { conversationId } = payload;

    const conversations = await prisma.conversationHistory.findMany({
      where: { conversationId, userType: 'Agent' },
      include: { conversation: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const memory: Record<string, any> = { newFacts: [], deleteFacts: [] };
    conversations.forEach((conversation) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conversationThought = conversation.thoughts as Record<string, any>;
      if (conversationThought?.memory) {
        const { newFacts, deleteFacts } = conversationThought.memory;
        memory.newFacts.push(...newFacts);
        memory.deleteFacts.push(...deleteFacts);
      }
    });

    const workspace = await prisma.workspace.findUnique({
      where: { id: conversations[0].conversation.workspaceId },
    });

    const userContextPage = await prisma.page.findFirst({
      where: {
        workspaceId: workspace.id,
        type: 'Context',
      },
    });
    const userContextPageHTML = userContextPage.description
      ? convertTiptapJsonToHtml(JSON.parse(userContextPage.description))
      : '';

    const pat = await prisma.personalAccessToken.findFirst({
      where: { userId: workspace.userId as string, name: 'default' },
    });

    axios.interceptors.request.use((config) => {
      // Check if URL starts with /api and doesn't have a full host

      if (config.url?.startsWith('/api')) {
        config.url = `${process.env.BACKEND_HOST}${config.url.replace('/api', '')}`;
        config.headers.Authorization = `Bearer ${pat?.token}`;
      }

      return config;
    });

    const memoryResponse = (
      await axios.post(`/api/v1/ai_requests`, {
        messages: [
          {
            role: 'system',
            content: MEMORY_MERGE_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: MEMORY_MERGE_USER_PROMPT.replace(
              '{{CURRENT_MEMORY}}',
              userContextPageHTML,
            ).replace('{{UPDATE_MEMORY}}', JSON.stringify(memory)),
          },
        ],
        llmModel: LLMModelEnum.GPT41MINI,
        model: 'memoryUpdate',
      })
    ).data;

    const outputRegex = /<output>([\s\S]*?)<\/output>/;
    const match = memoryResponse.match(outputRegex);

    let updatedMemory = '';
    if (match && match[1]) {
      try {
        const [, htmlContent] = match;
        updatedMemory = htmlContent;
      } catch (e) {
        logger.error(`Failed to parse memory response: ${e}`);
        updatedMemory = userContextPageHTML;
      }
    }

    return (
      await axios.post(`/api/v1/pages/${userContextPage.id}`, {
        htmlDescription: updatedMemory,
      })
    ).data;
  },
});
