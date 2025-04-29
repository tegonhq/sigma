import { PrismaClient } from '@prisma/client';
import { task } from '@trigger.dev/sdk/v3';
import axios from 'axios';
import { format } from 'date-fns';

import { getTaskItemContent } from 'modules/pages/pages.utils';

import {
  getCurrentTaskIds,
  getTaskListsInPage,
  updateTaskListsInPage,
  upsertTasksInPage,
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

    // Get existing task lists
    let taskLists = getTaskListsInPage(page);

    // If no task lists exist, create an empty array
    if (taskLists.length === 0) {
      taskLists = [
        {
          type: 'taskList',
          attrs: { class: 'task-list' },
          content: [],
        },
      ];
    }

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

    // Add task occurrences to the task list
    taskLists = upsertTasksInPage(
      taskLists,
      taskOccurrences.map((occurrence) => occurrence.task),
    );

    // Update the page with the task lists
    let updatedDescription = updateTaskListsInPage(page, taskLists);

    // Get all task IDs currently in the page
    const todayTaskIds = getCurrentTaskIds({ content: taskLists });

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
      // Parse the updated description
      const descriptionJson = updatedDescription;

      // Add section header for due tasks
      descriptionJson.content.push(
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
        // Add a new task list for due tasks
        {
          type: 'taskList',
          attrs: { class: 'task-list' },
          content: dueTasks.map((task) => ({
            type: 'taskItem',
            attrs: {
              id: task.id,
            },
            content: getTaskItemContent(task.page.title),
          })),
        },
      );
      updatedDescription = descriptionJson;
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
      // Parse the updated description
      const descriptionJson = updatedDescription;

      // Add section header for yesterday's tasks
      descriptionJson.content.push(
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
        // Add a new task list for yesterday's tasks
        {
          type: 'taskList',
          attrs: { class: 'task-list' },
          content: yesterdayTasksFiltered.map((task) => ({
            type: 'taskItem',
            attrs: {
              id: task.id,
            },
            content: getTaskItemContent(task.page.title),
          })),
        },
      );
      // Update the description
      updatedDescription = descriptionJson;
    }

    try {
      await axios.post(
        `${process.env.BACKEND_HOST}/v1/pages/${page.id}`,
        {
          description: JSON.stringify(updatedDescription),
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

  const yesterdayTaskIds = getCurrentTaskIds(yesterdayPage);

  const yesterdayTasks = await prisma.task.findMany({
    where: { id: { in: yesterdayTaskIds } },
    include: { page: true },
  });

  return yesterdayTasks.filter(
    (task) => !['Done', 'Canceled'].includes(task.status),
  );
}
