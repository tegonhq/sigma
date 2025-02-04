import { PrismaClient } from '@prisma/client';
import { schedules } from '@trigger.dev/sdk/v3';

import { processWorkspaceTasks } from './workspace-tasks';

const prisma = new PrismaClient();

export const scheduleTaskOccurance = schedules.task({
  id: 'schedule-workspaces',
  cron: '0 0 * * *',
  run: async () => {
    const workspaces = await prisma.workspace.findMany({
      where: { deleted: null },
      select: { id: true },
    });

    const startDate = new Date();
    startDate.setHours(5, 0, 0, 0);
    const endDate = new Date();
    endDate.setHours(5, 0, 0, 0);
    endDate.setDate(endDate.getDate() + 1);

    const results = await processWorkspaceTasks.batchTriggerAndWait(
      workspaces.map((workspace) => ({
        payload: {
          workspaceId: workspace.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      })),
    );

    return {
      workspacesProcessed: results.runs.length,
      results,
    };
  },
});
