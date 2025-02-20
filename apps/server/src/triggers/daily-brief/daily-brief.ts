import { PrismaClient } from '@prisma/client';
import {
  dailyBriefPrompt,
  LLMModelEnum,
  Page,
  UserTypeEnum,
} from '@sigma/types';
import { task } from '@trigger.dev/sdk/v3';
import axios from 'axios';

const prisma = new PrismaClient();

// ... imports ...

export const dailyBriefTask = task({
  id: 'daily-brief',
  run: async (payload: { workspaceId: string }) => {
    const today = new Date();
    const formattedDate = today
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      .split('/')
      .join('-');
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const workspace = await prisma.workspace.findUnique({
      where: { id: payload.workspaceId },
    });
    const pat = await prisma.personalAccessToken.findFirst({
      where: { userId: workspace.userId, name: 'default' },
    });

    let page: Page;
    page = await prisma.page.findFirst({
      where: { type: 'Daily', title: formattedDate },
    });
    if (!page) {
      page = await prisma.page.create({
        data: {
          title: formattedDate,
          type: 'Daily',
          workspace: { connect: { id: payload.workspaceId } },
          sortOrder: 'a0',
        },
      });
    }

    // Get all task occurrences for today for the specific workspace
    const taskOccurrences = await prisma.taskOccurrence.findMany({
      where: {
        deleted: null,
        task: {
          workspaceId: payload.workspaceId,
        },
        OR: [
          {
            startTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          {
            endTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        ],
      },
      include: {
        task: {
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
        },
      },
    });

    const tasks = await prisma.task.findMany({
      where: {
        deleted: null,
        workspaceId: payload.workspaceId,
        OR: [
          { dueDate: { gte: startOfDay, lte: endOfDay } },
          { remindAt: { gte: startOfDay, lte: endOfDay } },
        ],
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

    // Skip if no tasks for today
    if (taskOccurrences.length === 0 && tasks.length === 0) {
      return {
        message: 'No tasks scheduled for today',
        tasksCount: 0,
      };
    }

    // Combine tasks from both taskOccurrences and tasks
    const tasksData = [
      ...taskOccurrences.map(
        (occurrence) =>
          `
          title: ${occurrence.task.page.title}, 
          summary: ${occurrence.task.summary?.[0]?.content || ''}, 
          suggestions: ${occurrence.task.suggestion?.map((s) => `- ${s.content}`).join('\n') || ''}
          
          `,
      ),
      ...tasks.map(
        (task) =>
          `
          title: ${task.page.title},
          summary: ${task.summary?.[0]?.content || ''},
          suggestions: ${task.suggestion?.map((s) => `- ${s.content}`).join('\n') || ''}
          
          `,
      ),
    ];

    // Call your AI service endpoint
    const briefResponse = (
      await axios.post(
        `http://localhost:3001/v1/ai_requests`,
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
      tasksCount: taskOccurrences.length,
    };
  },
});
