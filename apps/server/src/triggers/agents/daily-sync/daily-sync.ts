import { PrismaClient, UserType } from '@prisma/client';
import { Outlink, Preferences } from '@redplanethq/sol-sdk';
import { schedules } from '@trigger.dev/sdk/v3';
import axios from 'axios';
import { format, getHours, isSameDay } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

import { getDailySync } from './agent';
import { getDailyContext, getUserContextHTML } from '../utils/utils';

const prisma = new PrismaClient();

export const dailySyncSchedule = schedules.task({
  id: 'daily-sync-schedule',
  run: async (payload) => {
    const { externalId } = payload;

    const workspace = await prisma.workspace.findUnique({
      where: { id: externalId },
    });

    const timezone = (workspace.preferences as Preferences).timezone;

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

    return await dailySyncTask(workspace.id, timezone, workspace.userId);
  },
});

export async function dailySyncTask(
  workspaceId: string,
  timeZone: string,
  userId: string,
) {
  const today = new Date(new Date().toLocaleString('en-US', { timeZone }));

  const lastSyncedAt = await getLastSyncedAt(workspaceId, today);

  const page = (
    await axios.post(`/api/v1/pages/get-create`, {
      title: format(today, 'dd-MM-yyyy'),
      type: 'Daily',
    })
  ).data;

  const todayPage = page?.description;

  const rawPage = await prisma.page.findUnique({
    where: {
      id: page.id,
    },
    select: {
      id: true,
      outlinks: true,
    },
  });

  const outlinks = rawPage?.outlinks || [];
  const outlinkTaskIds = outlinks
    ? (outlinks as unknown as Outlink[])
        .filter((link: Outlink) => link.type === 'Task')
        .map((link) => link.id)
    : [];

  const todayTasks =
    outlinkTaskIds.length > 0 ? await getTasks(outlinkTaskIds) : [];

  // Combine tasks from both taskOccurrences and tasks
  const tasksData = [
    `Today's Page`,
    todayPage,
    `--------`,
    `Today's tasks`,
    ...todayTasks.map(
      (task) =>
        `
          id: ${task.id},
          title: ${task.page.title}, 
          dueDate: ${task.dueDate ? new Date(task.dueDate).toISOString() : 'not set'}

          `,
    ),
  ];

  const userContextPageHTML = await getUserContextHTML();
  const dailyContext = await getContext(workspaceId, userContextPageHTML);

  const { dailySyncContext, agents, memoryContext } = dailyContext;

  const context = {
    localTime: formatInTimeZone(
      today,
      timeZone,
      "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
    ),
    taskList: tasksData.join('\n'),
    syncRules: dailySyncContext,
    previousSyncs: await getTodaySyncs(workspaceId, today, timeZone),
    activity: await getActivity(workspaceId, lastSyncedAt),
  };

  const dailySync = await getDailySync(
    agents,
    workspaceId,
    JSON.stringify(context),
    memoryContext,
  );

  // Get the most recent sync for this workspace
  const lastSync = await getLastSync(workspaceId);

  // Determine the current hour and set the sync period label accordingly
  const hour = getHours(today);
  let syncPeriod = 'Morning Sync';
  if (hour >= 12 && hour < 17) {
    syncPeriod = 'Afternoon Sync';
  } else if (hour >= 17 || hour < 5) {
    syncPeriod = 'Evening Sync';
  }

  let conversationId: string = '';
  // If there is a sync today, reuse its conversation and update its title to the current sync period
  if (
    lastSync &&
    lastSync.syncedAt &&
    isSameDay(
      toZonedTime(lastSync.syncedAt, timeZone),
      toZonedTime(new Date(), timeZone),
    )
  ) {
    conversationId = lastSync.conversationId;
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { title: syncPeriod },
    });
  } else {
    // Otherwise, create a new conversation for this sync period
    const conversation = await prisma.conversation.create({
      data: { title: syncPeriod, workspaceId, userId },
      select: { id: true },
    });
    conversationId = conversation.id;
  }

  // Create a new sync record and link it to the conversation
  const sync = await prisma.sync.create({
    data: {
      workspace: { connect: { id: workspaceId } },
      title: dailySync.title,
      content: dailySync.sync,
      syncedAt: new Date(),
      conversation: { connect: { id: conversationId } },
    },
  });

  // Add a conversation history entry for this sync content
  await prisma.conversationHistory.create({
    data: {
      message: sync.content,
      userType: UserType.Agent,
      conversation: { connect: { id: conversationId } },
    },
  });
  return {
    title: dailySync.title,
    sync: dailySync.sync,
  };
}

async function getTasks(taskIds: string[]) {
  // Get all task occurrences for today for the specific workspace
  const tasks = await prisma.task.findMany({
    where: {
      deleted: null,
      id: {
        in: taskIds,
      },
    },
    include: {
      page: true,
    },
  });

  return tasks.map((task) => {
    return {
      id: task.id,
      page: task.page,
      startTime: task.startTime,
      endTime: task.endTime,
      dueDate: task.dueDate,
      status: task.status,
    };
  });
}

