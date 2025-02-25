import { PrismaClient } from '@prisma/client';
import { task } from '@trigger.dev/sdk/v3';
import axios from 'axios';
import { format } from 'date-fns';

import {
  getTaskExtensionInPage,
  getCurrentTaskIds,
  updateTaskExtensionInPage,
  upsertTaskInExtension,
} from './page-utils';

const prisma = new PrismaClient();

export const pageGroomTask = task({
  id: 'page-groom',
  run: async (payload: { workspaceId: string }) => {
    const today = new Date();
    const formattedDate = format(today, 'dd-MM-yyyy');
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const workspace = await prisma.workspace.findUnique({
      where: { id: payload.workspaceId },
    });
    const pat = await prisma.personalAccessToken.findFirst({
      where: { userId: workspace.userId, name: 'default' },
    });

    const page = await prisma.page.findFirst({
      where: { title: formattedDate },
    });
    let taskExtension = getTaskExtensionInPage(page);

    // 1. Get task occurrences for today
    const taskOccurrences = await prisma.taskOccurrence.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        endTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        task: {
          workspaceId: payload.workspaceId,
          deleted: null,
        },
      },
      include: {
        task: { include: { page: true } },
      },
    });

    taskExtension = upsertTaskInExtension(
      taskExtension,
      taskOccurrences.map((occurrence) => occurrence.task),
    );

    const todayTaskIds = getCurrentTaskIds(taskExtension);

    // 2. Get tasks due today
    const dueTasks = await prisma.task.findMany({
      where: {
        workspaceId: payload.workspaceId,
        deleted: null,
        dueDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        id: { notIn: todayTaskIds },
      },
      include: { page: true },
    });

    if (dueTasks && dueTasks.length > 0) {
      taskExtension.content.push(
        {
          type: 'paragraph',
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: "Today's Due tasks",
            },
          ],
        },
      );
      taskExtension = upsertTaskInExtension(taskExtension, dueTasks);
    }

    const dueTaskIds = dueTasks.map((t) => t.id);
    // 3. Get uncompleted tasks from previous day
    const yesterdayTasks = await getIncompletePastDayTasks();

    // Filter out tasks that are already in due tasks or today tasks
    const yesterdayTasksFiltered = yesterdayTasks.filter(
      (task) =>
        !dueTaskIds.includes(task.id) && !todayTaskIds.includes(task.id),
    );

    if (yesterdayTasksFiltered && yesterdayTasksFiltered.length > 0) {
      taskExtension.content.push(
        {
          type: 'paragraph',
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Tasks from yesterday',
            },
          ],
        },
      );
      taskExtension = upsertTaskInExtension(
        taskExtension,
        yesterdayTasksFiltered,
      );
    }

    const pageDescription = updateTaskExtensionInPage(page, taskExtension);

    try {
      await axios.post(
        `${process.env.BACKEND_HOST}/v1/pages/${page.id}`,
        {
          description: pageDescription,
        },
        { headers: { Authorization: `Bearer ${pat.token}` } },
      );
    } catch (e) {
      console.log(e);
      throw e;
    }

    return {
      page,
      todayTaskIds,
      dueTaskIds,
      yesterdayTaskIds: yesterdayTasksFiltered.map((t) => t.id),
    };
  },
});

async function getIncompletePastDayTasks() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayFormattedDate = format(yesterday, 'dd-MM-yyyy');

  const yesterdayPage = await prisma.page.findFirst({
    where: { title: yesterdayFormattedDate },
  });

  const yesterdayTaskExtension = getTaskExtensionInPage(yesterdayPage);
  const yesterdayTaskIds = getCurrentTaskIds(yesterdayTaskExtension);

  const yesterdayTasks = await prisma.task.findMany({
    where: { id: { in: yesterdayTaskIds } },
    include: { page: true },
  });

  return yesterdayTasks.filter(
    (task) => !['Done', 'Canceled'].includes(task.status),
  );
}
