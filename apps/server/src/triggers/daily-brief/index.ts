import { PrismaClient } from '@prisma/client';
import { schedules } from '@trigger.dev/sdk/v3';

import { dailyBriefTask } from './daily-brief';

const prisma = new PrismaClient();
export const scheduleDailyBrief = schedules.task({
  id: 'schedule-daily-brief',
  cron: '0 0 * * *',
  run: async () => {
    const workspaces = await prisma.workspace.findMany({
      where: { deleted: null },
      select: { id: true },
    });

    // Get system PAT for each workspace
    const workspacePats = await Promise.all(
      workspaces.map(async (workspace) => ({
        workspaceId: workspace.id,
      })),
    );

    const results = await dailyBriefTask.batchTriggerAndWait(
      workspacePats.map((wp) => ({
        payload: {
          workspaceId: wp.workspaceId,
        },
      })),
    );

    return {
      workspacesProcessed: results.runs.length,
      results,
    };
  },
});
