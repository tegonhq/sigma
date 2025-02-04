import { PrismaClient } from '@prisma/client';
import { task } from '@trigger.dev/sdk/v3';

import { processTaskOccurrences } from './task-occurance';

const prisma = new PrismaClient();

export const processWorkspaceTasks = task({
  id: 'process-workspace-tasks',
  run: async (payload: {
    workspaceId: string;
    startDate: string;
    endDate: string;
  }) => {
    const tasks = await prisma.task.findMany({
      where: {
        workspaceId: payload.workspaceId,
        deleted: null,
        recurrence: { isEmpty: false },
      },
    });

    // Handle empty tasks case
    if (!tasks.length) {
      return {
        workspaceId: payload.workspaceId,
        tasksProcessed: 0,
        message: 'No recurring tasks found for workspace',
      };
    }

    const results = await processTaskOccurrences.batchTriggerAndWait(
      tasks.map((task) => ({
        payload: {
          taskId: task.id,
          startDate: payload.startDate,
          endDate: payload.endDate,
        },
      })),
    );

    return {
      workspaceId: payload.workspaceId,
      tasksProcessed: results.runs.length,
      results,
    };
  },
});
