import { PrismaClient } from '@prisma/client';
import { PageTypeEnum } from '@sigma/types';
import { task } from '@trigger.dev/sdk/v3';
import axios from 'axios';
import { format } from 'date-fns';

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
    const startDate = new Date(payload.startDate);
    const formattedDate = format(startDate, 'dd-MM-yyyy');

    // Handle empty tasks case
    let taskIds: string[] = [];
    if (tasks.length) {
      const result = await processTaskOccurrences.triggerAndWait({
        taskIds: tasks.map((t) => t.id),
        startDate: payload.startDate,
        endDate: payload.endDate,
      });

      if (result.ok) {
        taskIds = result.output.map((result) => result.taskId);
      }
    }

    await axios.get(`${process.env.BACKEND_HOST}/v1/pages`, {
      params: {
        title: formattedDate,
        type: PageTypeEnum.Daily,
        taskIds,
      },
      headers: { Authorization: `Bearer ${pat.token}` },
    });

    return {
      workspaceId: payload.workspaceId,
      tasksProcessed: taskIds.length,
    };
  },
});
