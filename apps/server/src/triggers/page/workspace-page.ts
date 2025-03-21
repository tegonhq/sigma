import { PrismaClient } from '@prisma/client';
import { task } from '@trigger.dev/sdk/v3';

import { processTaskOccurrences } from './task-occurrence';

const prisma = new PrismaClient();

export const processWorkspacePage = task({
  id: 'process-workspace-page',
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
    const workspace = await prisma.workspace.findUnique({
      where: { id: payload.workspaceId },
    });
    const pat = await prisma.personalAccessToken.findFirst({
      where: { userId: workspace.userId, name: 'default' },
    });

    let result;
    // Handle empty tasks case
    if (tasks.length) {
      result = await processTaskOccurrences.triggerAndWait({
        taskIds: tasks.map((t) => t.id),
        startDate: payload.startDate,
        endDate: payload.endDate,
        pat: pat.token,
      });

      if (result.ok) {
      }
    }

    return {
      workspaceId: payload.workspaceId,
      result,
    };
  },
});
