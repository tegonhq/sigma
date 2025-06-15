import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { format } from 'date-fns';

import {
  getCurrentTaskIds,
  getTaskListsInPage,
  updateTaskListsInPage,
  upsertTasksInPage,
} from './page-utils';

export function getTaskItemContent(title: string) {
  return [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: title,
        },
      ],
    },
  ];
}

const prisma = new PrismaClient();

export async function pageGroomTask(workspaceId: string, timeZone: string) {
  // Get today's date in the workspace's timezone
  const today = new Date(new Date().toLocaleString('en-US', { timeZone }));

  const formattedDate = format(today, 'dd-MM-yyyy');
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const page = await prisma.page.findFirst({
    where: { title: formattedDate, workspaceId },
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
        workspaceId,
        deleted: null,
      },
      workspaceId,
      deleted: null,
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
      workspaceId,
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
  const yesterdayTasks = await getIncompletePastDayTasks(today, workspaceId);

  // Filter out tasks that are already in due tasks or today tasks
  const yesterdayTasksFiltered = yesterdayTasks.filter(
    (task) => !dueTaskIds.includes(task.id) && !todayTaskIds.includes(task.id),
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
        type: 'heading',
        attrs: { level: 2 },
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
    await axios.post(`/api/v1/pages/${page.id}`, {
      description: JSON.stringify(updatedDescription),
    });
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
}

async function getIncompletePastDayTasks(today: Date, workspaceId: string) {
  today.setDate(today.getDate() - 1);
  const yesterdayFormattedDate = format(today, 'dd-MM-yyyy');

  const yesterdayPage = await prisma.page.findFirst({
    where: { title: yesterdayFormattedDate, workspaceId },
  });

  const taskLists = getTaskListsInPage(yesterdayPage);

  const yesterdayTaskIds = getCurrentTaskIds({ content: taskLists });

  const yesterdayTasks = await prisma.task.findMany({
    where: { id: { in: yesterdayTaskIds } },
    include: { page: true },
  });

  return yesterdayTasks.filter(
    (task) => !['Done', 'Canceled'].includes(task.status),
  );
}
