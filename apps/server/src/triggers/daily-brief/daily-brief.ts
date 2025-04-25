import { PrismaClient } from '@prisma/client';
import { dailyBriefPrompt, LLMModelEnum } from '@tegonhq/sigma-sdk';
import { task } from '@trigger.dev/sdk/v3';
import axios from 'axios';

import { pageGroomTask } from './page-groom';

const prisma = new PrismaClient();

export const dailyBriefTask = task({
  id: 'daily-brief',
  run: async (payload: { workspaceId: string }) => {
    const today = new Date();

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

    const { todayTaskIds, yesterdayTaskIds, dueTaskIds } =
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
    const nextWeekTasks = await getNextWeekTasks(payload.workspaceId);
    // Combine tasks from both taskOccurrences and tasks
    const tasksData = [
      `Today's tasks`,
      ...todayTasks.map(
        (task) =>
          `
          id: ${task.id},
          title: ${task.page.title}, 
          summary: ${task.summary?.[0]?.content || ''}, 
          suggestions: ${task.suggestion?.map((s) => `- ${s.content}`).join('\n') || ''},
          dueDate: ${task.dueDate ? new Date(task.dueDate).toISOString() : 'not set'}

          `,
      ),

      // Add section for due tasks if they exist
      ...(dueTasks.length > 0
        ? [
            `\nDue Today:`,
            ...dueTasks.map(
              (task) =>
                `
        id: ${task.id},
        title: ${task.page.title}, 
        summary: ${task.summary?.[0]?.content || ''}, 
        suggestions: ${task.suggestion?.map((s) => `- ${s.content}`).join('\n') || ''},
        dueDate: ${task.dueDate ? new Date(task.dueDate).toISOString() : 'not set'}
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
        id: ${task.id},
        title: ${task.page.title}, 
        summary: ${task.summary?.[0]?.content || ''}, 
        suggestions: ${task.suggestion?.map((s) => `- ${s.content}`).join('\n') || ''},
        dueDate: ${task.dueDate ? new Date(task.dueDate).toISOString() : 'not set'}
        `,
            ),
          ]
        : []),

      // Add section for next week's task occurrences
      ...(nextWeekTasks.length > 0
        ? [
            `\nUpcoming tasks for next week:`,
            ...nextWeekTasks.map(
              (task) =>
                `
        id: ${task.id},
        title: ${task.page.title}, 
        summary: ${task.summary?.[0]?.content || ''}, 
        dueDate: ${task.dueDate ? new Date(task.dueDate).toISOString() : 'not set'},
        startTime: ${task.startTime ? new Date(task.startTime).toISOString() : 'not set'},
        endTime: ${task.endTime ? new Date(task.endTime).toISOString() : 'not set'},
        status: ${task.status || 'not set'}
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
              role: 'system',
              content: dailyBriefPrompt
                .replace('{{TASK_LIST}}', tasksData.join('\n'))
                .replace('{{LOCAL_TIME}}', new Date().toISOString()),
            },
            {
              role: 'user',
              content:
                "Format my daily brief in paragraph style. I prefer a narrative flow that tells the story of my day in 2-4 concise paragraphs. Connect related activities and highlight the most important tasks.  Keep the entire brief concise and easy to read within 30 seconds. Also, suggest to me when to do tasks. so that I'll be efficient",
            },
          ],
          llmModel: LLMModelEnum.CLAUDESONNET,
          model: 'daily_brief',
        },
        { headers: { Authorization: `Bearer ${pat.token}` } },
      )
    ).data;

    const { title, brief } = extractBriefComponents(briefResponse);

    await prisma.brief.create({
      data: {
        workspace: { connect: { id: payload.workspaceId } },
        title,
        content: brief,
        date: today,
      },
    });

    return {
      brief,
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

function extractBriefComponents(response: string) {
  // Extract the entire daily brief content
  const briefMatch = response.match(/<daily_brief>([\s\S]*?)<\/daily_brief>/);

  if (!briefMatch) {
    return { title: null, brief: null };
  }

  // Extract title
  const titleMatch = briefMatch[1].match(/<title>([\s\S]*?)<\/title>/);
  const title = titleMatch ? titleMatch[1].trim() : null;

  // Extract brief content
  const briefContentMatch = briefMatch[1].match(/<brief>([\s\S]*?)<\/brief>/);
  const brief = briefContentMatch ? briefContentMatch[1].trim() : null;

  return { title, brief };
}

async function getNextWeekTasks(workspaceId: string) {
  const nextWeekStart = new Date();
  nextWeekStart.setDate(nextWeekStart.getDate() + 1); // Start from tomorrow
  const nextWeekEnd = new Date();
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 7); // One week ahead

  // Fetch task occurrences for next week
  const nextWeekTaskOccurrences = await prisma.taskOccurrence.findMany({
    where: {
      workspaceId,
      deleted: null,
      startTime: {
        gte: nextWeekStart,
        lte: nextWeekEnd,
      },
      task: {
        deleted: null,
        archived: null,
        completedAt: null,
        recurrence: null,
      },
    },
    include: {
      task: {
        include: {
          page: {
            select: {
              title: true,
            },
          },
          summary: {
            where: {
              deleted: null,
            },
            orderBy: {
              updatedAt: 'desc',
            },
            take: 1,
          },
          suggestion: {
            where: {
              deleted: null,
            },
          },
        },
      },
    },
    orderBy: [{ startTime: 'asc' }],
    take: 5, // Limit to a reasonable number of upcoming tasks
  });

  // Process the task occurrences into the format needed for the tasksData array
  const nextWeekTasks = nextWeekTaskOccurrences.map((occurrence) => ({
    id: occurrence.task.id,
    page: occurrence.task.page,
    summary: occurrence.task.summary,
    suggestion: occurrence.task.suggestion,
    startTime: occurrence.startTime,
    endTime: occurrence.endTime,
    dueDate: occurrence.task.dueDate,
    status: occurrence.status,
  }));

  // Get tasks with due dates in the next week
  const tasksWithDueDates = await prisma.task.findMany({
    where: {
      workspaceId,
      deleted: null,
      archived: null,
      completedAt: null,
      recurrence: null,
      dueDate: {
        gte: nextWeekStart,
        lte: nextWeekEnd,
      },
    },
    include: {
      page: {
        select: {
          title: true,
        },
      },
      summary: {
        where: {
          deleted: null,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 1,
      },
      suggestion: {
        where: {
          deleted: null,
        },
      },
    },
    orderBy: [{ dueDate: 'asc' }],
    take: 5, // Limit to a reasonable number of tasks
  });

  // Merge tasks with due dates into the nextWeekTasks array
  const tasksWithDueDatesFormatted = tasksWithDueDates.map((task) => ({
    id: task.id,
    page: task.page,
    summary: task.summary,
    suggestion: task.suggestion,
    startTime: null,
    endTime: null,
    dueDate: task.dueDate,
    status: task.status,
  }));

  // Combine both types of tasks
  return [...nextWeekTasks, ...tasksWithDueDatesFormatted];

  return nextWeekTasks;
}
