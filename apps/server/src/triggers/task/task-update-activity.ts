import { PrismaClient } from '@prisma/client';
import { Task, TaskHookContext } from '@redplanethq/sol-sdk';
import { runs, schedules, task, tasks } from '@trigger.dev/sdk/v3';

import { taskReminder } from './task-reminder';

const prisma = new PrismaClient();

async function createReminders(task: Task) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const taskMetadata = task.metadata as any;

  if (task.recurrence?.length) {
    // Create schedule to run daily 10 minutes before task start time
    const startTime = new Date(task.startTime);
    const cronMinutes = startTime.getMinutes() - 10;
    const cronHours = startTime.getHours();

    const scheduleId = await schedules.create({
      task: `task-run-schedule`,
      cron: `${cronMinutes} ${cronHours} * * *`, // Run daily at startTime - 10min
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      timezone: (task.workspace.preferences as any).timezone,
      deduplicationKey: task.id,
      externalId: task.id,
    });

    // Save scheduleId in task metadata
    await prisma.task.update({
      where: { id: task.id },
      data: {
        metadata: {
          ...taskMetadata,
          scheduleId,
        },
      },
    });
  } else if (task.startTime && task.endTime) {
    // Create one-time delayed run
    const startTime = new Date(task.startTime);
    startTime.setMinutes(startTime.getMinutes() - 10);

    const runId = await tasks.trigger<typeof taskReminder>('task-reminder', {
      taskId: task.id,
    });

    // Save runId in task metadata
    await prisma.task.update({
      where: { id: task.id },
      data: {
        metadata: {
          ...taskMetadata,
          runId,
        },
      },
    });
  }
}

async function clearReminders(task: Task) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const taskMetadata = task.metadata as any;

  // Delete existing schedule/run if exists
  if (taskMetadata?.scheduleId) {
    await schedules.del(taskMetadata.scheduleId);

    // Remove scheduleId from metadata
    await prisma.task.update({
      where: { id: task.id },
      data: {
        metadata: {
          ...taskMetadata,
          scheduleId: undefined,
        },
      },
    });
  }

  if (taskMetadata?.runId) {
    await runs.cancel(taskMetadata.runId);

    // Remove runId from metadata
    await prisma.task.update({
      where: { id: task.id },
      data: {
        metadata: {
          ...taskMetadata,
          runId: undefined,
        },
      },
    });
  }
}

export const taskActivityHandler = task({
  id: 'task-activity-handler',
  queue: {
    name: 'task-activity-handler',
    concurrencyLimit: 10,
  },
  run: async (payload: { task: Task; context: TaskHookContext }) => {
    const { task, context } = payload;

    if (context.action === 'create') {
      await createReminders(task);
      return { message: 'Handled schedule create' };
    }

    if (context.action === 'update') {
      if (
        context.changeData &&
        (context.changeData.recurrence?.newValue ||
          context.changeData.startTime?.newValue ||
          context.changeData.endTime?.newValue)
      ) {
        await clearReminders(task);
        // Create new schedule/run based on updated values
        await createReminders(task);
      }
      return { message: 'Handled schedule update' };
    }

    await clearReminders(task);
    return { message: 'Handled schedule delete' };
  },
});