export async function getNextWeekTasks(workspaceId: string) {
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
        gte: nextWeekStart.toISOString(),
        lte: nextWeekEnd.toISOString(),
      },
    },
    orderBy: [{ startTime: 'asc' }],
    take: 5, // Limit to a reasonable number of upcoming tasks
  });

  // Process the task occurrences into the format needed for the tasksData array
  // Get task IDs from occurrences and fetch complete task data
  const nextWeekTaskIds = nextWeekTaskOccurrences.map(
    (occurrence) => occurrence.taskId,
  );
  const nextWeekTasks = await getTasks(nextWeekTaskIds);

  // Get tasks with due dates in the next week
  const tasksWithDueDates = await prisma.task.findMany({
    where: {
      workspaceId,
      deleted: null,
      archived: null,
      completedAt: null,
      dueDate: {
        gte: nextWeekStart.toISOString(),
        lte: nextWeekEnd.toISOString(),
      },
    },
    orderBy: [{ dueDate: 'asc' }],
    take: 5, // Limit to a reasonable number of tasks
  });

  const taskWithDueDatesIds = tasksWithDueDates.map((task) => task.id);
  // Merge tasks with due dates into the nextWeekTasks array
  const tasksWithDueDatesFormatted = await getTasks(taskWithDueDatesIds);

  // Combine both types of tasks
  return [...nextWeekTasks, ...tasksWithDueDatesFormatted];
}

async function getContext(
  workspaceId: string,
  userContextPageHTML: string,
): Promise<{
  dailySyncContext: string;
  agents: string[];
  memoryContext: string;
}> {
  const { dailyContext, memoryContext } = await getDailyContext(
    workspaceId,
    userContextPageHTML,
  );

  const dailySyncContext = dailyContext.join('\n\n');

  const agentPattern = /<agent data-id="([^"]+)">[^<]+<\/agent>/g;
  const foundAgents = new Set<string>();
  const matches = [...dailySyncContext.matchAll(agentPattern)];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  matches.map((match: any) => {
    if (match[1]) {
      foundAgents.add(match[1]);
    }
  });

  return {
    dailySyncContext,
    agents: Array.from(foundAgents),
    memoryContext: memoryContext.existingFacts.join('\n'),
  };
}

async function getLastSync(workspaceId: string) {
  return await prisma.sync.findFirst({
    where: {
      workspaceId,
      deleted: null,
      syncedAt: {
        not: null,
      },
    },
    orderBy: {
      syncedAt: 'desc',
    },
  });
}

async function getLastSyncedAt(workspaceId: string, today: Date) {
  const lastSync = await getLastSync(workspaceId);

  // If no previous sync exists, use today at 00:00:00 in the user's timezone
  let lastSyncedAt;
  if (lastSync?.syncedAt) {
    lastSyncedAt = lastSync.syncedAt;
  } else {
    // Create today at midnight in user's timezone
    const todayMidnight = new Date(today);
    todayMidnight.setHours(0, 0, 0, 0);
    lastSyncedAt = todayMidnight;
  }

  return lastSyncedAt;
}

async function getActivity(workspaceId: string, lastSyncedAt: Date) {
  const conversations = await prisma.conversation.findMany({
    where: {
      workspaceId,
      deleted: null,
      unread: true,
      createdAt: {
        gte: lastSyncedAt,
      },
      activityId: {
        not: null,
      },
    },
    select: {
      id: true,
      ConversationHistory: {
        where: {
          deleted: null,
        },
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          message: true,
          userType: true,
          createdAt: true,
        },
      },
    },
  });

  // Format each conversation to show user message and assistant response
  const formattedActivities = conversations.map((conv) => {
    const userMessages = conv.ConversationHistory.filter(
      (msg) => msg.userType === 'User',
    );
    const assistantMessages = conv.ConversationHistory.filter(
      (msg) => msg.userType === 'Agent',
    );

    // Format activity source and conversation
    return `
    User: ${userMessages[0]?.message || 'No user message'}
    Assistant: ${assistantMessages[0]?.message || 'No assistant response'}`;
  });

  // Join all activities with a separator
  return formattedActivities.length > 0
    ? formattedActivities.join('\n\n--------\n\n')
    : 'No recent activities';
}

async function getTodaySyncs(
  workspaceId: string,
  today: Date,
  timeZone: string,
) {
  // Get today's date at 00:00:00 in the user's timezone
  today.setHours(0, 0, 0, 0);

  const syncs = await prisma.sync.findMany({
    where: {
      workspaceId,
      deleted: null,
      syncedAt: {
        gte: today, // Only syncs from today
      },
    },
    orderBy: {
      syncedAt: 'desc',
    },
  });

  // Format each sync as requested
  const formattedSyncs = syncs.map((sync) => {
    // Convert date to user's timezone in a simpler way
    const syncDate = new Date(sync.syncedAt || sync.createdAt);
    const localSyncTime = syncDate.toLocaleString('en-US', { timeZone });

    return `
    sync_at: ${format(localSyncTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")}
    sync_content: ${sync.content}`;
  });

  // Join with separator
  return formattedSyncs.length > 0
    ? formattedSyncs.join('\n\n------\n\n')
    : 'No syncs today';
}
