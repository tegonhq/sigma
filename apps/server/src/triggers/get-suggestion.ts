import { PrismaClient } from '@prisma/client';
import { LLMModelEnum, suggestionPrompt } from '@sigma/types';
import { task } from '@trigger.dev/sdk/v3';
import axios from 'axios';

const prisma = new PrismaClient();

export const getSuggestionTask = task({
  id: 'get-suggestion',
  run: async (payload: {
    taskId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activityData: Record<string, any>;
    pat: string;
    userId: string;
  }) => {
    const task = await prisma.task.findUnique({
      where: { id: payload.taskId },
      include: { page: true },
    });

    const existingSummary = await prisma.summary.findFirst({
      where: { taskId: payload.taskId, archived: null, deleted: null },
    });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    // Call your AI service endpoint
    const suggestionResponse = (
      await axios.post(
        `http://localhost:3001/v1/ai_requests`,
        {
          messages: [
            {
              role: 'user',
              content: suggestionPrompt
                .replace('{{ACTIVITY}}', JSON.stringify(payload.activityData))
                .replace('{{LOCAL_TIME}}', new Date().toISOString())
                .replace('{{CURRENT_USER}}', user.fullname)
                .replace('{{SUMMARY}}', existingSummary?.content || ''),
            },
          ],
          llmModel: LLMModelEnum.CLAUDESONNET,
          model: 'suggestion',
        },
        { headers: { Authorization: `Bearer ${payload.pat}` } },
      )
    ).data;

    const suggestionMatch = suggestionResponse.match(
      /<suggestion>([\s\S]*?)<\/suggestion>/,
    );
    const content = suggestionMatch ? suggestionMatch[1].trim() : '';

    // Create the summary
    const newSuggestion = await prisma.suggestion.create({
      data: {
        content,
        taskId: task.id,
      },
    });

    return {
      suggestion: newSuggestion,
    };
  },
});
