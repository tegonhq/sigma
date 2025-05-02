import { PrismaClient } from '@prisma/client';
import {
  LLMModelEnum,
  summaryExamples,
  summaryPrompt,
} from '@tegonhq/sigma-sdk';
import { task } from '@trigger.dev/sdk/v3';
import axios from 'axios';

const prisma = new PrismaClient();

export const generateSummaryTask = task({
  id: 'generate-summary',
  run: async (payload: {
    taskId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    summaryData: Record<string, any>;
    pat: string;
    userId: string;
  }) => {
    const task = await prisma.task.findUnique({
      where: { id: payload.taskId },
      include: { page: true },
    });

    if (!task.page.description) {
      return { message: 'Task page is empty to generate summary' };
    }

    const existingSummary = await prisma.summary.findFirst({
      where: { taskId: payload.taskId, archived: null, deleted: null },
    });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    // Call your AI service endpoint
    const summaryResponse = (
      await axios.post(
        `http://localhost:3001/v1/ai_requests`,
        {
          messages: [
            { role: 'user', content: summaryExamples },
            {
              role: 'user',
              content: summaryPrompt
                .replace('{{TASK_DATA}}', JSON.stringify(payload.summaryData))
                .replace('{{LOCAL_TIME}}', new Date().toISOString())
                .replace('{{CURRENT_USER}}', user.fullname)
                .replace(
                  '{{EXISTING_SUMMARY}}',
                  existingSummary?.content || '',
                ),
            },
          ],
          llmModel: LLMModelEnum.CLAUDESONNET,
          model: 'summary',
        },
        { headers: { Authorization: `Bearer ${payload.pat}` } },
      )
    ).data;

    const summaryMatch = summaryResponse.match(
      /<summary>([\s\S]*?)<\/summary>/,
    );
    const content = summaryMatch ? summaryMatch[1].trim() : '';

    // Archive existing summary if it exists and is not deleted
    if (existingSummary) {
      await prisma.summary.update({
        where: { id: existingSummary.id },
        data: { archived: new Date().toISOString() },
      });
    }

    // Create the summary
    const newSummary = await prisma.summary.create({
      data: {
        content,
        taskId: task.id,
      },
    });

    return {
      summary: newSummary,
    };
  },
});
