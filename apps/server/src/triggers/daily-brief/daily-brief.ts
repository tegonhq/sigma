import { PrismaClient } from '@prisma/client';
import {
  dailyBriefPrompt,
  LLMModelEnum,
  UserTypeEnum,
} from '@tegonhq/sigma-sdk';
import { task } from '@trigger.dev/sdk/v3';
import axios from 'axios';
import { format } from 'date-fns';

import { pageGroomTask } from './page-groom';

const prisma = new PrismaClient();

export const dailyBriefTask = task({
  id: 'daily-brief',
  run: async (payload: { workspaceId: string }) => {
    const today = new Date();
    const formattedDate = format(today, 'dd-MM-yyyy');

    const workspace = await prisma.workspace.findUnique({
      where: { id: payload.workspaceId },
    });
    const pat = await prisma.personalAccessToken.findFirst({
      where: { userId: workspace.userId, name: 'default' },
    });

    const pageGroomResponse = await pageGroomTask.triggerAndWait({
      workspaceId: workspace.id,
    });

    if (!pageGroomResponse.ok) {
      throw new Error('Failed to groom page');
    }

    const { page, todayTaskIds, yesterdayTaskIds, dueTaskIds } =
      pageGroomResponse.output;

    // Skip if no tasks for today
    if (
      todayTaskIds.length === 0 ||
      yesterdayTaskIds.length === 0 ||
      dueTaskIds.length === 0
    ) {
      return {
        message: 'No tasks scheduled for today',
        tasksCount: 0,
      };
    }

    const todayTasks = await getTasks(todayTaskIds);
    const yesterdayTasks = await getTasks(yesterdayTaskIds);
    const dueTasks = await getTasks(dueTaskIds);
    // Combine tasks from both taskOccurrences and tasks
    const tasksData = [
      `Today's tasks`,
      ...todayTasks.map(
        (task) =>
          `
          title: ${task.page.title}, 
          summary: ${task.summary?.[0]?.content || ''}, 
          suggestions: ${task.suggestion?.map((s) => `- ${s.content}`).join('\n') || ''}

          `,
      ),

      // Add section for due tasks if they exist
      ...(dueTasks.length > 0
        ? [
            `\nDue Today:`,
            ...dueTasks.map(
              (task) =>
                `
        title: ${task.page.title}, 
        summary: ${task.summary?.[0]?.content || ''}, 
        suggestions: ${task.suggestion?.map((s) => `- ${s.content}`).join('\n') || ''}
        `,
            ),
          ]
        : []),

      // Add section for yesterday's incomplete tasks if they exist
      ...(yesterdayTasks.length > 0
        ? [
            `\nIncomplete tasks from yesterday:`,
            ...yesterdayTasks.map(
              (task) =>
                `
        title: ${task.page.title}, 
        summary: ${task.summary?.[0]?.content || ''}, 
        suggestions: ${task.suggestion?.map((s) => `- ${s.content}`).join('\n') || ''}
        `,
            ),
          ]
        : []),
    ];

    // Call your AI service endpoint
    const briefResponse = (
      await axios.post(
        `${process.env.BACKEND_HOST}/v1/ai_requests`,
        {
          messages: [
            {
              role: 'user',
              content: dailyBriefPrompt
                .replace('{{TASK_LIST}}', tasksData.join('\n'))
                .replace('{{LOCAL_TIME}}', new Date().toISOString()),
            },
          ],
          llmModel: LLMModelEnum.CLAUDESONNET,
          model: 'daily_brief',
        },
        { headers: { Authorization: `Bearer ${pat.token}` } },
      )
    ).data;

    const briefMatch = briefResponse.match(
      /<daily_brief>([\s\S]*?)<\/daily_brief>/,
    );
    const dailyBrief = briefMatch
      ? briefMatch[1]
          .trim()
          .replace(/\n/g, '') // Remove all newlines
          .replace(/\\n/g, '') // Remove escaped newlines
      : '';

    await prisma.conversation.create({
      data: {
        workspace: { connect: { id: payload.workspaceId } },
        title: formattedDate,
        page: { connect: { id: page.id } },
        user: { connect: { id: workspace.userId } },
        ConversationHistory: {
          create: {
            message: dailyBrief,
            userType: UserTypeEnum.System,
          },
        },
      },
    });

    return {
      brief: dailyBrief,
    };
  },
});

async function getTasks(taskIds: string[]) {
  // Get all task occurrences for today for the specific workspace
  return await prisma.task.findMany({
    where: {
      deleted: null,
      id: {
        in: taskIds,
      },
    },
    include: {
      page: true,
      summary: {
        where: {
          archived: null,
          deleted: null,
        },
      },
      suggestion: true,
    },
  });
}
