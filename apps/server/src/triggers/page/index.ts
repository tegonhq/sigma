import { PrismaClient } from '@prisma/client';
import { schedules } from '@trigger.dev/sdk/v3';

import { processWorkspacePage } from './workspace-page';

const prisma = new PrismaClient();

export const schedulePageTaskOccurence = schedules.task({
  id: 'schedule-page-task-occurence',
  cron: '0 0 * * *',
  run: async () => {
    const workspaces = await prisma.workspace.findMany({
      where: { deleted: null },
      select: { id: true },
    });

    // Set up dates for the next 31st day
    const startDate = new Date();
    startDate.setHours(5, 0, 0, 0);
    startDate.setDate(startDate.getDate() + 30);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const results = await processWorkspacePage.batchTriggerAndWait(
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
